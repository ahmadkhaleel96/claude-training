import './ThemeToggle.css';

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb" />
      </span>
      <span className="theme-toggle__label">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}

export default ThemeToggle;
