import { useTranslations } from '../../context/LanguageContext';
import './UserBadge.css';

function UserBadge({ username, onChangeUser }) {
  const { t } = useTranslations();

  return (
    <div className="user-badge">
      <span className="user-badge__name">
        {username ?? t.playingAsGuest}
      </span>
      <button className="user-badge__btn" onClick={onChangeUser}>
        {username ? t.changeUser : t.signIn}
      </button>
    </div>
  );
}

export default UserBadge;
