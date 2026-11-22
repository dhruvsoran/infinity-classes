const router = require('express').Router();
const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { xpFor, buildStats } = require('../utils/gamify');

const TEST_SIZE = 10;
const DURATION_MS = 10 * 60 * 1000;
const GRACE_MS = 15 * 1000; // allowance for network delay on auto-submit

router.use(protect);

const endsAt = (attempt) => new Date(attempt.startedAt.getTime() + DURATION_MS);

// Grade an attempt; answers is { [questionId]: selectedIndex }
async function finalize(attempt, answers = {}) {
  const questions = await Question.find({ _id: { $in: attempt.questions } });
  const byId = new Map(questions.map((q) => [String(q._id), q]));
  let score = 0;
  attempt.answers = attempt.questions.map((qid) => {
    const q = byId.get(String(qid));
    const picked = Number.isInteger(answers[String(qid)]) ? answers[String(qid)] : -1;
    if (q && picked === q.correctIndex) score++;
    return picked >= 0 && picked <= 3 ? picked : -1;
  });
  attempt.score = score;
  attempt.status = 'submitted';
  attempt.submittedAt = new Date();
  await attempt.save();
  return attempt;
}

async function testPayload(attempt) {
  const qs = await Question.find({ _id: { $in: attempt.questions } });
  const byId = new Map(qs.map((q) => [String(q._id), q]));
  return {
    attemptId: attempt._id,
    endsAt: endsAt(attempt),
    serverNow: new Date(),
    questions: attempt.questions
      .map((id) => byId.get(String(id)))
      .filter(Boolean)
      .map((q) => ({ _id: q._id, text: q.text, options: q.options, subject: q.subject })), // correct answer is never sent
  };
}

// Start a test (or resume the one that is still running)
router.post('/start', async (req, res, next) => {
  try {
    const active = await Attempt.findOne({ user: req.user._id, status: 'in-progress' });
    if (active) {
      if (Date.now() < endsAt(active).getTime()) return res.json(await testPayload(active));
      await finalize(active); // expired while the student was away
    }
    const picked = await Question.aggregate([{ $sample: { size: TEST_SIZE } }]);
    if (picked.length < TEST_SIZE)
      return res.status(400).json({ message: `The question bank has only ${picked.length} questions. An admin needs to add at least ${TEST_SIZE}.` });
    const attempt = await Attempt.create({
      user: req.user._id,
      questions: picked.map((q) => q._id),
      answers: picked.map(() => -1),
      total: TEST_SIZE,
    });
    res.status(201).json(await testPayload(attempt));
  } catch (e) { next(e); }
});

// Submit answers (manual or timer auto-submit)
router.post('/:id/submit', async (req, res, next) => {
  try {
    const attempt = await Attempt.findOne({ _id: req.params.id, user: req.user._id });
    if (!attempt) return res.status(404).json({ message: 'Test not found.' });
    if (attempt.status === 'submitted') return res.json({ attemptId: attempt._id });
    const late = Date.now() > endsAt(attempt).getTime() + GRACE_MS;
    await finalize(attempt, late ? {} : req.body.answers || {});
    res.json({ attemptId: attempt._id, late });
  } catch (e) { next(e); }
});

// Gamification: XP, level, streak, badges and leaderboard
router.get('/stats', async (req, res, next) => {
  try {
    const tz = parseInt(req.query.tz, 10) || 0;
    const all = await Attempt.find({ status: 'submitted' }).select('user score total startedAt submittedAt');
    const me = String(req.user._id);
    const mine = all.filter((a) => String(a.user) === me);

    const xpByUser = new Map();
    all.forEach((a) => xpByUser.set(String(a.user), (xpByUser.get(String(a.user)) || 0) + xpFor(a)));
    const ranked = [...xpByUser.entries()].sort((a, b) => b[1] - a[1]);
    const names = new Map(
      (await User.find({ _id: { $in: ranked.slice(0, 5).map(([id]) => id) } }).select('name')).map((u) => [String(u._id), u.name])
    );
    const short = (n = 'Student') => { const p = n.trim().split(/\s+/); return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : p[0]; };
    const leaderboard = ranked.slice(0, 5).map(([id, xp], i) => ({ rank: i + 1, name: short(names.get(id)), xp, you: id === me }));
    const myIndex = ranked.findIndex(([id]) => id === me);

    const latest = mine.slice().sort((a, b) => b.submittedAt - a.submittedAt)[0];
    res.json({ ...buildStats(mine, tz), leaderboard, myRank: myIndex >= 0 ? myIndex + 1 : null, latestId: latest ? latest._id : null });
  } catch (e) { next(e); }
});

// History
router.get('/', async (req, res, next) => {
  try {
    const list = await Attempt.find({ user: req.user._id, status: 'submitted' })
      .sort({ submittedAt: -1 })
      .select('score total submittedAt startedAt');
    res.json(list);
  } catch (e) { next(e); }
});

// Detailed result
router.get('/:id', async (req, res, next) => {
  try {
    const attempt = await Attempt.findOne({ _id: req.params.id, user: req.user._id });
    if (!attempt) return res.status(404).json({ message: 'Result not found.' });
    if (attempt.status !== 'submitted') return res.status(400).json({ message: 'This test is still in progress.' });
    const qs = await Question.find({ _id: { $in: attempt.questions } });
    const byId = new Map(qs.map((q) => [String(q._id), q]));
    const review = attempt.questions.map((id, i) => {
      const q = byId.get(String(id));
      if (!q) return { text: '(question removed)', options: [], selected: attempt.answers[i], correct: -1, isCorrect: false };
      return {
        text: q.text,
        options: q.options,
        selected: attempt.answers[i],
        correct: q.correctIndex,
        isCorrect: attempt.answers[i] === q.correctIndex,
      };
    });
    res.json({
      id: attempt._id,
      score: attempt.score,
      total: attempt.total,
      xp: xpFor(attempt),
      submittedAt: attempt.submittedAt,
      timeTakenSec: Math.round((attempt.submittedAt - attempt.startedAt) / 1000),
      review,
    });
  } catch (e) { next(e); }
});

module.exports = router;
