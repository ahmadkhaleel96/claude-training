import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScoreBoard from '../ScoreBoard';

const scores = { X: 3, O: 1, draws: 2 };

describe('ScoreBoard', () => {
  it('displays the X, O, and draw counts', () => {
    render(<ScoreBoard scores={scores} onReset={() => {}} />);
    const values = screen.getAllByText(/\d+/);
    const texts = values.map((el) => el.textContent);
    expect(texts).toContain('3');
    expect(texts).toContain('1');
    expect(texts).toContain('2');
  });

  it('calls onReset when the reset button is clicked', async () => {
    const onReset = vi.fn();
    render(<ScoreBoard scores={scores} onReset={onReset} />);
    await userEvent.click(screen.getByRole('button', { name: /reset scores/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
