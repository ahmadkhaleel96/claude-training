jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword, signToken, verifyToken } = require('../auth');

afterEach(() => {
  jest.clearAllMocks();
});

describe('hashPassword', () => {
  it('calls bcrypt.hash with the password and 10 rounds', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    const result = await hashPassword('secret');
    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
    expect(result).toBe('hashed');
  });
});

describe('comparePassword', () => {
  it('returns true when password matches hash', async () => {
    bcrypt.compare.mockResolvedValue(true);
    const result = await comparePassword('secret', 'hashed');
    expect(bcrypt.compare).toHaveBeenCalledWith('secret', 'hashed');
    expect(result).toBe(true);
  });

  it('returns false when password does not match', async () => {
    bcrypt.compare.mockResolvedValue(false);
    const result = await comparePassword('wrong', 'hashed');
    expect(result).toBe(false);
  });
});

describe('signToken', () => {
  it('calls jwt.sign with username payload and 30d expiry', () => {
    jwt.sign.mockReturnValue('token123');
    const result = signToken('alice');
    expect(jwt.sign).toHaveBeenCalledWith(
      { username: 'alice' },
      expect.any(String),
      { expiresIn: '30d' }
    );
    expect(result).toBe('token123');
  });
});

describe('verifyToken', () => {
  it('calls jwt.verify and returns the decoded payload', () => {
    jwt.verify.mockReturnValue({ username: 'alice' });
    const result = verifyToken('token123');
    expect(jwt.verify).toHaveBeenCalledWith('token123', expect.any(String));
    expect(result).toEqual({ username: 'alice' });
  });

  it('throws when jwt.verify throws', () => {
    jwt.verify.mockImplementation(() => { throw new Error('invalid'); });
    expect(() => verifyToken('bad')).toThrow('invalid');
  });
});
