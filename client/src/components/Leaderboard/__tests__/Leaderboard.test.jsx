import { render, screen } from '@testing-library/react';
import { LanguageContext } from '../../../context/LanguageContext';
import { translations } from '../../../i18n/translations';
import Leaderboard from '../Leaderboard';

function renderLeaderboard(entries) {
  return render(
    <LanguageContext.Provider value={{ t: translations.en, lang: 'en' }}>
      <Leaderboard entries={entries} />
    </LanguageContext.Provider>
  );
}

describe('Leaderboard', () => {
  it('renders the leaderboard title', () => {
    renderLeaderboard([]);
    expect(screen.getByText(translations.en.leaderboard)).toBeInTheDocument();
  });

  it('shows empty state message when entries is empty', () => {
    renderLeaderboard([]);
    expect(screen.getByText(translations.en.noLeaderboardData)).toBeInTheDocument();
  });

  it('renders a row for each entry', () => {
    const entries = [
      { username: 'alice', wins: 5, losses: 1, draws: 2 },
      { username: 'bob', wins: 3, losses: 2, draws: 0 },
    ];
    renderLeaderboard(entries);
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });

  it('displays rank numbers starting from 1', () => {
    const entries = [
      { username: 'alice', wins: 10, losses: 0, draws: 0 },
      { username: 'bob', wins: 9, losses: 0, draws: 0 },
    ];
    renderLeaderboard(entries);
    // Rank cells have the leaderboard__td--rank class
    const rankCells = document.querySelectorAll('.leaderboard__td--rank');
    expect(rankCells[0]).toHaveTextContent('1');
    expect(rankCells[1]).toHaveTextContent('2');
  });

  it('shows wins, losses, and draws columns', () => {
    renderLeaderboard([{ username: 'alice', wins: 5, losses: 2, draws: 3 }]);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not render the empty message when entries exist', () => {
    renderLeaderboard([{ username: 'alice', wins: 1, losses: 0, draws: 0 }]);
    expect(screen.queryByText(translations.en.noLeaderboardData)).not.toBeInTheDocument();
  });
});
