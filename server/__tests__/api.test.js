const request = require('supertest');

jest.mock('../store', () => ({
  getScores: jest.fn(),
  updateScores: jest.fn(),
  resetScores: jest.fn(),
  updateLeaderboard: jest.fn(),
}));
const store = require('../store');
const app = require('../app');

const DEFAULT_SCORES = { X: 0, O: 0, draws: 0 };

beforeEach(() => {
  jest.clearAllMocks();
  store.getScores.mockResolvedValue({ ...DEFAULT_SCORES });
  store.updateScores.mockResolvedValue({ ...DEFAULT_SCORES });
  store.resetScores.mockResolvedValue({ ...DEFAULT_SCORES });
  store.updateLeaderboard.mockResolvedValue();
});

describe('GET /api/scores', () => {
  it('returns the current scores', async () => {
    const res = await request(app).get('/api/scores');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(DEFAULT_SCORES);
  });
});

describe('POST /api/scores', () => {
  it('increments X score', async () => {
    store.updateScores.mockResolvedValue({ X: 3, O: 1, draws: 0 });
    const res = await request(app).post('/api/scores').send({ winner: 'X' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ X: 3, O: 1, draws: 0 });
  });

  it('increments O score', async () => {
    store.updateScores.mockResolvedValue({ X: 0, O: 1, draws: 0 });
    const res = await request(app).post('/api/scores').send({ winner: 'O' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ X: 0, O: 1, draws: 0 });
  });

  it('increments draws', async () => {
    store.updateScores.mockResolvedValue({ X: 0, O: 0, draws: 1 });
    const res = await request(app).post('/api/scores').send({ winner: 'draw' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ X: 0, O: 0, draws: 1 });
  });

  it('returns 400 for an invalid winner value', async () => {
    const res = await request(app).post('/api/scores').send({ winner: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('calls store.updateScores with the winner', async () => {
    await request(app).post('/api/scores').send({ winner: 'X' });
    expect(store.updateScores).toHaveBeenCalledWith('X');
  });
});

describe('DELETE /api/scores', () => {
  it('resets all scores to zero', async () => {
    const res = await request(app).delete('/api/scores');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ X: 0, O: 0, draws: 0 });
  });

  it('calls store.resetScores', async () => {
    await request(app).delete('/api/scores');
    expect(store.resetScores).toHaveBeenCalled();
  });
});
