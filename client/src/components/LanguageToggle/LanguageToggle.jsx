import './LanguageToggle.css';

function LanguageToggle({ lang, onToggle }) {
  const isArabic = lang === 'ar';

  return (
    <button
      className="lang-toggle"
      onClick={onToggle}
      aria-label={isArabic ? 'Switch to English' : 'Switch to Arabic'}
    >
      {isArabic ? 'English' : 'عربي'}
    </button>
  );
}

export default LanguageToggle;
