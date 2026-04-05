const request = require('supertest');

jest.mock('../store', () => ({
  getScores: jest.fn(),
  updateScores: jest.fn(),
  updateLeaderboard: jest.fn(),
  getUser: jest.fn(),
  createUser: jest.fn(),
}));
jest.mock('../auth');

const store = require('../store');
const { hashPassword, comparePassword, signToken, verifyToken } = require('../auth');
const app = require('../app');

const DEFAULT_SCORES = { X: 0, O: 0, draws: 0 };

beforeEach(() => {
  jest.clearAllMocks();
  store.getScores.mockResolvedValue({ ...DEFAULT_SCORES });
  store.updateScores.mockResolvedValue({ ...DEFAULT_SCORES });
  store.updateLeaderboard.mockResolvedValue();
  store.getUser.mockResolvedValue(null);
  store.createUser.mockResolvedValue();

  hashPassword.mockResolvedValue('hashed_password');
  comparePassword.mockResolvedValue(true);
  signToken.mockReturnValue('mock_token');
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('returns 400 when username is too short', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'a', password: 'pass123' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'alice', password: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when username is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ password: 'pass123' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 409 when username is already taken', async () => {
    store.getUser.mockResolvedValue({ passwordHash: 'hashed' });
    const res = await request(app).post('/api/auth/register').send({ username: 'alice', password: 'pass123' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/taken/i);
  });

  it('returns token and username on success', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'alice', password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: 'mock_token', username: 'alice' });
  });

  it('saves hashed password via store.createUser', async () => {
    await request(app).post('/api/auth/register').send({ username: 'alice', password: 'pass123' });
    expect(store.createUser).toHaveBeenCalledWith('alice', 'hashed_password');
  });

  it('trims whitespace from username', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: '  bob  ', password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('bob');
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    store.getUser.mockResolvedValue({ passwordHash: 'hashed' });
  });

  it('returns 400 when username is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'pass123' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'alice' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 when username does not exist', async () => {
    store.getUser.mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login').send({ username: 'unknown', password: 'pass123' });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid/i);
  });

  it('returns 401 when password is wrong', async () => {
    comparePassword.mockResolvedValue(false);
    const res = await request(app).post('/api/auth/login').send({ username: 'alice', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid/i);
  });

  it('returns token and username on success', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'alice', password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: 'mock_token', username: 'alice' });
  });
});

// ─── POST /api/scores — token-based leaderboard ───────────────────────────────

describe('POST /api/scores — token-based leaderboard update', () => {
  beforeEach(() => {
    verifyToken.mockReturnValue({ username: 'alice' });
  });

  it('calls store.updateLeaderboard using verified token and symbol', async () => {
    await request(app)
      .post('/api/scores')
      .send({ winner: 'X', token: 'mock_token', symbol: 'X' });
    expect(store.updateLeaderboard).toHaveBeenCalledWith('X', { X: 'alice', O: null });
  });

  it('skips leaderboard update when token is invalid', async () => {
    verifyToken.mockImplementation(() => { throw new Error('invalid'); });
    await request(app)
      .post('/api/scores')
      .send({ winner: 'X', token: 'bad_token', symbol: 'X' });
    expect(store.updateLeaderboard).not.toHaveBeenCalled();
  });
});
