# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (run once after cloning)
npm run install:all

# Start both servers concurrently (React on :5173, Express on :3001)
npm run dev

# Start only the Express API server
npm run server

# Start only the React dev server
npm run client

# Build the React app for production
cd client && npm run build

# Run all tests (server + client)
npm test

# Run server tests only (Jest)
npm run test:server

# Run client tests only (Vitest)
npm run test:client

# Run client tests in watch mode
cd client && npm run test:watch
```

## Architecture

Monorepo with two runtimes:

- **`/server`** — Node.js/Express REST API. Persists scores to `server/data/scores.json` via plain `fs` read/write. No database.
- **`/client`** — React + Vite SPA. Talks to the API via `/api/*` routes, which Vite proxies to `localhost:3001` during development (see `client/vite.config.js`).

### API surface

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/scores` | Return current score totals |
| `POST` | `/api/scores` | Increment a score (`{ winner: 'X' \| 'O' \| 'draw' }`) |
| `DELETE` | `/api/scores` | Reset all scores to zero |

### Client structure

```
client/src/
├── api/scoresApi.js          # fetch wrappers for all three API calls
├── utils/gameLogic.js        # pure functions: calculateWinner(), isBoardFull()
├── components/
│   ├── Game/                 # owns board state, calls onGameEnd prop when game ends
│   ├── Board/                # renders 3×3 grid of Cell components
│   ├── Cell/                 # single clickable square; isWinning prop triggers highlight
│   ├── StatusBar/            # "Player X's turn" / "Player X wins!" / "It's a draw!"
│   ├── ResetButton/          # label toggles between "Restart" and "Play Again"
│   └── ScoreBoard/           # displays live scores fetched from API; Reset Scores button
├── App.jsx                   # fetches scores on mount, passes onGameEnd to Game
└── main.jsx
```

Each component folder contains exactly one `.jsx` and one `.css` file. All game logic lives in `utils/gameLogic.js` and is framework-free.

### Data flow

1. `App` fetches scores on mount and passes `onGameEnd(winner)` down to `Game`.
2. `Game` detects a win/draw via `gameLogic.js` and calls `onGameEnd`.
3. `App` calls `postScore(winner)` and updates the score state returned by the API.
4. `ScoreBoard` re-renders with the new totals.
