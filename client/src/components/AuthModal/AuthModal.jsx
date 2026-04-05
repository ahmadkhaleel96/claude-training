import { useState } from 'react';
import { useTranslations } from '../../context/LanguageContext';
import './AuthModal.css';

function AuthModal({ onSetUsername, onGuest }) {
  const { t } = useTranslations();
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) onSetUsername(trimmed);
  };

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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={20}
            autoFocus
            aria-label={t.enterUsername}
          />
          <button
            className="auth-modal__btn auth-modal__btn--primary"
            type="submit"
            disabled={!input.trim()}
          >
            {t.playWithUsername}
          </button>
        </form>

        <div className="auth-modal__divider">{t.or}</div>

        <button className="auth-modal__btn" onClick={onGuest}>
          {t.continueAsGuest}
        </button>
      </div>
    </div>
  );
}

export default AuthModal;
