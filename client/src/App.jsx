import { useState, useEffect, useCallback } from 'react';
import Game from './components/Game/Game';
import ScoreBoard from './components/ScoreBoard/ScoreBoard';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import LanguageToggle from './components/LanguageToggle/LanguageToggle';
import ModeSelector from './components/ModeSelector/ModeSelector';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import { LanguageContext } from './context/LanguageContext';
import { translations } from './i18n/translations';
import { fetchScores, postScore, resetScores } from './api/scoresApi';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage } = useLanguage();
  const t = translations[lang];

  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [mode, setMode] = useState('pvp');

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
    <LanguageContext.Provider value={{ t, lang }}>
      <div className="app">
        <header className="app__header">
          <div className="app__lang">
            <LanguageToggle lang={lang} onToggle={toggleLanguage} />
          </div>
          <h1 className="app__title">{t.title}</h1>
          <div className="app__toggle">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>
        <div className="app__modes">
          <ModeSelector mode={mode} onModeChange={setMode} />
        </div>
        <div className="app__content">
          <Game key={mode} mode={mode} onGameEnd={handleGameEnd} />
          <ScoreBoard scores={scores} onReset={handleResetScores} />
        </div>
      </div>
    </LanguageContext.Provider>
  );
}

export default App;
