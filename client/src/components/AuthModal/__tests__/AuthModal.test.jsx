import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageContext } from '../../../context/LanguageContext';
import { translations } from '../../../i18n/translations';
import AuthModal from '../AuthModal';

function renderModal(props = {}) {
  const defaults = { onSetUsername: vi.fn(), onGuest: vi.fn() };
  return render(
    <LanguageContext.Provider value={{ t: translations.en, lang: 'en' }}>
      <AuthModal {...defaults} {...props} />
    </LanguageContext.Provider>
  );
}

describe('AuthModal', () => {
  it('renders the title', () => {
    renderModal();
    expect(screen.getByText(translations.en.chooseHowToPlay)).toBeInTheDocument();
  });

  it('renders the username input', () => {
    renderModal();
    expect(screen.getByRole('textbox', { name: /enter username/i })).toBeInTheDocument();
  });

  it('renders the Play button (disabled when input is empty)', () => {
    renderModal();
    expect(screen.getByRole('button', { name: translations.en.playWithUsername })).toBeDisabled();
  });

  it('enables the Play button when input has text', async () => {
    renderModal();
    await userEvent.type(screen.getByRole('textbox', { name: /enter username/i }), 'alice');
    expect(screen.getByRole('button', { name: translations.en.playWithUsername })).toBeEnabled();
  });

  it('calls onSetUsername with trimmed input on Play click', async () => {
    const onSetUsername = vi.fn();
    renderModal({ onSetUsername });
    await userEvent.type(screen.getByRole('textbox', { name: /enter username/i }), '  alice  ');
    await userEvent.click(screen.getByRole('button', { name: translations.en.playWithUsername }));
    expect(onSetUsername).toHaveBeenCalledWith('alice');
  });

  it('calls onSetUsername when Enter is pressed in the input', async () => {
    const onSetUsername = vi.fn();
    renderModal({ onSetUsername });
    await userEvent.type(screen.getByRole('textbox', { name: /enter username/i }), 'bob{Enter}');
    expect(onSetUsername).toHaveBeenCalledWith('bob');
  });

  it('does not call onSetUsername on Enter when input is empty', async () => {
    const onSetUsername = vi.fn();
    renderModal({ onSetUsername });
    await userEvent.type(screen.getByRole('textbox', { name: /enter username/i }), '{Enter}');
    expect(onSetUsername).not.toHaveBeenCalled();
  });

  it('renders the Continue as Guest button', () => {
    renderModal();
    expect(screen.getByRole('button', { name: translations.en.continueAsGuest })).toBeInTheDocument();
  });

  it('calls onGuest when Continue as Guest is clicked', async () => {
    const onGuest = vi.fn();
    renderModal({ onGuest });
    await userEvent.click(screen.getByRole('button', { name: translations.en.continueAsGuest }));
    expect(onGuest).toHaveBeenCalledTimes(1);
  });

  it('renders as a dialog with an accessible label', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
