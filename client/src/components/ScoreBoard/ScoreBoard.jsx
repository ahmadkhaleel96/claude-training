import { useTranslations } from '../../context/LanguageContext';
import './ScoreBoard.css';

function ScoreBoard({ scores, onReset }) {
  const { t } = useTranslations();

  return (
    <div className="scoreboard">
      <h2 className="scoreboard__title">{t.score}</h2>
      <div className="scoreboard__grid">
        <div className="scoreboard__item">
          <span className="scoreboard__label">{t.playerX}</span>
          <span key={scores.X} className="scoreboard__value scoreboard__value--x">
            {scores.X}
          </span>
        </div>
        <div className="scoreboard__item">
          <span className="scoreboard__label">{t.draws}</span>
          <span key={scores.draws} className="scoreboard__value scoreboard__value--draw">
            {scores.draws}
          </span>
        </div>
        <div className="scoreboard__item">
          <span className="scoreboard__label">{t.playerO}</span>
          <span key={scores.O} className="scoreboard__value scoreboard__value--o">
            {scores.O}
          </span>
        </div>
      </div>
      <button className="scoreboard__reset" onClick={onReset}>
        {t.resetScores}
      </button>
    </div>
  );
}

export default ScoreBoard;
