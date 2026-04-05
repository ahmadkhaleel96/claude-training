import { loginApi, registerApi } from '../authApi';

function mockFetch(body, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('loginApi', () => {
  it('calls POST /api/auth/login with credentials', async () => {
    mockFetch({ token: 'tok', username: 'alice' });
    await loginApi('alice', 'pass123');
    expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'alice', password: 'pass123' }),
    });
  });

  it('returns token and username on success', async () => {
    mockFetch({ token: 'tok', username: 'alice' });
    const result = await loginApi('alice', 'pass123');
    expect(result).toEqual({ token: 'tok', username: 'alice' });
  });

  it('throws with the server error message on failure', async () => {
    mockFetch({ error: 'Invalid username or password.' }, false);
    await expect(loginApi('alice', 'wrong')).rejects.toThrow('Invalid username or password.');
  });

  it('throws a fallback message when error field is missing', async () => {
    mockFetch({}, false);
    await expect(loginApi('alice', 'wrong')).rejects.toThrow('Login failed.');
  });
});

describe('registerApi', () => {
  it('calls POST /api/auth/register with credentials', async () => {
    mockFetch({ token: 'tok', username: 'alice' });
    await registerApi('alice', 'pass123');
    expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'alice', password: 'pass123' }),
    });
  });

  it('returns token and username on success', async () => {
    mockFetch({ token: 'tok', username: 'alice' });
    const result = await registerApi('alice', 'pass123');
    expect(result).toEqual({ token: 'tok', username: 'alice' });
  });

  it('throws with the server error message on failure', async () => {
    mockFetch({ error: 'Username already taken.' }, false);
    await expect(registerApi('alice', 'pass123')).rejects.toThrow('Username already taken.');
  });

  it('throws a fallback message when error field is missing', async () => {
    mockFetch({}, false);
    await expect(registerApi('alice', 'pass123')).rejects.toThrow('Registration failed.');
  });
});
