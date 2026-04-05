const http = require('http');
const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');
const { registerSocketHandlers, rooms } = require('../socket');

let httpServer;
let serverIo;
let port;

beforeAll((done) => {
  httpServer = http.createServer();
  serverIo = new Server(httpServer);
  registerSocketHandlers(serverIo);
  httpServer.listen(() => {
    port = httpServer.address().port;
    done();
  });
});

afterAll((done) => {
  serverIo.close(done);
});

afterEach(() => {
  rooms.clear();
});

function makeClient() {
  return Client(`http://localhost:${port}`, { forceNew: true, reconnection: false });
}

function waitFor(socket, event) {
  return new Promise((resolve) => socket.once(event, resolve));
}

/** Creates a two-player room and resolves when both players have received game-start. */
function setupGame() {
  return new Promise((resolve) => {
    const host = makeClient();
    host.emit('create-room');
    host.once('room-created', ({ roomId }) => {
      const guest = makeClient();
      let starts = 0;
      const onStart = () => {
        starts++;
        if (starts === 2) resolve({ host, guest, roomId });
      };
      host.on('game-start', onStart);
      guest.on('game-start', onStart);
      guest.emit('join-room', roomId);
    });
  });
}

/**
 * Plays a sequence of board positions alternating host (X) then guest (O).
 * Waits for move-made after each emit.
 */
async function playMoves(host, guest, roomId, positions) {
  for (let i = 0; i < positions.length; i++) {
    const client = i % 2 === 0 ? host : guest;
    const moved = waitFor(host, 'move-made');
    client.emit('make-move', { roomId, index: positions[i] });
    await moved;
  }
}

// ─── create-room ─────────────────────────────────────────────────────────────

describe('create-room', () => {
  it('responds with room-created containing a roomId and symbol X', (done) => {
    const client = makeClient();
    client.on('room-created', ({ roomId, symbol }) => {
      expect(typeof roomId).toBe('string');
      expect(roomId.length).toBeGreaterThan(0);
      expect(symbol).toBe('X');
      client.disconnect();
      done();
    });
    client.emit('create-room');
  });

  it('adds the room to the rooms map', (done) => {
    const client = makeClient();
    client.on('room-created', ({ roomId }) => {
      expect(rooms.has(roomId)).toBe(true);
      client.disconnect();
      done();
    });
    client.emit('create-room');
  });
});

// ─── join-room ────────────────────────────────────────────────────────────────

describe('join-room', () => {
  it('emits join-error when room does not exist', (done) => {
    const client = makeClient();
    client.once('join-error', (msg) => {
      expect(msg).toBe('Room not found');
      client.disconnect();
      done();
    });
    client.emit('join-room', 'NOSUCH');
  });

  it('assigns symbol O and emits game-start to both players', async () => {
    const host = makeClient();
    host.emit('create-room');
    const { roomId } = await waitFor(host, 'room-created');

    const guest = makeClient();
    const hostStart = waitFor(host, 'game-start');
    const guestJoined = waitFor(guest, 'room-joined');
    guest.emit('join-room', roomId);
    const [, { symbol }] = await Promise.all([hostStart, guestJoined]);

    expect(symbol).toBe('O');
    host.disconnect();
    guest.disconnect();
  });

  it('emits join-error when room is full', async () => {
    const { host, guest, roomId } = await setupGame();
    const intruder = makeClient();

    const err = await new Promise((resolve) => {
      intruder.once('join-error', resolve);
      intruder.emit('join-room', roomId);
    });

    expect(err).toBe('Room is full');
    host.disconnect();
    guest.disconnect();
    intruder.disconnect();
  });
});

// ─── make-move ────────────────────────────────────────────────────────────────

