const TOKEN_KEY = 'ic_token';
const BASE = import.meta.env.VITE_API_URL || ''; // set in production, e.g. https://your-api.onrender.com
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong. Please try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  signup: (b) => request('/auth/signup', { method: 'POST', body: b }),
  login: (b) => request('/auth/login', { method: 'POST', body: b }),
  me: () => request('/auth/me'),
  startTest: () => request('/attempts/start', { method: 'POST' }),
  submitTest: (id, answers) => request(`/attempts/${id}/submit`, { method: 'POST', body: { answers } }),
  stats: () => request(`/attempts/stats?tz=${new Date().getTimezoneOffset()}`),
  history: () => request('/attempts'),
  result: (id) => request(`/attempts/${id}`),
  listQuestions: () => request('/questions'),
  addQuestion: (b) => request('/questions', { method: 'POST', body: b }),
  deleteQuestion: (id) => request(`/questions/${id}`, { method: 'DELETE' }),
};
