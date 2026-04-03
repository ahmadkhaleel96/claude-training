import './ResetButton.css';

function ResetButton({ gameOver, onReset }) {
  return (
    <button className="reset-button" onClick={onReset}>
      {gameOver ? 'Play Again' : 'Restart'}
    </button>
  );
}

export default ResetButton;
