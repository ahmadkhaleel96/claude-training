// Mock supabase before requiring the store
const mockChain = {
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  insert: jest.fn().mockResolvedValue({ error: null }),
  upsert: jest.fn().mockResolvedValue({ error: null }),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockResolvedValue({ error: null }),
  order: jest.fn().mockResolvedValue({ data: [], error: null }),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
};

const mockFrom = jest.fn().mockReturnValue(mockChain);

jest.mock('../db', () => ({
  supabase: { from: mockFrom },
}));

const store = require('../store');

beforeEach(() => {
  jest.clearAllMocks();
  mockFrom.mockReturnValue(mockChain);
  Object.keys(mockChain).forEach(key => {
    if (typeof mockChain[key].mockReset === 'function') {
      mockChain[key].mockReset();
    }
  });
  // Restore defaults
  mockChain.select.mockReturnThis();
  mockChain.update.mockReturnThis();
  mockChain.insert.mockResolvedValue({ error: null });
  mockChain.upsert.mockResolvedValue({ error: null });
  mockChain.delete.mockReturnThis();
  mockChain.eq.mockReturnThis();
  mockChain.neq.mockResolvedValue({ error: null });
  mockChain.order.mockResolvedValue({ data: [], error: null });
  mockChain.single.mockResolvedValue({ data: null, error: null });
});

// ── updateLeaderboard ─────────────────────────────────────────────────────────

describe('store.updateLeaderboard', () => {
  it('does nothing when users is null', async () => {
    await store.updateLeaderboard('X', null);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('does nothing when both users are null', async () => {
    await store.updateLeaderboard('X', { X: null, O: null });
    expect(mockChain.upsert).not.toHaveBeenCalled();
  });

  it('increments X wins and O losses when X wins', async () => {
    mockChain.single
      .mockResolvedValueOnce({ data: { wins: 0, losses: 0, draws: 0 }, error: null }) // alice entry
      .mockResolvedValueOnce({ data: { wins: 0, losses: 0, draws: 0 }, error: null }); // bob entry

    await store.updateLeaderboard('X', { X: 'alice', O: 'bob' });

    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'alice', wins: 1, losses: 0, draws: 0 })
    );
    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'bob', wins: 0, losses: 1, draws: 0 })
    );
  });

  it('increments O wins and X losses when O wins', async () => {
    mockChain.single
      .mockResolvedValueOnce({ data: { wins: 0, losses: 0, draws: 0 }, error: null })
      .mockResolvedValueOnce({ data: { wins: 0, losses: 0, draws: 0 }, error: null });

    await store.updateLeaderboard('O', { X: 'alice', O: 'bob' });

    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'alice', wins: 0, losses: 1, draws: 0 })
    );
    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'bob', wins: 1, losses: 0, draws: 0 })
    );
  });

  it('increments draws for both users on a draw', async () => {
    mockChain.single
      .mockResolvedValueOnce({ data: { wins: 0, losses: 0, draws: 0 }, error: null })
      .mockResolvedValueOnce({ data: { wins: 0, losses: 0, draws: 0 }, error: null });

    await store.updateLeaderboard('draw', { X: 'alice', O: 'bob' });

    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'alice', wins: 0, losses: 0, draws: 1 })
    );
    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'bob', wins: 0, losses: 0, draws: 1 })
    );
  });

  it('only updates the non-null user when O is null (vs computer)', async () => {
    mockChain.single.mockResolvedValueOnce({ data: { wins: 2, losses: 1, draws: 0 }, error: null });

    await store.updateLeaderboard('X', { X: 'alice', O: null });

    expect(mockChain.upsert).toHaveBeenCalledTimes(1);
    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'alice', wins: 3 })
    );
  });

  it('initialises a new entry at 0 when the user has no prior record', async () => {
    mockChain.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

    await store.updateLeaderboard('X', { X: 'newuser', O: null });

    expect(mockChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'newuser', wins: 1, losses: 0, draws: 0 })
    );
  });
});

// ── getUser ───────────────────────────────────────────────────────────────────

describe('store.getUser', () => {
  it('returns null when user does not exist', async () => {
    mockChain.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    const result = await store.getUser('nobody');
    expect(result).toBeNull();
  });

  it('returns user with passwordHash when user exists', async () => {
    mockChain.single.mockResolvedValue({
      data: { username: 'alice', password_hash: 'hash123' },
      error: null,
    });
    const result = await store.getUser('alice');
    expect(result).toEqual({ passwordHash: 'hash123' });
  });
});

// ── getLeaderboard ────────────────────────────────────────────────────────────

describe('store.getLeaderboard', () => {
  it('returns mapped entries', async () => {
    mockChain.order.mockResolvedValue({
      data: [
        { username: 'alice', wins: 3, losses: 1, draws: 0 },
        { username: 'bob', wins: 1, losses: 2, draws: 1 },
      ],
      error: null,
    });

    const result = await store.getLeaderboard();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ username: 'alice', wins: 3, losses: 1, draws: 0 });
  });
});
