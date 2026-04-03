import { useTranslations } from '../../context/LanguageContext';
import './ModeSelector.css';

function ModeSelector({ mode, onModeChange }) {
  const { t } = useTranslations();

  return (
    <div className="mode-selector" role="group" aria-label="Game mode">
      <button
        className={`mode-selector__btn ${mode === 'pvp' ? 'mode-selector__btn--active' : ''}`}
        onClick={() => onModeChange('pvp')}
        aria-pressed={mode === 'pvp'}
      >
        {t.playerVsPlayer}
      </button>
      <button
        className={`mode-selector__btn ${mode === 'pvc' ? 'mode-selector__btn--active' : ''}`}
        onClick={() => onModeChange('pvc')}
        aria-pressed={mode === 'pvc'}
      >
        {t.playerVsComputer}
      </button>
    </div>
  );
}

export default ModeSelector;
