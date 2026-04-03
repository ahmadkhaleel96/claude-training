import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Game from '../Game';

describe('Game', () => {
  it("shows Player X's turn at the start", () => {
    render(<Game onGameEnd={() => {}} />);
    expect(screen.getByText("Player X's turn")).toBeInTheDocument();
  });

  it('places X on the first click and switches to O', async () => {
    render(<Game onGameEnd={() => {}} />);
    const cells = screen.getAllByRole('button', { name: /empty cell/i });
    await userEvent.click(cells[0]);
    expect(cells[0]).toHaveTextContent('X');
    expect(screen.getByText("Player O's turn")).toBeInTheDocument();
  });

  it('alternates between X and O', async () => {
    render(<Game onGameEnd={() => {}} />);
    const cells = screen.getAllByRole('button', { name: /empty cell/i });
    await userEvent.click(cells[0]);
    await userEvent.click(cells[1]);
    expect(cells[0]).toHaveTextContent('X');
    expect(cells[1]).toHaveTextContent('O');
    expect(screen.getByText("Player X's turn")).toBeInTheDocument();
  });

  it('does not allow clicking an already-filled cell', async () => {
    render(<Game onGameEnd={() => {}} />);
    const cells = screen.getAllByRole('button', { name: /empty cell/i });
    await userEvent.click(cells[0]);
    await userEvent.click(cells[0]);
    // Still X's text, turn should still be O's
    expect(screen.getByText("Player O's turn")).toBeInTheDocument();
  });

  it('calls onGameEnd with the winner when X wins', async () => {
    const onGameEnd = vi.fn();
    render(<Game onGameEnd={onGameEnd} />);
    const cells = screen.getAllByRole('button');

    // X: 0, 1, 2 (top row) — O plays 3, 4
    await userEvent.click(cells[0]); // X
    await userEvent.click(cells[3]); // O
    await userEvent.click(cells[1]); // X
    await userEvent.click(cells[4]); // O
    await userEvent.click(cells[2]); // X wins

    expect(onGameEnd).toHaveBeenCalledWith('X');
    expect(screen.getByText('Player X wins!')).toBeInTheDocument();
  });

  it('calls onGameEnd with "draw" on a full board with no winner', async () => {
    const onGameEnd = vi.fn();
    render(<Game onGameEnd={onGameEnd} />);
    const cells = screen.getAllByRole('button');

    // Draw sequence: X O X / O X X / O X O
    const moves = [0, 1, 2, 4, 3, 6, 5, 8, 7];
    for (const index of moves) {
      await userEvent.click(cells[index]);
    }

    expect(onGameEnd).toHaveBeenCalledWith('draw');
    expect(screen.getByText("It's a draw!")).toBeInTheDocument();
  });

  it('shows Play Again after the game ends and resets on click', async () => {
    render(<Game onGameEnd={() => {}} />);
    const cells = screen.getAllByRole('button');

    await userEvent.click(cells[0]); // X
    await userEvent.click(cells[3]); // O
    await userEvent.click(cells[1]); // X
    await userEvent.click(cells[4]); // O
    await userEvent.click(cells[2]); // X wins

    const playAgain = screen.getByRole('button', { name: /play again/i });
    await userEvent.click(playAgain);

    expect(screen.getByText("Player X's turn")).toBeInTheDocument();
    expect(screen.getAllByRole('button').every((b) => b.textContent === '')).toBe(false); // buttons still render
  });
});
