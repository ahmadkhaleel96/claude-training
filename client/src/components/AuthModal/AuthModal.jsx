import { useState } from 'react';
import { useTranslations } from '../../context/LanguageContext';
import './AuthModal.css';

function AuthModal({ onLogin, onRegister, onGuest }) {
  const { t } = useTranslations();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register' && password !== confirm) {
      setError(t.passwordMismatch);
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(username.trim(), password);
      } else {
        await onRegister(username.trim(), password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError('');
    setPassword('');
    setConfirm('');
  };

  const isFormValid =
    username.trim().length > 0 &&
    password.length > 0 &&
    (mode === 'login' || confirm.length > 0);

  return (
    <div className="auth-modal__overlay" role="dialog" aria-modal="true" aria-label={t.chooseHowToPlay}>
      <div className="auth-modal">
        <h2 className="auth-modal__title">{t.chooseHowToPlay}</h2>
        <p className="auth-modal__subtitle">{t.authModalSubtitle}</p>

        <form className="auth-modal__form" onSubmit={handleSubmit}>
          <input
            className="auth-modal__input"
            type="text"
            placeholder={t.enterUsername}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            autoFocus
            aria-label={t.enterUsername}
          />
          <input
            className="auth-modal__input"
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label={t.password}
          />
          {mode === 'register' && (
            <input
              className="auth-modal__input"
              type="password"
              placeholder={t.confirmPassword}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-label={t.confirmPassword}
            />
          )}
          {error && (
            <p className="auth-modal__error" role="alert">
              {error}
            </p>
          )}
          <button
            className="auth-modal__btn auth-modal__btn--primary"
            type="submit"
            disabled={!isFormValid || loading}
          >
            {loading ? t.loading : mode === 'login' ? t.login : t.register}
          </button>
        </form>

        <button className="auth-modal__btn auth-modal__btn--link" onClick={switchMode} type="button">
          {mode === 'login' ? t.noAccount : t.alreadyHaveAccount}
        </button>

        <div className="auth-modal__divider">{t.or}</div>

        <button className="auth-modal__btn" onClick={onGuest} type="button">
          {t.continueAsGuest}
        </button>
      </div>
    </div>
  );
}

export default AuthModal;
