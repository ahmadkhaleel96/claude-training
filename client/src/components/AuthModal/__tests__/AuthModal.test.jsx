import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageContext } from '../../../context/LanguageContext';
import { translations } from '../../../i18n/translations';
import AuthModal from '../AuthModal';

function renderModal(props = {}) {
  const defaults = {
    onLogin: vi.fn().mockResolvedValue(undefined),
    onRegister: vi.fn().mockResolvedValue(undefined),
    onGuest: vi.fn(),
  };
  return {
    ...render(
      <LanguageContext.Provider value={{ t: translations.en, lang: 'en' }}>
        <AuthModal {...defaults} {...props} />
      </LanguageContext.Provider>
    ),
    defaults,
  };
}

async function fillLoginForm(username, password) {
  await userEvent.type(screen.getByRole('textbox', { name: translations.en.enterUsername }), username);
  await userEvent.type(screen.getByLabelText(translations.en.password), password);
}

describe('AuthModal — structure', () => {
  it('renders the title', () => {
    renderModal();
    expect(screen.getByText(translations.en.chooseHowToPlay)).toBeInTheDocument();
  });

  it('renders as a dialog with an accessible label', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('defaults to login mode', () => {
    renderModal();
    expect(screen.getByRole('button', { name: translations.en.login })).toBeInTheDocument();
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
});

describe('AuthModal — login mode', () => {
  it('renders username and password inputs', () => {
    renderModal();
    expect(screen.getByRole('textbox', { name: translations.en.enterUsername })).toBeInTheDocument();
    expect(screen.getByLabelText(translations.en.password)).toBeInTheDocument();
  });

  it('does not render confirm password input', () => {
    renderModal();
    expect(screen.queryByLabelText(translations.en.confirmPassword)).not.toBeInTheDocument();
  });

  it('sign-in button is disabled when form is empty', () => {
    renderModal();
    expect(screen.getByRole('button', { name: translations.en.login })).toBeDisabled();
  });

  it('sign-in button is enabled when username and password are filled', async () => {
    renderModal();
    await fillLoginForm('alice', 'pass123');
    expect(screen.getByRole('button', { name: translations.en.login })).toBeEnabled();
  });

  it('calls onLogin with username and password on submit', async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    renderModal({ onLogin });
    await fillLoginForm('alice', 'pass123');
    await userEvent.click(screen.getByRole('button', { name: translations.en.login }));
    expect(onLogin).toHaveBeenCalledWith('alice', 'pass123');
  });

  it('displays error when onLogin rejects', async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error('Invalid username or password.'));
    renderModal({ onLogin });
    await fillLoginForm('alice', 'wrong');
    await userEvent.click(screen.getByRole('button', { name: translations.en.login }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid username or password.')
    );
  });

  it('shows register link to switch modes', () => {
    renderModal();
    expect(screen.getByRole('button', { name: translations.en.noAccount })).toBeInTheDocument();
  });
});

describe('AuthModal — register mode', () => {
  async function switchToRegister() {
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: translations.en.noAccount }));
  }

  it('shows register submit button after switching mode', async () => {
    await switchToRegister();
    expect(screen.getByRole('button', { name: translations.en.register })).toBeInTheDocument();
  });

  it('renders confirm password input in register mode', async () => {
    await switchToRegister();
    expect(screen.getByLabelText(translations.en.confirmPassword)).toBeInTheDocument();
  });

  it('register button is disabled until all fields are filled', async () => {
    await switchToRegister();
    await userEvent.type(screen.getByRole('textbox', { name: translations.en.enterUsername }), 'alice');
    await userEvent.type(screen.getByLabelText(translations.en.password), 'pass123');
    expect(screen.getByRole('button', { name: translations.en.register })).toBeDisabled();
  });

  it('register button is enabled when all fields are filled', async () => {
    await switchToRegister();
    await userEvent.type(screen.getByRole('textbox', { name: translations.en.enterUsername }), 'alice');
    await userEvent.type(screen.getByLabelText(translations.en.password), 'pass123');
    await userEvent.type(screen.getByLabelText(translations.en.confirmPassword), 'pass123');
    expect(screen.getByRole('button', { name: translations.en.register })).toBeEnabled();
  });

  it('shows password mismatch error without calling onRegister', async () => {
    const onRegister = vi.fn();
    renderModal({ onRegister });
    await userEvent.click(screen.getByRole('button', { name: translations.en.noAccount }));
    await userEvent.type(screen.getByRole('textbox', { name: translations.en.enterUsername }), 'alice');
    await userEvent.type(screen.getByLabelText(translations.en.password), 'pass123');
    await userEvent.type(screen.getByLabelText(translations.en.confirmPassword), 'different');
    await userEvent.click(screen.getByRole('button', { name: translations.en.register }));
    expect(screen.getByRole('alert')).toHaveTextContent(translations.en.passwordMismatch);
    expect(onRegister).not.toHaveBeenCalled();
  });

  it('calls onRegister with username and password when passwords match', async () => {
    const onRegister = vi.fn().mockResolvedValue(undefined);
    renderModal({ onRegister });
    await userEvent.click(screen.getByRole('button', { name: translations.en.noAccount }));
    await userEvent.type(screen.getByRole('textbox', { name: translations.en.enterUsername }), 'alice');
    await userEvent.type(screen.getByLabelText(translations.en.password), 'pass123');
    await userEvent.type(screen.getByLabelText(translations.en.confirmPassword), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: translations.en.register }));
    expect(onRegister).toHaveBeenCalledWith('alice', 'pass123');
  });

  it('shows sign-in link to switch back to login', async () => {
    await switchToRegister();
    expect(screen.getByRole('button', { name: translations.en.alreadyHaveAccount })).toBeInTheDocument();
  });

  it('clears password fields when switching modes', async () => {
    await switchToRegister();
    await userEvent.type(screen.getByLabelText(translations.en.password), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: translations.en.alreadyHaveAccount }));
    expect(screen.getByLabelText(translations.en.password)).toHaveValue('');
  });
});
