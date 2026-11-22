import { useEffect, useState } from 'react';
import { api } from '../api.js';

const blank = { text: '', options: ['', '', '', ''], correctIndex: 0, subject: '' };

export default function Admin() {
  const [form, setForm] = useState(blank);
  const [questions, setQuestions] = useState([]);
  const [msg, setMsg] = useState(null); // { type, text }
  const [busy, setBusy] = useState(false);

  const load = () => api.listQuestions().then(setQuestions).catch((e) => setMsg({ type: 'error', text: e.message }));
  useEffect(() => { load(); }, []);

  const setOption = (i, v) => setForm({ ...form, options: form.options.map((o, j) => (j === i ? v : o)) });

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      await api.addQuestion(form);
      setForm(blank);
      setMsg({ type: 'ok', text: 'Question added.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    await api.deleteQuestion(id);
    load();
  };

  return (
    <main className="page">
      <h1>Add questions</h1>
      <p className="muted">The question bank has {questions.length} question{questions.length === 1 ? '' : 's'}. Each test picks 10 at random, so add at least 10.</p>

      <form className="card admin-form" onSubmit={submit}>
        <label>Question
          <textarea rows={2} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required />
        </label>
        <label>Subject (optional)
          <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Maths" />
        </label>
        <fieldset>
          <legend>Options (select the correct one)</legend>
          {form.options.map((o, i) => (
            <div className="opt-row" key={i}>
              <input type="radio" name="correct" checked={form.correctIndex === i} onChange={() => setForm({ ...form, correctIndex: i })} aria-label={`Option ${'ABCD'[i]} is correct`} />
              <span className="letter">{'ABCD'[i]}</span>
              <input value={o} onChange={(e) => setOption(i, e.target.value)} required />
            </div>
          ))}
        </fieldset>
        {msg && <p className={msg.type === 'ok' ? 'success' : 'alert'}>{msg.text}</p>}
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Add question'}</button>
      </form>

      <h2 className="section-title">Question bank</h2>
      <div className="card">
        {questions.length === 0 ? <p className="muted">No questions yet.</p> : (
          <ul className="list bank">
            {questions.map((q) => (
              <li key={q._id}>
                <div>
                  <strong>{q.text}</strong>
                  <div className="muted small">{q.subject} · Answer: {'ABCD'[q.correctIndex]}. {q.options[q.correctIndex]}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => remove(q._id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
