import { fetchScores, postScore, resetScores } from '../scoresApi';

const mockScores = { X: 2, O: 1, draws: 0 };

function mockFetch(body, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchScores', () => {
  it('calls GET /api/scores and returns parsed JSON', async () => {
    mockFetch(mockScores);
    const result = await fetchScores();
    expect(fetch).toHaveBeenCalledWith('/api/scores');
    expect(result).toEqual(mockScores);
  });

  it('throws when the response is not ok', async () => {
    mockFetch({}, false);
    await expect(fetchScores()).rejects.toThrow('Failed to fetch scores');
  });
});

describe('postScore', () => {
  it('calls POST /api/scores with the winner and returns updated scores', async () => {
    mockFetch(mockScores);
    const result = await postScore('X');
    expect(fetch).toHaveBeenCalledWith('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner: 'X' }),
    });
    expect(result).toEqual(mockScores);
  });

  it('throws when the response is not ok', async () => {
    mockFetch({}, false);
    await expect(postScore('X')).rejects.toThrow('Failed to save score');
  });
});

describe('resetScores', () => {
  it('calls DELETE /api/scores and returns zeroed scores', async () => {
    const zeroed = { X: 0, O: 0, draws: 0 };
    mockFetch(zeroed);
    const result = await resetScores();
    expect(fetch).toHaveBeenCalledWith('/api/scores', { method: 'DELETE' });
    expect(result).toEqual(zeroed);
  });

  it('throws when the response is not ok', async () => {
    mockFetch({}, false);
    await expect(resetScores()).rejects.toThrow('Failed to reset scores');
  });
});
