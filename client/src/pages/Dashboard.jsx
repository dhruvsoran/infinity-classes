import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
    api.history().then(setRecent).catch(() => {});
  }, []);

  const first = user.name.split(' ')[0];
  const earned = stats ? stats.badges.filter((b) => b.earned).length : 0;

  return (
    <main className="page">
      <section className="card hero">
        <div className="hero-main">
          <p className="greet">{greeting()}, {first}</p>
          <h1>{stats && stats.attempts > 0 ? 'Ready for your next level-up?' : 'Take your first test and earn XP'}</h1>
          {stats && (
            <>
              <div className="xp-row">
                <span className="level-chip">Level {stats.level}</span>
                <strong>{stats.levelName}</strong>
                <span className="muted">{stats.xpIntoLevel} / {stats.xpPerLevel} XP</span>
              </div>
              <div className="xpbar" role="progressbar" aria-valuenow={stats.xpIntoLevel} aria-valuemin={0} aria-valuemax={stats.xpPerLevel}>
                <div style={{ width: `${stats.xpIntoLevel}%` }} />
              </div>
              <p className="muted small">{stats.xpPerLevel - stats.xpIntoLevel} XP to Level {stats.level + 1}</p>
            </>
          )}
          <button className="btn btn-accent btn-lg" onClick={() => navigate('/test')}>Start test</button>
        </div>
        <div className="hero-side">
          <div className="stat stat-streak">
            <strong>🔥 {stats ? stats.streak : 0}</strong>
            <span>day streak</span>
          </div>
          <div className="stat"><strong>{stats && stats.attempts ? `${stats.best}/10` : '–'}</strong><span>best score</span></div>
          <div className="stat"><strong>{stats ? stats.attempts : 0}</strong><span>tests done</span></div>
          <p className="streak-note muted small">
            {stats && stats.streak > 0 ? 'Take a test every day to keep your streak alive.' : 'Finish a test today to start a streak.'}
          </p>
        </div>
      </section>

      <div className="two-col">
        <section className="card">
          <div className="row-between">
            <h2>Badges</h2>
            <span className="muted small">{earned} of {stats ? stats.badges.length : 0} earned</span>
          </div>
          <div className="badges">
            {(stats ? stats.badges : []).map((b) => (
              <div key={b.id} className={`badge ${b.earned ? 'earned' : 'locked'}`} title={b.desc}>
                <span className="badge-icon" aria-hidden="true">{b.icon}</span>
                <strong>{b.name}</strong>
                <small>{b.desc}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Leaderboard</h2>
          {stats && stats.leaderboard.length === 0 ? (
            <p className="muted">Finish a test to claim the first spot.</p>
          ) : (
            <ol className="board">
              {(stats ? stats.leaderboard : []).map((r) => (
                <li key={r.rank} className={r.you ? 'you' : ''}>
                  <span className="rank">{r.rank}</span>
                  <span className="who">{r.name}{r.you ? ' (you)' : ''}</span>
                  <span className="pts">{r.xp} XP</span>
                </li>
              ))}
            </ol>
          )}
          {stats && stats.myRank && !stats.leaderboard.some((r) => r.you) && (
            <p className="muted small">You are ranked #{stats.myRank}. Keep going to reach the top 5.</p>
          )}
        </section>
      </div>

      <section className="card">
        <div className="row-between">
          <h2>Latest attempts</h2>
          <Link to="/history">See all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="muted">No attempts yet. Your first test will show up here.</p>
        ) : (
          <ul className="list">
            {recent.slice(0, 3).map((a) => (
              <li key={a._id}>
                <span>{new Date(a.submittedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                <span className="pill">{a.score}/{a.total}</span>
                <Link to={`/result/${a._id}`}>Review</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
