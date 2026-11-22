import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function History() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.history().then(setList).catch((e) => setError(e.message));
  }, []);

  return (
    <main className="page narrow">
      <h1>My attempts</h1>
      {error && <p className="alert">{error}</p>}
      {!list && !error && <p className="muted">Loading…</p>}
      {list && list.length === 0 && (
        <div className="card"><p>You haven't taken a test yet.</p><Link className="btn btn-accent" to="/test">Start your first test</Link></div>
      )}
      {list && list.length > 0 && (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>#</th><th>Date</th><th>Score</th><th></th></tr></thead>
            <tbody>
              {list.map((a, i) => (
                <tr key={a._id}>
                  <td>{list.length - i}</td>
                  <td>{new Date(a.submittedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td><span className="pill">{a.score}/{a.total}</span></td>
                  <td><Link to={`/result/${a._id}`}>View answers</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
