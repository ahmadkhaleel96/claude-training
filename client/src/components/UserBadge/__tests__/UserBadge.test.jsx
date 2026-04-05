import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageContext } from '../../../context/LanguageContext';
import { translations } from '../../../i18n/translations';
import UserBadge from '../UserBadge';

function renderBadge(props = {}) {
  const defaults = { username: null, onChangeUser: vi.fn() };
  return render(
    <LanguageContext.Provider value={{ t: translations.en, lang: 'en' }}>
      <UserBadge {...defaults} {...props} />
    </LanguageContext.Provider>
  );
}

describe('UserBadge — guest', () => {
  it('shows "Guest" label when username is null', () => {
    renderBadge({ username: null });
    expect(screen.getByText(translations.en.playingAsGuest)).toBeInTheDocument();
  });

  it('shows Sign In button when username is null', () => {
    renderBadge({ username: null });
    expect(screen.getByRole('button', { name: translations.en.signIn })).toBeInTheDocument();
  });
});

describe('UserBadge — signed in', () => {
  it('shows the username', () => {
    renderBadge({ username: 'alice' });
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('shows Change button when signed in', () => {
    renderBadge({ username: 'alice' });
    expect(screen.getByRole('button', { name: translations.en.changeUser })).toBeInTheDocument();
  });
});

describe('UserBadge — interactions', () => {
  it('calls onChangeUser when the action button is clicked (guest)', async () => {
    const onChangeUser = vi.fn();
    renderBadge({ username: null, onChangeUser });
    await userEvent.click(screen.getByRole('button', { name: translations.en.signIn }));
    expect(onChangeUser).toHaveBeenCalledTimes(1);
  });

  it('calls onChangeUser when the Change button is clicked (signed in)', async () => {
    const onChangeUser = vi.fn();
    renderBadge({ username: 'alice', onChangeUser });
    await userEvent.click(screen.getByRole('button', { name: translations.en.changeUser }));
    expect(onChangeUser).toHaveBeenCalledTimes(1);
  });
});
