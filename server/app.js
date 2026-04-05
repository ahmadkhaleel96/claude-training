const express = require('express');
const cors = require('cors');
const { hashPassword, comparePassword, signToken, verifyToken } = require('./auth');
const store = require('./store');

const app = express();
app.use(cors());
app.use(express.json());

// ── scores routes ─────────────────────────────────────────────────────────────

app.get('/api/scores', async (req, res) => {
  try {
    res.json(await store.getScores());
  } catch {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

app.post('/api/scores', async (req, res) => {
  const { winner, users, token, symbol } = req.body;
  if (!['X', 'O', 'draw'].includes(winner)) {
    return res.status(400).json({ error: 'Invalid winner value' });
  }

  try {
    const scores = await store.updateScores(winner);

    if (token && symbol) {
      try {
        const { username } = verifyToken(token);
        const tokenUsers = {
          X: symbol === 'X' ? username : null,
          O: symbol === 'O' ? username : null,
        };
        await store.updateLeaderboard(winner, tokenUsers);
      } catch {
        // invalid or expired token — skip leaderboard update
      }
    } else if (users) {
      await store.updateLeaderboard(winner, users);
    }

    res.json(scores);
  } catch {
    res.status(500).json({ error: 'Failed to update scores' });
  }
});

app.delete('/api/scores', async (req, res) => {
  try {
    res.json(await store.resetScores());
  } catch {
    res.status(500).json({ error: 'Failed to reset scores' });
  }
});

// ── auth routes ───────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || typeof username !== 'string' || username.trim().length < 2) {
    return res.status(400).json({ error: 'Username must be at least 2 characters.' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  const trimmed = username.trim();

  try {
    const existing = await store.getUser(trimmed);
    if (existing) {
      return res.status(409).json({ error: 'Username already taken.' });
    }
    const hash = await hashPassword(password);
    await store.createUser(trimmed, hash);
    const token = signToken(trimmed);
    res.json({ token, username: trimmed });
  } catch {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  const trimmed = username.trim();

  try {
    const user = await store.getUser(trimmed);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    const token = signToken(trimmed);
    res.json({ token, username: trimmed });
  } catch {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// ── leaderboard routes ────────────────────────────────────────────────────────

app.get('/api/leaderboard', async (req, res) => {
  try {
    const entries = await store.getLeaderboard();
    entries.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const rateA = a.wins / (a.wins + a.losses + a.draws || 1);
      const rateB = b.wins / (b.wins + b.losses + b.draws || 1);
      return rateB - rateA;
    });
    res.json(entries);
  } catch {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.delete('/api/leaderboard', async (req, res) => {
  try {
    await store.resetLeaderboard();
    res.json({});
  } catch {
    res.status(500).json({ error: 'Failed to reset leaderboard' });
  }
});

module.exports = app;
