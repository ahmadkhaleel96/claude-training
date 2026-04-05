const request = require('supertest');
const fs = require('fs');

jest.mock('fs');
jest.mock('../auth');

const { hashPassword, comparePassword, signToken } = require('../auth');
const app = require('../app');

const EMPTY_USERS = {};
const DEFAULT_SCORES = { X: 0, O: 0, draws: 0 };

beforeEach(() => {
  fs.existsSync.mockReturnValue(true);
  fs.readFileSync.mockImplementation((filePath) => {
    if (filePath.includes('users.json')) return JSON.stringify(EMPTY_USERS);
    if (filePath.includes('scores.json')) return JSON.stringify(DEFAULT_SCORES);
    return '{}';
  });
  fs.writeFileSync.mockImplementation(() => {});
  fs.mkdirSync.mockImplementation(() => {});

  hashPassword.mockResolvedValue('hashed_password');
  comparePassword.mockResolvedValue(true);
  signToken.mockReturnValue('mock_token');
});

afterEach(() => {
  jest.clearAllMocks();
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
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('users.json')) {
        return JSON.stringify({ alice: { passwordHash: 'hashed' } });
      }
      return JSON.stringify(DEFAULT_SCORES);
    });
    const res = await request(app).post('/api/auth/register').send({ username: 'alice', password: 'pass123' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/taken/i);
  });

  it('returns token and username on success', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'alice', password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: 'mock_token', username: 'alice' });
  });

  it('saves hashed password to users file', async () => {
    let saved = {};
    fs.writeFileSync.mockImplementation((filePath, data) => {
      if (filePath.includes('users.json')) saved = JSON.parse(data);
    });
    await request(app).post('/api/auth/register').send({ username: 'alice', password: 'pass123' });
    expect(saved.alice).toHaveProperty('passwordHash', 'hashed_password');
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
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('users.json')) {
        return JSON.stringify({ alice: { passwordHash: 'hashed' } });
      }
      return JSON.stringify(DEFAULT_SCORES);
    });
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
  const { verifyToken } = require('../auth');

  beforeEach(() => {
    verifyToken.mockReturnValue({ username: 'alice' });
  });

  it('updates leaderboard using verified token and symbol', async () => {
    let savedLeaderboard = {};
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('leaderboard.json')) return JSON.stringify(savedLeaderboard);
      if (filePath.includes('users.json')) return JSON.stringify({});
      return JSON.stringify(DEFAULT_SCORES);
    });
    fs.writeFileSync.mockImplementation((filePath, data) => {
      if (filePath.includes('leaderboard.json')) savedLeaderboard = JSON.parse(data);
    });

    await request(app)
      .post('/api/scores')
      .send({ winner: 'X', token: 'mock_token', symbol: 'X' });

    expect(savedLeaderboard.alice).toMatchObject({ wins: 1 });
  });

  it('skips leaderboard update when token is invalid', async () => {
    verifyToken.mockImplementation(() => { throw new Error('invalid'); });
    let leaderboardWritten = false;
    fs.writeFileSync.mockImplementation((filePath) => {
      if (filePath.includes('leaderboard.json')) leaderboardWritten = true;
    });

    await request(app)
      .post('/api/scores')
      .send({ winner: 'X', token: 'bad_token', symbol: 'X' });

    expect(leaderboardWritten).toBe(false);
  });
});
