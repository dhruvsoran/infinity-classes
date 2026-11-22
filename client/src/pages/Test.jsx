import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function Test() {
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: optionIndex }
  const [current, setCurrent] = useState(0);
  const [left, setLeft] = useState(600);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const offset = useRef(0); // server clock - client clock
  const submitted = useRef(false);
  const started = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  // Load (or resume) the test
  useEffect(() => {
    if (started.current) return; // guards React StrictMode double-run
    started.current = true;
    api.startTest()
      .then((t) => {
        offset.current = new Date(t.serverNow).getTime() - Date.now();
        setTest(t);
        const saved = sessionStorage.getItem(`ic_answers_${t.attemptId}`);
        if (saved) setAnswers(JSON.parse(saved));
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (test) sessionStorage.setItem(`ic_answers_${test.attemptId}`, JSON.stringify(answers));
  }, [answers, test]);

  const submit = useCallback(async () => {
    if (submitted.current || !test) return;
    submitted.current = true;
    setSubmitting(true);
    try {
      const r = await api.submitTest(test.attemptId, answersRef.current);
      sessionStorage.removeItem(`ic_answers_${test.attemptId}`);
      navigate(`/result/${r.attemptId}`, { replace: true });
    } catch (e) {
      submitted.current = false;
      setSubmitting(false);
      setError(e.message);
    }
  }, [test, navigate]);

  // Countdown based on the server's end time, so refreshing the page can't reset it
  useEffect(() => {
    if (!test) return;
    const tick = () => {
      const remaining = Math.max(0, Math.round((new Date(test.endsAt).getTime() - (Date.now() + offset.current)) / 1000));
      setLeft(remaining);
      if (remaining <= 0) submit();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [test, submit]);

  if (error && !test) return (
    <main className="page narrow"><div className="card"><p className="alert">{error}</p></div></main>
  );
  if (!test) return <p className="center-note">Preparing your questions…</p>;

  const q = test.questions[current];
  const answered = Object.keys(answers).length;
  const urgent = left <= 60;

  return (
    <main className="page narrow">
      <div className="test-bar card">
        <div>
          <strong>Question {current + 1} of {test.questions.length}</strong>
          <span className="muted"> · {answered} answered</span>
        </div>
        <div className={`timer ${urgent ? 'timer-urgent' : ''}`} role="timer" aria-label="Time left">{fmt(left)}</div>
      </div>

      <div className="progress" aria-hidden="true">
        <div style={{ width: `${((current + 1) / test.questions.length) * 100}%` }} />
      </div>

      <section className="card question">
        <p className="subject">{q.subject}</p>
        <h2>{q.text}</h2>
        <div className="options" role="radiogroup">
          {q.options.map((o, i) => (
            <button
              key={i}
              role="radio"
              aria-checked={answers[q._id] === i}
              className={`option ${answers[q._id] === i ? 'selected' : ''}`}
              onClick={() => setAnswers({ ...answers, [q._id]: i })}
            >
              <span className="letter">{'ABCD'[i]}</span>
              {o}
            </button>
          ))}
        </div>
      </section>

      <div className="palette" aria-label="Jump to question">
        {test.questions.map((x, i) => (
          <button key={x._id} onClick={() => setCurrent(i)}
            className={`dot ${i === current ? 'current' : ''} ${answers[x._id] !== undefined ? 'done' : ''}`}>
            {i + 1}
          </button>
        ))}
      </div>

      <p className="nudge">Every correct answer earns 10 XP. Skip any question and come back to it.</p>

      {error && <p className="alert">{error}</p>}

      <div className="row-between">
        <button className="btn btn-ghost" disabled={current === 0} onClick={() => setCurrent(current - 1)}>Previous</button>
        {current < test.questions.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setCurrent(current + 1)}>Next</button>
        ) : (
          <button className="btn btn-accent" disabled={submitting} onClick={() => {
            const unanswered = test.questions.length - answered;
            if (unanswered === 0 || window.confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) submit();
          }}>
            {submitting ? 'Submitting…' : 'Submit test'}
          </button>
        )}
      </div>
    </main>
  );
}
