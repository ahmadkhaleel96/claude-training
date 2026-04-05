import { translations } from '../translations';

const REQUIRED_KEYS = [
  'title',
  'playerTurn',
  'playerWins',
  'draw',
  'restart',
  'playAgain',
  'score',
  'playerX',
  'playerO',
  'draws',
  'resetScores',
  'switchToArabic',
  'switchToEnglish',
  'playerVsPlayer',
  'playerVsComputer',
  'computerTurn',
  'playerVsFriend',
  'createRoom',
  'joinRoom',
  'or',
  'enterRoomCode',
  'waitingForOpponent',
  'yourSymbol',
  'shareLink',
  'roomLink',
  'copyLink',
  'opponentDisconnected',
  'chooseHowToPlay',
  'enterUsername',
  'playWithUsername',
  'continueAsGuest',
  'playingAsGuest',
  'changeUser',
  'signIn',
  'hint',
  'leaderboard',
  'player',
  'wins',
  'losses',
  'noLeaderboardData',
];

describe('translations shape', () => {
  it('exports an "en" locale', () => {
    expect(translations).toHaveProperty('en');
  });

  it('exports an "ar" locale', () => {
    expect(translations).toHaveProperty('ar');
  });

  it.each(REQUIRED_KEYS)('en has key "%s"', (key) => {
    expect(translations.en).toHaveProperty(key);
  });

  it.each(REQUIRED_KEYS)('ar has key "%s"', (key) => {
    expect(translations.ar).toHaveProperty(key);
  });
});

describe('English strings', () => {
  const { en } = translations;

  it('title is Tic-Tac-Toe', () => {
    expect(en.title).toBe('Tic-Tac-Toe');
  });

  it('playerTurn interpolates the player symbol', () => {
    expect(en.playerTurn('X')).toBe("Player X's turn");
    expect(en.playerTurn('O')).toBe("Player O's turn");
  });

  it('playerWins interpolates the player symbol', () => {
    expect(en.playerWins('X')).toBe('Player X wins!');
    expect(en.playerWins('O')).toBe('Player O wins!');
  });

  it('draw is a non-empty string', () => {
    expect(typeof en.draw).toBe('string');
    expect(en.draw.length).toBeGreaterThan(0);
  });

  it('restart is a non-empty string', () => {
    expect(typeof en.restart).toBe('string');
    expect(en.restart.length).toBeGreaterThan(0);
  });

  it('playAgain is a non-empty string', () => {
    expect(typeof en.playAgain).toBe('string');
    expect(en.playAgain.length).toBeGreaterThan(0);
  });

  it('restart and playAgain are distinct', () => {
    expect(en.restart).not.toBe(en.playAgain);
  });
});

describe('Arabic strings', () => {
  const { ar } = translations;

  it('title is the Arabic name for the game', () => {
    expect(ar.title).toBe('إكس أو');
  });

  it('playerTurn interpolates the player symbol', () => {
    expect(ar.playerTurn('X')).toContain('X');
    expect(ar.playerTurn('O')).toContain('O');
  });

  it('playerWins interpolates the player symbol', () => {
    expect(ar.playerWins('X')).toContain('X');
    expect(ar.playerWins('O')).toContain('O');
  });

  it('playerTurn and playerWins return different strings for the same player', () => {
    expect(ar.playerTurn('X')).not.toBe(ar.playerWins('X'));
  });

  it('all static strings are non-empty', () => {
    const staticKeys = ['draw', 'restart', 'playAgain', 'score', 'playerX', 'playerO', 'draws', 'resetScores'];
    staticKeys.forEach((key) => {
      expect(typeof ar[key]).toBe('string');
      expect(ar[key].length).toBeGreaterThan(0);
    });
  });

  it('restart and playAgain are distinct', () => {
    expect(ar.restart).not.toBe(ar.playAgain);
  });
});

describe('locale parity', () => {
  it('en and ar produce different playerTurn strings', () => {
    expect(translations.en.playerTurn('X')).not.toBe(translations.ar.playerTurn('X'));
  });

  it('en and ar produce different playerWins strings', () => {
    expect(translations.en.playerWins('X')).not.toBe(translations.ar.playerWins('X'));
  });

  it('en and ar titles are different', () => {
    expect(translations.en.title).not.toBe(translations.ar.title);
  });
});
