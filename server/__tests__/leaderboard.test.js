const request = require('supertest');

jest.mock('../store', () => ({
  getScores: jest.fn(),
  updateScores: jest.fn(),
  updateLeaderboard: jest.fn(),
  getLeaderboard: jest.fn(),
  resetLeaderboard: jest.fn(),
}));
const store = require('../store');
const app = require('../app');

const DEFAULT_SCORES = { X: 0, O: 0, draws: 0 };

beforeEach(() => {
  jest.clearAllMocks();
  store.getScores.mockResolvedValue({ ...DEFAULT_SCORES });
  store.updateScores.mockResolvedValue({ ...DEFAULT_SCORES });
  store.updateLeaderboard.mockResolvedValue();
  store.getLeaderboard.mockResolvedValue([]);
  store.resetLeaderboard.mockResolvedValue();
});

// ─── GET /api/leaderboard ─────────────────────────────────────────────────────

describe('GET /api/leaderboard', () => {
  it('returns an empty array when leaderboard is empty', async () => {
    const res = await request(app).get('/api/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns sorted entries by wins descending', async () => {
    store.getLeaderboard.mockResolvedValue([
      { username: 'alice', wins: 3, losses: 1, draws: 0 },
      { username: 'bob', wins: 7, losses: 2, draws: 1 },
      { username: 'carol', wins: 5, losses: 0, draws: 2 },
    ]);
    const res = await request(app).get('/api/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body[0].username).toBe('bob');
    expect(res.body[1].username).toBe('carol');
    expect(res.body[2].username).toBe('alice');
  });

  it('includes wins, losses, and draws for each entry', async () => {
    store.getLeaderboard.mockResolvedValue([
      { username: 'alice', wins: 2, losses: 1, draws: 3 },
    ]);
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

  it('calls store.resetLeaderboard', async () => {
    await request(app).delete('/api/leaderboard');
    expect(store.resetLeaderboard).toHaveBeenCalled();
  });
});

// ─── POST /api/scores with users ──────────────────────────────────────────────

describe('POST /api/scores — leaderboard update', () => {
  it('calls store.updateLeaderboard with winner and users when X wins', async () => {
    await request(app)
      .post('/api/scores')
      .send({ winner: 'X', users: { X: 'alice', O: 'bob' } });
    expect(store.updateLeaderboard).toHaveBeenCalledWith('X', { X: 'alice', O: 'bob' });
  });

  it('calls store.updateLeaderboard when O wins', async () => {
    await request(app)
      .post('/api/scores')
      .send({ winner: 'O', users: { X: 'alice', O: 'bob' } });
    expect(store.updateLeaderboard).toHaveBeenCalledWith('O', { X: 'alice', O: 'bob' });
  });

  it('calls store.updateLeaderboard on a draw', async () => {
    await request(app)
      .post('/api/scores')
      .send({ winner: 'draw', users: { X: 'alice', O: 'bob' } });
    expect(store.updateLeaderboard).toHaveBeenCalledWith('draw', { X: 'alice', O: 'bob' });
  });

  it('does not call store.updateLeaderboard when users is omitted', async () => {
    await request(app).post('/api/scores').send({ winner: 'X' });
    expect(store.updateLeaderboard).not.toHaveBeenCalled();
  });
});
