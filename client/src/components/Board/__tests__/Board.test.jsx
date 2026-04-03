import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Board from '../Board';

const emptyBoard = Array(9).fill(null);

describe('Board', () => {
  it('renders 9 cells', () => {
    render(<Board board={emptyBoard} onCellClick={() => {}} winningLine={null} />);
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });

  it('passes each cell its value', () => {
    const board = ['X', 'O', null, null, null, null, null, null, null];
    render(<Board board={board} onCellClick={() => {}} winningLine={null} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('X');
    expect(buttons[1]).toHaveTextContent('O');
    expect(buttons[2]).toBeEmptyDOMElement();
  });

  it('calls onCellClick with the correct index', async () => {
    const onCellClick = vi.fn();
    render(<Board board={emptyBoard} onCellClick={onCellClick} winningLine={null} />);
    await userEvent.click(screen.getAllByRole('button')[4]);
    expect(onCellClick).toHaveBeenCalledWith(4);
  });

  it('marks winning cells', () => {
    const board = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
    render(<Board board={board} onCellClick={() => {}} winningLine={[0, 1, 2]} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveClass('cell--winning');
    expect(buttons[1]).toHaveClass('cell--winning');
    expect(buttons[2]).toHaveClass('cell--winning');
    expect(buttons[3]).not.toHaveClass('cell--winning');
  });
});
