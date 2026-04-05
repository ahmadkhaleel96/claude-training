import { useTranslations } from '../../context/LanguageContext';
import './Leaderboard.css';

function Leaderboard({ entries }) {
  const { t } = useTranslations();

  return (
    <div className="leaderboard">
      <h2 className="leaderboard__title">{t.leaderboard}</h2>
      {entries.length === 0 ? (
        <p className="leaderboard__empty">{t.noLeaderboardData}</p>
      ) : (
        <table className="leaderboard__table">
          <thead>
            <tr>
              <th className="leaderboard__th leaderboard__th--rank">#</th>
              <th className="leaderboard__th">{t.player}</th>
              <th className="leaderboard__th">{t.wins}</th>
              <th className="leaderboard__th">{t.losses}</th>
              <th className="leaderboard__th">{t.draws}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={entry.username} className="leaderboard__row">
                <td className="leaderboard__td leaderboard__td--rank">{i + 1}</td>
                <td className="leaderboard__td leaderboard__td--name">{entry.username}</td>
                <td className="leaderboard__td leaderboard__td--wins">{entry.wins}</td>
                <td className="leaderboard__td">{entry.losses}</td>
                <td className="leaderboard__td">{entry.draws}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Leaderboard;
