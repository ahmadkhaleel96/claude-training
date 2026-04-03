import './Cell.css';

function Cell({ value, onClick, isWinning }) {
  return (
    <button
      className={[
        'cell',
        value ? `cell--${value.toLowerCase()}` : '',
        isWinning ? 'cell--winning' : '',
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
