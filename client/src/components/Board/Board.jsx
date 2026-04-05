import Cell from '../Cell/Cell';
import './Board.css';

function Board({ board, onCellClick, winningLine, hintIndex }) {
  return (
    <div className="board">
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          onClick={() => onCellClick(index)}
          isWinning={winningLine?.includes(index) ?? false}
          isHint={hintIndex === index}
        />
      ))}
    </div>
  );
}

export default Board;
