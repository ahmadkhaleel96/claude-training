import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as scoresApi from './api/scoresApi';

vi.mock('./api/scoresApi');

const defaultScores = { X: 0, O: 0, draws: 0 };

beforeEach(() => {
  scoresApi.fetchScores.mockResolvedValue(defaultScores);
  scoresApi.postScore.mockResolvedValue({ X: 1, O: 0, draws: 0 });
  scoresApi.resetScores.mockResolvedValue(defaultScores);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('App', () => {
  it('fetches and displays scores on mount', async () => {
    scoresApi.fetchScores.mockResolvedValue({ X: 2, O: 1, draws: 3 });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('calls postScore with the winner when a game ends', async () => {
    render(<App />);
    await waitFor(() => expect(scoresApi.fetchScores).toHaveBeenCalled());

    const cells = screen.getAllByRole('button');
    // X wins via top row
    await userEvent.click(cells[0]); // X
    await userEvent.click(cells[3]); // O
    await userEvent.click(cells[1]); // X
    await userEvent.click(cells[4]); // O
    await userEvent.click(cells[2]); // X wins

    await waitFor(() => {
      expect(scoresApi.postScore).toHaveBeenCalledWith('X');
    });
  });

  it('calls resetScores and updates scoreboard when reset is clicked', async () => {
    render(<App />);
    await waitFor(() => expect(scoresApi.fetchScores).toHaveBeenCalled());

    await userEvent.click(screen.getByRole('button', { name: /reset scores/i }));

    expect(scoresApi.resetScores).toHaveBeenCalledTimes(1);
  });
});
