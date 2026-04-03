import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageToggle from '../LanguageToggle';

describe('LanguageToggle', () => {
  it('shows "عربي" when language is English', () => {
    render(<LanguageToggle lang="en" onToggle={() => {}} />);
    expect(screen.getByText('عربي')).toBeInTheDocument();
  });

  it('shows "English" when language is Arabic', () => {
    render(<LanguageToggle lang="ar" onToggle={() => {}} />);
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('has aria-label "Switch to Arabic" when language is English', () => {
    render(<LanguageToggle lang="en" onToggle={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Switch to Arabic' })
    ).toBeInTheDocument();
  });

  it('has aria-label "Switch to English" when language is Arabic', () => {
    render(<LanguageToggle lang="ar" onToggle={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Switch to English' })
    ).toBeInTheDocument();
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    render(<LanguageToggle lang="en" onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
