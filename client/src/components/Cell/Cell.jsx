import './Cell.css';

function Cell({ value, onClick, isWinning, isHint }) {
  return (
    <button
      className={[
        'cell',
        value ? `cell--${value.toLowerCase()}` : '',
        isWinning ? 'cell--winning' : '',
        isHint ? 'cell--hint' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      disabled={!!value}
      aria-label={value ?? 'empty cell'}
    >
      {value}
    </button>
  );
}

export default Cell;
