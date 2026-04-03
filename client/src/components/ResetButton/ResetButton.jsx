import { useTranslations } from '../../context/LanguageContext';
import './ResetButton.css';

function ResetButton({ gameOver, onReset }) {
  const { t } = useTranslations();

  return (
    <button className="reset-button" onClick={onReset}>
      {gameOver ? t.playAgain : t.restart}
    </button>
  );
}

export default ResetButton;
