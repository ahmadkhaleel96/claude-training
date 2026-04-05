-- scores: singleton row holding aggregate game scores
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY DEFAULT 1,
  x_wins INTEGER NOT NULL DEFAULT 0,
  o_wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT scores_single_row CHECK (id = 1)
);
INSERT INTO scores (id, x_wins, o_wins, draws)
VALUES (1, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- users: registered players
CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- leaderboard: per-player win/loss/draw totals
CREATE TABLE IF NOT EXISTS leaderboard (
  username TEXT PRIMARY KEY,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0
);
