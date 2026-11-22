// XP, levels, streaks and badges. Everything is derived from submitted attempts,
// so no extra database fields are needed.
const LEVEL_NAMES = ['Beginner', 'Explorer', 'Scholar', 'Achiever', 'Champion', 'Legend'];
const XP_PER_LEVEL = 100;

const secondsTaken = (a) => Math.max(0, Math.round((a.submittedAt - a.startedAt) / 1000));

// 5 XP for finishing, 10 per correct answer, +20 for a perfect score, +10 for a fast, strong finish
function xpFor(a) {
  let xp = 5 + a.score * 10;
  if (a.score === a.total) xp += 20;
  if (a.score >= 7 && secondsTaken(a) < 300) xp += 10;
  return xp;
}

function levelInfo(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return {
    level,
    levelName: LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)],
    xpIntoLevel: xp % XP_PER_LEVEL,
    xpPerLevel: XP_PER_LEVEL,
  };
}

// tz = Date#getTimezoneOffset() from the browser, so "a day" matches the student's own day
const dayKey = (date, tz) => new Date(date.getTime() - tz * 60000).toISOString().slice(0, 10);

function streakOf(attempts, tz) {
  const days = new Set(attempts.map((a) => dayKey(a.submittedAt, tz)));
  let cursor = new Date();
  if (!days.has(dayKey(cursor, tz))) {
    cursor = new Date(cursor.getTime() - 86400000); // today not played yet: streak is still alive via yesterday
    if (!days.has(dayKey(cursor, tz))) return 0;
  }
  let n = 0;
  while (days.has(dayKey(cursor, tz))) {
    n++;
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return n;
}

const BADGES = [
  { id: 'first-step', icon: '🚀', name: 'First Step', desc: 'Finish your first test', test: (f) => f.attempts >= 1 },
  { id: 'consistent', icon: '📚', name: 'Consistent', desc: 'Finish 5 tests', test: (f) => f.attempts >= 5 },
  { id: 'sharp-mind', icon: '🎯', name: 'Sharp Mind', desc: 'Score 80%+ in 3 tests', test: (f) => f.strong >= 3 },
  { id: 'perfect', icon: '🏆', name: 'Perfect 10', desc: 'Get every answer right', test: (f) => f.perfect },
  { id: 'speedster', icon: '⚡', name: 'Speedster', desc: 'Score 7+ in under 5 minutes', test: (f) => f.fast },
  { id: 'on-fire', icon: '🔥', name: 'On Fire', desc: 'Practise 3 days in a row', test: (f) => f.streak >= 3 },
  { id: 'scholar', icon: '🎓', name: 'Scholar', desc: 'Reach Level 3', test: (f) => f.level >= 3 },
];

function buildStats(mine, tz) {
  const xp = mine.reduce((s, a) => s + xpFor(a), 0);
  const lvl = levelInfo(xp);
  const streak = streakOf(mine, tz);
  const facts = {
    attempts: mine.length,
    strong: mine.filter((a) => a.score / a.total >= 0.8).length,
    perfect: mine.some((a) => a.score === a.total),
    fast: mine.some((a) => a.score >= 7 && secondsTaken(a) < 300),
    streak,
    level: lvl.level,
  };
  return {
    xp,
    ...lvl,
    streak,
    attempts: mine.length,
    best: mine.length ? Math.max(...mine.map((a) => a.score)) : 0,
    badges: BADGES.map(({ id, icon, name, desc, test }) => ({ id, icon, name, desc, earned: !!test(facts) })),
  };
}

module.exports = { xpFor, buildStats, levelInfo, secondsTaken };
