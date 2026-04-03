import './ScoreBoard.css';

function ScoreBoard({ scores, onReset }) {
  return (
    <div className="scoreboard">
      <h2 className="scoreboard__title">Score</h2>
      <div className="scoreboard__grid">
        <div className="scoreboard__item">
          <span className="scoreboard__label">Player X</span>
          <span className="scoreboard__value scoreboard__value--x">{scores.X}</span>
        </div>
        <div className="scoreboard__item">
          <span className="scoreboard__label">Draws</span>
          <span className="scoreboard__value scoreboard__value--draw">{scores.draws}</span>
        </div>
        <div className="scoreboard__item">
          <span className="scoreboard__label">Player O</span>
          <span className="scoreboard__value scoreboard__value--o">{scores.O}</span>
        </div>
      </div>
      <button className="scoreboard__reset" onClick={onReset}>
        Reset Scores
      </button>
    </div>
  );
}

export default ScoreBoard;
