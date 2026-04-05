const request = require('supertest');
const fs = require('fs');

jest.mock('fs');

const app = require('../app');

const DEFAULT_SCORES = { X: 0, O: 0, draws: 0 };

beforeEach(() => {
  fs.existsSync.mockReturnValue(true);
  fs.readFileSync.mockReturnValue(JSON.stringify(DEFAULT_SCORES));
  fs.writeFileSync.mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/scores', () => {
  it('returns the current scores', async () => {
    const res = await request(app).get('/api/scores');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(DEFAULT_SCORES);
  });

  it('creates the file with zeroed scores when it does not exist', async () => {
    fs.existsSync.mockReturnValue(false);
    const res = await request(app).get('/api/scores');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(DEFAULT_SCORES);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});

describe('POST /api/scores', () => {
  it('increments X score', async () => {
    fs.readFileSync.mockReturnValue(JSON.stringify({ X: 2, O: 1, draws: 0 }));
    const res = await request(app)
      .post('/api/scores')
      .send({ winner: 'X' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ X: 3, O: 1, draws: 0 });
  });

  it('increments O score', async () => {
    fs.readFileSync.mockReturnValue(JSON.stringify({ X: 0, O: 0, draws: 0 }));
    const res = await request(app)
      .post('/api/scores')
      .send({ winner: 'O' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ X: 0, O: 1, draws: 0 });
  });

  it('increments draws', async () => {
    const res = await request(app)
      .post('/api/scores')
      .send({ winner: 'draw' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ X: 0, O: 0, draws: 1 });
  });

  it('returns 400 for an invalid winner value', async () => {
    const res = await request(app)
      .post('/api/scores')
      .send({ winner: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('writes updated scores to the file', async () => {
    await request(app).post('/api/scores').send({ winner: 'X' });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('scores.json'),
      expect.stringContaining('"X": 1')
    );
  });
});

describe('DELETE /api/scores', () => {
  it('resets all scores to zero', async () => {
    fs.readFileSync.mockReturnValue(JSON.stringify({ X: 5, O: 3, draws: 2 }));
    const res = await request(app).delete('/api/scores');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ X: 0, O: 0, draws: 0 });
  });

  it('writes zeroed scores to the file', async () => {
    await request(app).delete('/api/scores');
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('scores.json'),
      expect.stringContaining('"X": 0')
    );
  });
});
