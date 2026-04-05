import { useState, useEffect, useCallback } from 'react';
import Game from './components/Game/Game';
import OnlineGame from './components/OnlineGame/OnlineGame';
import ScoreBoard from './components/ScoreBoard/ScoreBoard';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import LanguageToggle from './components/LanguageToggle/LanguageToggle';
import ModeSelector from './components/ModeSelector/ModeSelector';
import AuthModal from './components/AuthModal/AuthModal';
import Leaderboard from './components/Leaderboard/Leaderboard';
import UserBadge from './components/UserBadge/UserBadge';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import { useAuth } from './hooks/useAuth';
import { LanguageContext } from './context/LanguageContext';
import { AuthContext } from './context/AuthContext';
import { translations } from './i18n/translations';
import { fetchScores, postScore, resetScores } from './api/scoresApi';
import { fetchLeaderboard } from './api/leaderboardApi';
import './App.css';

function getInitialRoomId() {
  return new URLSearchParams(window.location.search).get('room');
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage } = useLanguage();
  const { username, token, showModal, login, register, continueAsGuest, openModal, logout } = useAuth();
  const t = translations[lang];

  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [initialRoomId] = useState(getInitialRoomId);
  const [mode, setMode] = useState(initialRoomId ? 'pvf' : 'pvp');

  useEffect(() => {
    fetchScores().then(setScores).catch(console.error);
  }, []);

  const refreshLeaderboard = useCallback(() => {
    fetchLeaderboard().then(setLeaderboard).catch(console.error);
  }, []);

  useEffect(() => {
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  const handleGameEnd = useCallback(
    (winner) => {
      const options = mode !== 'pvf' && token ? { token, symbol: 'X' } : {};
      postScore(winner, options)
        .then((updated) => {
          setScores(updated);
          if (username) refreshLeaderboard();
        })
        .catch(console.error);
    },
    [mode, token, username, refreshLeaderboard]
  );

  const handleResetScores = useCallback(() => {
    resetScores().then(setScores).catch(console.error);
  }, []);

  return (
    <AuthContext.Provider value={{ username, openModal, logout }}>
      <LanguageContext.Provider value={{ t, lang }}>
        {showModal && (
          <AuthModal onLogin={login} onRegister={register} onGuest={continueAsGuest} />
        )}
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

          <div className="app__user-bar">
            <UserBadge username={username} onChangeUser={openModal} />
          </div>

          <div className="app__modes">
            <ModeSelector mode={mode} onModeChange={setMode} />
          </div>

          <div className="app__content">
            {mode === 'pvf' ? (
              <OnlineGame
                key="pvf"
                initialRoomId={initialRoomId}
                onGameEnd={handleGameEnd}
              />
            ) : (
              <Game key={mode} mode={mode} onGameEnd={handleGameEnd} />
            )}
            <ScoreBoard scores={scores} onReset={handleResetScores} />
            <Leaderboard entries={leaderboard} />
          </div>
        </div>
      </LanguageContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
