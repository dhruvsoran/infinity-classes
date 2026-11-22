import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

const COLORS = ['#ffc533', '#3556d8', '#15845a', '#ff6b6b', '#8e6bff'];

export default function Result() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const confetti = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.9,
      dur: 2.4 + Math.random() * 1.6,
      color: COLORS[i % COLORS.length],
    })),
    []
  );

  useEffect(() => {
    api.result(id).then(setData).catch((e) => setError(e.message));
    api.stats().then(setStats).catch(() => {});
  }, [id]);

  if (error) return <main className="page narrow"><p className="alert">{error}</p></main>;
  if (!data) return <p className="center-note">Loading your result…</p>;

  const pct = Math.round((data.score / data.total) * 100);
  const message =
    pct === 100 ? 'Flawless! Every answer was right.' :
    pct >= 80 ? 'Brilliant work!' :
    pct >= 50 ? 'Solid effort. You are getting there.' :
    'Every attempt makes you sharper.';
  const mins = Math.floor(data.timeTakenSec / 60);
  const secs = data.timeTakenSec % 60;
  const skipped = data.review.filter((r) => r.selected === -1).length;
  const leveledUp = stats && String(stats.latestId) === String(data.id) &&
    Math.floor((stats.xp - data.xp) / stats.xpPerLevel) < Math.floor(stats.xp / stats.xpPerLevel);

  return (
    <main className="page narrow">
      {pct >= 80 && (
        <div className="confetti" aria-hidden="true">
          {confetti.map((c, i) => (
            <span key={i} style={{ left: `${c.left}%`, background: c.color, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s` }} />
          ))}
        </div>
      )}

      <section className="card score-card">
        <div className="score-ring" style={{ '--pct': pct }}>
          <div><strong>{data.score}</strong><span>out of {data.total}</span></div>
        </div>
        <div>
          <h1>{message}</h1>
          <p className="muted">{pct}% correct · {skipped} skipped · finished in {mins}m {secs}s</p>
          <div className="reward-row">
            <span className="xp-chip">+{data.xp} XP</span>
            {stats && <span className="level-chip">Level {stats.level} · {stats.levelName}</span>}
            {stats && stats.streak > 0 && <span className="streak-chip">🔥 {stats.streak}-day streak</span>}
          </div>
          {leveledUp && <p className="levelup">Level up! You are now Level {stats.level}, {stats.levelName}.</p>}
          <div className="row-gap">
            <Link className="btn btn-accent" to="/test">Take another test</Link>
            <Link className="btn btn-ghost" to="/">See badges</Link>
          </div>
        </div>
      </section>

      <h2 className="section-title">Review your answers</h2>
      {data.review.map((r, i) => (
        <article key={i} className={`card review ${r.isCorrect ? 'right' : 'wrong'}`}>
          <div className="row-between">
            <strong>Question {i + 1}</strong>
            <span className={`tag ${r.isCorrect ? 'tag-right' : 'tag-wrong'}`}>
              {r.isCorrect ? 'Correct' : r.selected === -1 ? 'Skipped' : 'Incorrect'}
            </span>
          </div>
          <p className="q-text">{r.text}</p>
          <ul className="review-options">
            {r.options.map((o, j) => {
              const cls = j === r.correct ? 'is-correct' : j === r.selected ? 'is-wrong' : '';
              return (
                <li key={j} className={cls}>
                  <span className="letter">{'ABCD'[j]}</span>
                  <span>{o}</span>
                  {j === r.correct && j !== r.selected && <em>Correct answer</em>}
                  {j === r.selected && j === r.correct && <em>Your answer, correct</em>}
                  {j === r.selected && j !== r.correct && <em>Your answer</em>}
                </li>
              );
            })}
          </ul>
        </article>
      ))}
    </main>
  );
}
