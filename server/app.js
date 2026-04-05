const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const SCORES_FILE = path.join(__dirname, 'data', 'scores.json');

app.use(cors());
app.use(express.json());

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

app.get('/api/scores', (req, res) => {
  res.json(readScores());
});

app.post('/api/scores', (req, res) => {
  const { winner } = req.body;
  if (!['X', 'O', 'draw'].includes(winner)) {
    return res.status(400).json({ error: 'Invalid winner value' });
  }
  const scores = readScores();
  if (winner === 'X') scores.X += 1;
  else if (winner === 'O') scores.O += 1;
  else scores.draws += 1;
  writeScores(scores);
  res.json(scores);
});

app.delete('/api/scores', (req, res) => {
  const reset = { X: 0, O: 0, draws: 0 };
  writeScores(reset);
  res.json(reset);
});

module.exports = app;
