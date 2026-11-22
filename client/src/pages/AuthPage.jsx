import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import Logo from '../components/Logo.jsx';

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const { login, signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await (isSignup ? signup(form) : login(form));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-wrap">
      <section className="auth-intro">
        <Logo size="lg" />
        <h1>Practice today. Perform on test day.</h1>
        <p>Take timed 10-question tests, see exactly where you slipped, and track your progress attempt by attempt.</p>
        <ul className="ticks">
          <li>10 questions, 10 minutes</li>
          <li>Instant score with correct answers</li>
          <li>Every attempt saved to your history</li>
        </ul>
      </section>

      <form className="card auth-card" onSubmit={submit}>
        <h2>{isSignup ? 'Create your account' : 'Welcome back'}</h2>
        {isSignup && (
          <label>Full name
            <input value={form.name} onChange={set('name')} autoComplete="name" required />
          </label>
        )}
        <label>Email
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={set('password')} minLength={isSignup ? 6 : undefined}
            autoComplete={isSignup ? 'new-password' : 'current-password'} required />
          {isSignup && <small>At least 6 characters.</small>}
        </label>
        {error && <p className="alert" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
        </button>
        <p className="switch">
          {isSignup ? <>Already have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/signup">Create an account</Link></>}
        </p>
      </form>
    </main>
  );
}
