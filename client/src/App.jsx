import { useState, useEffect, useCallback } from 'react';
import Game from './components/Game/Game';
import ScoreBoard from './components/ScoreBoard/ScoreBoard';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import { fetchScores, postScore, resetScores } from './api/scoresApi';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  useEffect(() => {
    fetchScores()
      .then(setScores)
      .catch(console.error);
  }, []);

  const handleGameEnd = useCallback((winner) => {
    postScore(winner)
      .then(setScores)
      .catch(console.error);
  }, []);

  const handleResetScores = useCallback(() => {
    resetScores()
      .then(setScores)
      .catch(console.error);
  }, []);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Tic-Tac-Toe</h1>
        <div className="app__toggle">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>
      <div className="app__content">
        <Game onGameEnd={handleGameEnd} />
        <ScoreBoard scores={scores} onReset={handleResetScores} />
      </div>
    </div>
  );
}

export default App;
