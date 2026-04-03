import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cell from '../Cell';

describe('Cell', () => {
  it('renders an empty button when value is null', () => {
    render(<Cell value={null} onClick={() => {}} isWinning={false} />);
    expect(screen.getByRole('button')).toBeEmptyDOMElement();
  });

  it('displays X when value is X', () => {
    render(<Cell value="X" onClick={() => {}} isWinning={false} />);
    expect(screen.getByRole('button')).toHaveTextContent('X');
  });

  it('displays O when value is O', () => {
    render(<Cell value="O" onClick={() => {}} isWinning={false} />);
    expect(screen.getByRole('button')).toHaveTextContent('O');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Cell value={null} onClick={onClick} isWinning={false} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when it has a value', () => {
    render(<Cell value="X" onClick={() => {}} isWinning={false} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies the winning class when isWinning is true', () => {
    render(<Cell value="X" onClick={() => {}} isWinning={true} />);
    expect(screen.getByRole('button')).toHaveClass('cell--winning');
  });

  it('does not apply the winning class when isWinning is false', () => {
    render(<Cell value="X" onClick={() => {}} isWinning={false} />);
    expect(screen.getByRole('button')).not.toHaveClass('cell--winning');
  });
});
