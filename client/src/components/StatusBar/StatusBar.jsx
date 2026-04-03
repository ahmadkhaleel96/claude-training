import './StatusBar.css';

function StatusBar({ currentPlayer, winner, isDraw }) {
  let message;
  let modifier = '';

  if (winner) {
    message = `Player ${winner} wins!`;
    modifier = 'status-bar__message--winner';
  } else if (isDraw) {
    message = "It's a draw!";
    modifier = 'status-bar__message--draw';
  } else {
    message = `Player ${currentPlayer}'s turn`;
  }

  return (
    <div className="status-bar">
      <p className={`status-bar__message ${modifier}`}>{message}</p>
    </div>
  );
}

export default StatusBar;
