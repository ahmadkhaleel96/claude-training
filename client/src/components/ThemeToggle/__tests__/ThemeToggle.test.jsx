import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../ThemeToggle';

describe('ThemeToggle', () => {
  it('shows "Light" label when theme is light', () => {
    render(<ThemeToggle theme="light" onToggle={() => {}} />);
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  it('shows "Dark" label when theme is dark', () => {
    render(<ThemeToggle theme="dark" onToggle={() => {}} />);
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('has aria-label "Switch to dark mode" when theme is light', () => {
    render(<ThemeToggle theme="light" onToggle={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Switch to dark mode' })
    ).toBeInTheDocument();
  });

  it('has aria-label "Switch to light mode" when theme is dark', () => {
    render(<ThemeToggle theme="dark" onToggle={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Switch to light mode' })
    ).toBeInTheDocument();
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    render(<ThemeToggle theme="light" onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders the track and thumb elements', () => {
    const { container } = render(<ThemeToggle theme="light" onToggle={() => {}} />);
    expect(container.querySelector('.theme-toggle__track')).toBeInTheDocument();
    expect(container.querySelector('.theme-toggle__thumb')).toBeInTheDocument();
  });
});
