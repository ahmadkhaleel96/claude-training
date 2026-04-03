import { render, screen } from '@testing-library/react';
import StatusBar from '../StatusBar';

describe('StatusBar', () => {
  it("shows the current player's turn when no winner or draw", () => {
    render(<StatusBar currentPlayer="X" winner={null} isDraw={false} />);
    expect(screen.getByText("Player X's turn")).toBeInTheDocument();
  });

  it('shows the winner message when there is a winner', () => {
    render(<StatusBar currentPlayer="O" winner="X" isDraw={false} />);
    expect(screen.getByText('Player X wins!')).toBeInTheDocument();
  });

  it('shows the draw message when isDraw is true', () => {
    render(<StatusBar currentPlayer="X" winner={null} isDraw={true} />);
    expect(screen.getByText("It's a draw!")).toBeInTheDocument();
  });

  it('applies the winner modifier class on a win', () => {
    render(<StatusBar currentPlayer="X" winner="O" isDraw={false} />);
    expect(screen.getByText('Player O wins!')).toHaveClass(
      'status-bar__message--winner'
    );
  });

  it('applies the draw modifier class on a draw', () => {
    render(<StatusBar currentPlayer="X" winner={null} isDraw={true} />);
    expect(screen.getByText("It's a draw!")).toHaveClass(
      'status-bar__message--draw'
    );
  });
});
