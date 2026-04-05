const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getWinner(board) {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function isBoardFull(board) {
  return board.every((cell) => cell !== null);
}

function makeRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const rooms = new Map();

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('create-room', () => {
      const roomId = makeRoomId();
      rooms.set(roomId, {
        id: roomId,
        board: Array(9).fill(null),
        isXTurn: true,
        players: [{ id: socket.id, symbol: 'X' }],
        winner: null,
        isDraw: false,
        playAgainRequests: new Set(),
      });
      socket.join(roomId);
      socket.emit('room-created', { roomId, symbol: 'X' });
    });

    socket.on('join-room', (roomId) => {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('join-error', 'Room not found');
        return;
      }
      if (room.players.length >= 2) {
        socket.emit('join-error', 'Room is full');
        return;
      }
      room.players.push({ id: socket.id, symbol: 'O' });
      socket.join(roomId);
      socket.emit('room-joined', { roomId, symbol: 'O' });
      io.to(roomId).emit('game-start', { board: room.board });
    });

    socket.on('make-move', ({ roomId, index }) => {
      const room = rooms.get(roomId);
      if (!room || room.winner || room.isDraw) return;

      const player = room.players.find((p) => p.id === socket.id);
      if (!player) return;
      const expectedSymbol = room.isXTurn ? 'X' : 'O';
      if (player.symbol !== expectedSymbol) return;
      if (room.board[index] !== null) return;

      room.board[index] = player.symbol;
      const winner = getWinner(room.board);
      const isDraw = !winner && isBoardFull(room.board);
      room.winner = winner;
      room.isDraw = isDraw;
      room.isXTurn = !room.isXTurn;

      io.to(roomId).emit('move-made', {
        board: room.board,
        isXTurn: room.isXTurn,
        winner,
        isDraw,
      });
    });

    socket.on('play-again', (roomId) => {
      const room = rooms.get(roomId);
      if (!room) return;

      room.playAgainRequests.add(socket.id);

      if (room.playAgainRequests.size === room.players.length) {
        room.board = Array(9).fill(null);
        room.isXTurn = true;
        room.winner = null;
        room.isDraw = false;
        room.playAgainRequests.clear();
        io.to(roomId).emit('game-restart');
      } else {
        socket.emit('waiting-for-play-again');
      }
    });

    socket.on('disconnect', () => {
      for (const [roomId, room] of rooms) {
        const playerIdx = room.players.findIndex((p) => p.id === socket.id);
        if (playerIdx !== -1) {
          io.to(roomId).emit('opponent-disconnected');
          rooms.delete(roomId);
          break;
        }
      }
    });
  });
}

module.exports = { registerSocketHandlers, rooms };