describe('make-move', () => {
  it('broadcasts move-made with updated board after a valid move', async () => {
    const { host, guest, roomId } = await setupGame();

    const moved = waitFor(host, 'move-made');
    host.emit('make-move', { roomId, index: 0 });
    const data = await moved;

    expect(data.board[0]).toBe('X');
    expect(data.isXTurn).toBe(false);
    host.disconnect();
    guest.disconnect();
  });

  it('ignores a move from the wrong player (O trying to go first)', async () => {
    const { host, guest, roomId } = await setupGame();

    let moveFired = false;
    host.on('move-made', () => { moveFired = true; });
    guest.emit('make-move', { roomId, index: 0 });

    await new Promise((res) => setTimeout(res, 150));
    expect(moveFired).toBe(false);
    host.disconnect();
    guest.disconnect();
  });

  it('ignores a move on an already-occupied cell', async () => {
    const { host, guest, roomId } = await setupGame();
    await playMoves(host, guest, roomId, [0]); // X plays 0

    let extraFired = false;
    host.on('move-made', () => { extraFired = true; });
    host.emit('make-move', { roomId, index: 0 }); // X tries again

    await new Promise((res) => setTimeout(res, 150));
    expect(extraFired).toBe(false);
    host.disconnect();
    guest.disconnect();
  });

  it('emits move-made with winner X when X completes a winning line', async () => {
    const { host, guest, roomId } = await setupGame();
    // X: 0,1,2  O: 3,4
    await playMoves(host, guest, roomId, [0, 3, 1, 4]);

    const final = waitFor(host, 'move-made');
    host.emit('make-move', { roomId, index: 2 });
    const data = await final;

    expect(data.winner).toBe('X');
    host.disconnect();
    guest.disconnect();
  });

  it('emits move-made with isDraw when board fills with no winner', async () => {
    const { host, guest, roomId } = await setupGame();
    // Draw sequence: X=0,2,3,5,7  O=1,4,6,8
    // Interleaved: [0,1,2,4,3,6,5,8,7] — X plays 0,2,3,5,7 (even indices)
    await playMoves(host, guest, roomId, [0, 1, 2, 4, 3, 6, 5, 8]);

    const final = waitFor(host, 'move-made');
    host.emit('make-move', { roomId, index: 7 }); // X's 5th move completes the draw
    const data = await final;

    expect(data.isDraw).toBe(true);
    host.disconnect();
    guest.disconnect();
  });

  it('ignores further moves after game is over', async () => {
    const { host, guest, roomId } = await setupGame();
    await playMoves(host, guest, roomId, [0, 3, 1, 4]);
    const final = waitFor(host, 'move-made');
    host.emit('make-move', { roomId, index: 2 }); // X wins
    await final;

    let extraFired = false;
    host.on('move-made', () => { extraFired = true; });
    guest.emit('make-move', { roomId, index: 5 });

    await new Promise((res) => setTimeout(res, 150));
    expect(extraFired).toBe(false);
    host.disconnect();
    guest.disconnect();
  });
});

// ─── play-again ───────────────────────────────────────────────────────────────

describe('play-again', () => {
  async function winGame(host, guest, roomId) {
    await playMoves(host, guest, roomId, [0, 3, 1, 4]);
    const final = waitFor(host, 'move-made');
    host.emit('make-move', { roomId, index: 2 }); // X wins
    await final;
  }

  it('emits waiting-for-play-again to the first requester', async () => {
    const { host, guest, roomId } = await setupGame();
    await winGame(host, guest, roomId);

    const waiting = waitFor(host, 'waiting-for-play-again');
    host.emit('play-again', roomId);
    await waiting; // resolves with undefined

    host.disconnect();
    guest.disconnect();
  });

  it('resets the board when both players request play-again', async () => {
    const { host, guest, roomId } = await setupGame();
    await winGame(host, guest, roomId);

    const restartHost = waitFor(host, 'game-restart');
    const restartGuest = waitFor(guest, 'game-restart');

    host.emit('play-again', roomId);
    guest.emit('play-again', roomId);

    await Promise.all([restartHost, restartGuest]);

    const room = rooms.get(roomId);
    expect(room.board).toEqual(Array(9).fill(null));
    expect(room.winner).toBeNull();
    expect(room.isXTurn).toBe(true);
    host.disconnect();
    guest.disconnect();
  });
});

// ─── disconnect ───────────────────────────────────────────────────────────────

describe('disconnect', () => {
  it('emits opponent-disconnected to the remaining player when guest leaves', async () => {
    const { host, guest } = await setupGame();

    const disconnected = waitFor(host, 'opponent-disconnected');
    guest.disconnect();
    await disconnected;

    host.disconnect();
  });

  it('removes the room from memory after a player disconnects', async () => {
    const { host, guest, roomId } = await setupGame();

    const disconnected = waitFor(host, 'opponent-disconnected');
    guest.disconnect();
    await disconnected;

    await new Promise((res) => setTimeout(res, 50));
    expect(rooms.has(roomId)).toBe(false);
    host.disconnect();
  });
});
