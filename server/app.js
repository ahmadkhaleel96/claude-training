const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { hashPassword, comparePassword, signToken, verifyToken } = require('./auth');

const app = express();
const SCORES_FILE = path.join(__dirname, 'data', 'scores.json');
const LEADERBOARD_FILE = path.join(__dirname, 'data', 'leaderboard.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

app.use(cors());
app.use(express.json());

// ── scores helpers ────────────────────────────────────────────────────────────

function readScores() {
  if (!fs.existsSync(SCORES_FILE)) {
    const initial = { X: 0, O: 0, draws: 0 };
    fs.mkdirSync(path.dirname(SCORES_FILE), { recursive: true });
    fs.writeFileSync(SCORES_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
}

function writeScores(scores) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
}

// ── leaderboard helpers ───────────────────────────────────────────────────────

function readLeaderboard() {
  if (!fs.existsSync(LEADERBOARD_FILE)) {
    fs.mkdirSync(path.dirname(LEADERBOARD_FILE), { recursive: true });
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'));
}

function writeLeaderboard(data) {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2));
}

function ensureEntry(lb, username) {
  if (!lb[username]) lb[username] = { wins: 0, losses: 0, draws: 0 };
}

function updateLeaderboard(winner, users) {
  if (!users) return;
  const { X: xUser, O: oUser } = users;
  const xValid = xUser && typeof xUser === 'string' && xUser.trim().length > 0;
  const oValid = oUser && typeof oUser === 'string' && oUser.trim().length > 0;
  if (!xValid && !oValid) return;

  const lb = readLeaderboard();

  if (winner === 'X') {
    if (xValid) { ensureEntry(lb, xUser); lb[xUser].wins++; }
    if (oValid) { ensureEntry(lb, oUser); lb[oUser].losses++; }
  } else if (winner === 'O') {
    if (oValid) { ensureEntry(lb, oUser); lb[oUser].wins++; }
    if (xValid) { ensureEntry(lb, xUser); lb[xUser].losses++; }
  } else if (winner === 'draw') {
    if (xValid) { ensureEntry(lb, xUser); lb[xUser].draws++; }
    if (oValid) { ensureEntry(lb, oUser); lb[oUser].draws++; }
  }

  writeLeaderboard(lb);
}

// ── users helpers ────────────────────────────────────────────────────────────

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// ── scores routes ─────────────────────────────────────────────────────────────

app.get('/api/scores', (req, res) => {
  res.json(readScores());
});

app.post('/api/scores', (req, res) => {
  const { winner, users, token, symbol } = req.body;
  if (!['X', 'O', 'draw'].includes(winner)) {
    return res.status(400).json({ error: 'Invalid winner value' });
  }
  const scores = readScores();
  if (winner === 'X') scores.X += 1;
  else if (winner === 'O') scores.O += 1;
  else scores.draws += 1;
  writeScores(scores);

  if (token && symbol) {
    try {
      const { username } = verifyToken(token);
      const tokenUsers = {
        X: symbol === 'X' ? username : null,
        O: symbol === 'O' ? username : null,
      };
      updateLeaderboard(winner, tokenUsers);
    } catch {
      // invalid or expired token — skip leaderboard update
    }
  } else if (users) {
    updateLeaderboard(winner, users);
  }

  res.json(scores);
});

app.delete('/api/scores', (req, res) => {
  const reset = { X: 0, O: 0, draws: 0 };
  writeScores(reset);
  res.json(reset);
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
  const users = readUsers();
  if (users[trimmed]) {
    return res.status(409).json({ error: 'Username already taken.' });
  }
  const hash = await hashPassword(password);
  users[trimmed] = { passwordHash: hash };
  writeUsers(users);
  const token = signToken(trimmed);
  res.json({ token, username: trimmed });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  const trimmed = username.trim();
  const users = readUsers();
  const user = users[trimmed];
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const token = signToken(trimmed);
  res.json({ token, username: trimmed });
});

// ── leaderboard routes ────────────────────────────────────────────────────────

app.get('/api/leaderboard', (req, res) => {
  const lb = readLeaderboard();
  const entries = Object.entries(lb).map(([username, stats]) => ({
    username,
    ...stats,
  }));
  entries.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const rateA = a.wins / (a.wins + a.losses + a.draws || 1);
    const rateB = b.wins / (b.wins + b.losses + b.draws || 1);
    return rateB - rateA;
  });
  res.json(entries);
});

app.delete('/api/leaderboard', (req, res) => {
  writeLeaderboard({});
  res.json({});
});

module.exports = app;
