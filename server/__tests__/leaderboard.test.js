const request = require('supertest');
const fs = require('fs');

jest.mock('fs');

const app = require('../app');

const DEFAULT_SCORES = { X: 0, O: 0, draws: 0 };

beforeEach(() => {
  fs.existsSync.mockReturnValue(true);
  fs.readFileSync.mockImplementation((filePath) => {
    if (filePath.includes('scores.json')) return JSON.stringify(DEFAULT_SCORES);
    if (filePath.includes('leaderboard.json')) return JSON.stringify({});
    return '{}';
  });
  fs.writeFileSync.mockImplementation(() => {});
  fs.mkdirSync.mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── GET /api/leaderboard ─────────────────────────────────────────────────────

describe('GET /api/leaderboard', () => {
  it('returns an empty array when leaderboard is empty', async () => {
    const res = await request(app).get('/api/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns sorted entries by wins descending', async () => {
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('leaderboard.json')) {
        return JSON.stringify({
          alice: { wins: 3, losses: 1, draws: 0 },
          bob: { wins: 7, losses: 2, draws: 1 },
          carol: { wins: 5, losses: 0, draws: 2 },
        });
      }
      return JSON.stringify(DEFAULT_SCORES);
    });

    const res = await request(app).get('/api/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body[0].username).toBe('bob');
    expect(res.body[1].username).toBe('carol');
    expect(res.body[2].username).toBe('alice');
  });

  it('includes wins, losses, and draws for each entry', async () => {
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('leaderboard.json')) {
        return JSON.stringify({ alice: { wins: 2, losses: 1, draws: 3 } });
      }
      return JSON.stringify(DEFAULT_SCORES);
    });

    const res = await request(app).get('/api/leaderboard');
    expect(res.body[0]).toMatchObject({ username: 'alice', wins: 2, losses: 1, draws: 3 });
  });
});

// ─── DELETE /api/leaderboard ──────────────────────────────────────────────────

describe('DELETE /api/leaderboard', () => {
  it('resets the leaderboard to empty', async () => {
    const res = await request(app).delete('/api/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it('writes an empty object to the leaderboard file', async () => {
    await request(app).delete('/api/leaderboard');
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('leaderboard.json'),
      expect.any(String)
    );
  });
});

// ─── POST /api/scores with users ──────────────────────────────────────────────

describe('POST /api/scores — leaderboard update', () => {
  it('increments X user wins and O user losses when X wins', async () => {
    let savedLeaderboard = {};
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('leaderboard.json')) return JSON.stringify(savedLeaderboard);
      return JSON.stringify(DEFAULT_SCORES);
    });
    fs.writeFileSync.mockImplementation((filePath, data) => {
      if (filePath.includes('leaderboard.json')) savedLeaderboard = JSON.parse(data);
    });

    await request(app)
      .post('/api/scores')
      .send({ winner: 'X', users: { X: 'alice', O: 'bob' } });

    expect(savedLeaderboard.alice).toMatchObject({ wins: 1, losses: 0, draws: 0 });
    expect(savedLeaderboard.bob).toMatchObject({ wins: 0, losses: 1, draws: 0 });
  });

  it('increments O user wins and X user losses when O wins', async () => {
    let savedLeaderboard = {};
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('leaderboard.json')) return JSON.stringify(savedLeaderboard);
      return JSON.stringify(DEFAULT_SCORES);
    });
    fs.writeFileSync.mockImplementation((filePath, data) => {
      if (filePath.includes('leaderboard.json')) savedLeaderboard = JSON.parse(data);
    });

    await request(app)
      .post('/api/scores')
      .send({ winner: 'O', users: { X: 'alice', O: 'bob' } });

    expect(savedLeaderboard.bob).toMatchObject({ wins: 1, losses: 0, draws: 0 });
    expect(savedLeaderboard.alice).toMatchObject({ wins: 0, losses: 1, draws: 0 });
  });

  it('increments draws for both users on a draw', async () => {
    let savedLeaderboard = {};
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('leaderboard.json')) return JSON.stringify(savedLeaderboard);
      return JSON.stringify(DEFAULT_SCORES);
    });
    fs.writeFileSync.mockImplementation((filePath, data) => {
      if (filePath.includes('leaderboard.json')) savedLeaderboard = JSON.parse(data);
    });

    await request(app)
      .post('/api/scores')
      .send({ winner: 'draw', users: { X: 'alice', O: 'bob' } });

    expect(savedLeaderboard.alice).toMatchObject({ wins: 0, losses: 0, draws: 1 });
    expect(savedLeaderboard.bob).toMatchObject({ wins: 0, losses: 0, draws: 1 });
  });

  it('only updates the non-null user when O is null (vs computer)', async () => {
    let savedLeaderboard = {};
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('leaderboard.json')) return JSON.stringify(savedLeaderboard);
      return JSON.stringify(DEFAULT_SCORES);
    });
    fs.writeFileSync.mockImplementation((filePath, data) => {
      if (filePath.includes('leaderboard.json')) savedLeaderboard = JSON.parse(data);
    });

    await request(app)
      .post('/api/scores')
      .send({ winner: 'X', users: { X: 'alice', O: null } });

    expect(savedLeaderboard.alice).toMatchObject({ wins: 1 });
    expect(Object.keys(savedLeaderboard)).not.toContain('null');
  });

  it('does not touch leaderboard when users is omitted', async () => {
    let leaderboardWritten = false;
    fs.writeFileSync.mockImplementation((filePath) => {
      if (filePath.includes('leaderboard.json')) leaderboardWritten = true;
    });

    await request(app).post('/api/scores').send({ winner: 'X' });
    expect(leaderboardWritten).toBe(false);
  });

  it('does not touch leaderboard when both users are null', async () => {
    let leaderboardWritten = false;
    fs.writeFileSync.mockImplementation((filePath) => {
      if (filePath.includes('leaderboard.json')) leaderboardWritten = true;
    });

    await request(app)
      .post('/api/scores')
      .send({ winner: 'X', users: { X: null, O: null } });

    expect(leaderboardWritten).toBe(false);
  });
});
