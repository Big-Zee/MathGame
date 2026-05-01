// Badge engine — pure logic module, no DOM

export const BADGE_CATEGORIES = [
  { id: 'accuracy', label: 'Accuracy', emoji: '🎯' },
  { id: 'speed',    label: 'Speed',    emoji: '⏱️' },
  { id: 'score',    label: 'Score',    emoji: '🏆' },
  { id: 'practice', label: 'Practice', emoji: '📚' },
  { id: 'variety',  label: 'Variety',  emoji: '🌈' },
];

export const BADGE_DEFINITIONS = [
  // ── Accuracy ──────────────────────────────────────────────────────────────
  {
    id: 'sharp-shooter', name: 'Sharp Shooter', emoji: '🎯', category: 'accuracy',
    hint: 'Score 100% on a full 10-question game',
    description: 'You got every question right!',
  },
  {
    id: 'hat-trick', name: 'Hat Trick', emoji: '🎩', category: 'accuracy',
    hint: 'Answer 3 questions correctly in a row',
    description: 'Three correct answers in a row!',
  },
  {
    id: 'on-fire', name: 'On Fire', emoji: '🔥', category: 'accuracy',
    hint: 'Answer 5 questions correctly in a row',
    description: "Five correct answers in a row — you're on fire!",
  },
  {
    id: 'unstoppable', name: 'Unstoppable', emoji: '⚡', category: 'accuracy',
    hint: 'Answer all 10 questions correctly in a row',
    description: 'A perfect game — simply unstoppable!',
  },
  {
    id: 'comeback-kid', name: 'Comeback Kid', emoji: '💪', category: 'accuracy',
    hint: 'Win 3 stars after losing 2 hearts',
    description: 'You came back from the brink and won!',
  },
  // ── Speed ──────────────────────────────────────────────────────────────────
  {
    id: 'speed-demon', name: 'Speed Demon', emoji: '🏎️', category: 'speed',
    hint: 'Answer a question correctly in under 3 seconds',
    description: 'You answered in under 3 seconds!',
  },
  {
    id: 'lightning', name: 'Lightning', emoji: '⚡', category: 'speed',
    hint: 'Answer 5 questions correctly under 5 s each in one game',
    description: 'Five fast correct answers in a row!',
  },
  {
    id: 'quick-thinker', name: 'Quick Thinker', emoji: '🧠', category: 'speed',
    hint: 'Complete a game averaging under 7 seconds per question',
    description: 'You completed a game with an average answer time under 7 seconds!',
  },
  // ── Score ──────────────────────────────────────────────────────────────────
  {
    id: 'first-win', name: 'First Win', emoji: '🌟', category: 'score',
    hint: 'Complete your very first game',
    description: 'You played your first game!',
  },
  {
    id: 'century', name: 'Century', emoji: '💯', category: 'score',
    hint: 'Score 100 points or more in one game',
    description: 'You scored 100 points or more!',
  },
  {
    id: 'high-roller', name: 'High Roller', emoji: '🎰', category: 'score',
    hint: 'Score 150 points or more in one game',
    description: 'You scored 150 points or more!',
  },
  {
    id: 'math-legend', name: 'Math Legend', emoji: '👑', category: 'score',
    hint: 'Score 200 points or more in one game',
    description: "You scored 200 points — you're a Math Legend!",
  },
  // ── Practice ──────────────────────────────────────────────────────────────
  {
    id: 'practice-makes-perfect', name: 'Practice Makes Perfect', emoji: '📚', category: 'practice',
    hint: 'Complete 5 Practice Mode sessions',
    description: 'You completed 5 Practice Mode sessions!',
  },
  {
    id: 'operation-master', name: 'Operation Master', emoji: '🔢', category: 'practice',
    hint: 'Complete a session in all 4 operations',
    description: 'You mastered all 4 operations!',
  },
  {
    id: 'dedication', name: 'Dedication', emoji: '🏅', category: 'practice',
    hint: 'Answer 50 questions correctly in Practice Mode total',
    description: 'You answered 50 correct answers in Practice Mode!',
  },
  // ── Variety ────────────────────────────────────────────────────────────────
  {
    id: 'explorer', name: 'Explorer', emoji: '🗺️', category: 'variety',
    hint: 'Complete Practice sessions at Easy, Medium, and Hard difficulty',
    description: 'You explored all 3 difficulty levels!',
  },
  {
    id: 'time-lord', name: 'Time Lord', emoji: '⏰', category: 'variety',
    hint: 'Complete a game with every timer setting (5–30 s)',
    description: 'You played with all 6 timer settings!',
  },
  {
    id: 'perfectionist', name: 'Perfectionist', emoji: '✨', category: 'variety',
    hint: 'Get 100% correct on a Hard Practice session',
    description: 'A perfect score on Hard difficulty!',
  },
];

// ── localStorage keys ──────────────────────────────────────────────────────

const KEY_BADGES        = 'mathblaster_badges';
const KEY_BADGES_NEW    = 'mathblaster_badges_new';
const KEY_PRACTICE_STATS = 'mathblaster_practice_stats';
const KEY_TIMERS_USED   = 'mathblaster_timers_used';

// ── localStorage wrappers ──────────────────────────────────────────────────

function initBadgeStore() {
  const store = {};
  for (const b of BADGE_DEFINITIONS) {
    store[b.id] = { earned: false, unlockedAt: null };
  }
  return store;
}

export function getBadgeStore() {
  try {
    const raw = globalThis.localStorage?.getItem(KEY_BADGES);
    if (!raw) return initBadgeStore();
    const parsed = JSON.parse(raw);
    const store = initBadgeStore();
    for (const id of Object.keys(store)) {
      if (parsed[id] && typeof parsed[id].earned === 'boolean') {
        store[id] = { earned: parsed[id].earned, unlockedAt: parsed[id].unlockedAt ?? null };
      }
    }
    return store;
  } catch {
    return initBadgeStore();
  }
}

export function saveBadgeStore(store) {
  globalThis.localStorage?.setItem(KEY_BADGES, JSON.stringify(store));
}

export function getBadgesNew() {
  const raw = globalThis.localStorage?.getItem(KEY_BADGES_NEW);
  if (!raw) return 0;
  const n = parseInt(raw, 10);
  return isNaN(n) ? 0 : n;
}

export function incrementBadgesNew(count) {
  globalThis.localStorage?.setItem(KEY_BADGES_NEW, String(getBadgesNew() + count));
}

export function clearBadgesNew() {
  globalThis.localStorage?.setItem(KEY_BADGES_NEW, '0');
}

function initPracticeStats() {
  return { sessionsCompleted: 0, operationsCompleted: [], difficultiesCompleted: [], totalCorrect: 0 };
}

export function getPracticeStats() {
  try {
    const raw = globalThis.localStorage?.getItem(KEY_PRACTICE_STATS);
    if (!raw) return initPracticeStats();
    const parsed = JSON.parse(raw);
    if (typeof parsed.sessionsCompleted !== 'number') return initPracticeStats();
    return {
      sessionsCompleted: parsed.sessionsCompleted,
      operationsCompleted: Array.isArray(parsed.operationsCompleted) ? parsed.operationsCompleted : [],
      difficultiesCompleted: Array.isArray(parsed.difficultiesCompleted) ? parsed.difficultiesCompleted : [],
      totalCorrect: typeof parsed.totalCorrect === 'number' ? parsed.totalCorrect : 0,
    };
  } catch {
    return initPracticeStats();
  }
}

export function savePracticeStats(stats) {
  globalThis.localStorage?.setItem(KEY_PRACTICE_STATS, JSON.stringify(stats));
}

export function getTimersUsed() {
  try {
    const raw = globalThis.localStorage?.getItem(KEY_TIMERS_USED);
    if (!raw) return [];
    return raw.split(',').map(Number).filter(n => !isNaN(n) && n > 0);
  } catch {
    return [];
  }
}

export function saveTimersUsed(timers) {
  globalThis.localStorage?.setItem(KEY_TIMERS_USED, timers.join(','));
}

// ── Pure badge check functions ────────────────────────────────────────────

export function checkHatTrick(streak)      { return streak >= 3; }
export function checkOnFire(streak)        { return streak >= 5; }
export function checkUnstoppable(streak)   { return streak >= 10; }
export function checkSharpShooter(correctAnswers) { return correctAnswers === 10; }
export function checkComebackKid(heartsLost, stars) { return heartsLost === 2 && stars === 3; }

export function checkSpeedDemon(lastAnswerMs)    { return lastAnswerMs < 3000; }
export function checkLightning(fastAnswerStreak) { return fastAnswerStreak >= 5; }
export function checkQuickThinker(answerTimesMs, questionsAnswered) {
  if (questionsAnswered !== 10 || answerTimesMs.length < 10) return false;
  const avg = answerTimesMs.reduce((sum, t) => sum + t, 0) / answerTimesMs.length;
  return avg < 7000;
}

export function checkFirstWin(badgeAlreadyEarned) { return !badgeAlreadyEarned; }
export function checkCentury(score)    { return score >= 100; }
export function checkHighRoller(score) { return score >= 150; }
export function checkMathLegend(score) { return score >= 200; }

export function checkPracticeMakesPerfect(sessionsCompleted) { return sessionsCompleted >= 5; }
export function checkOperationMaster(operationsCompleted) {
  return ['add', 'sub', 'mul', 'div'].every(op => operationsCompleted.includes(op));
}
export function checkDedication(totalCorrect) { return totalCorrect >= 50; }

export function checkExplorer(difficultiesCompleted) {
  return ['easy', 'medium', 'hard'].every(d => difficultiesCompleted.includes(d));
}
export function checkTimeLord(timersUsed) {
  return [5, 10, 15, 20, 25, 30].every(t => timersUsed.includes(t));
}
export function checkPerfectionist(difficulty, totalAnswered, totalCorrect) {
  return difficulty === 'hard' && totalAnswered > 0 && totalAnswered === totalCorrect;
}

// ── Orchestrators ──────────────────────────────────────────────────────────

export function checkBadgesAfterQuestion(session, badgeStore) {
  const newIds = [];
  const { streak, answerTimesMs, fastAnswerStreak } = session;
  const lastMs = answerTimesMs.length > 0 ? answerTimesMs[answerTimesMs.length - 1] : Infinity;

  if (!badgeStore['hat-trick'].earned    && checkHatTrick(streak))          newIds.push('hat-trick');
  if (!badgeStore['on-fire'].earned      && checkOnFire(streak))            newIds.push('on-fire');
  if (!badgeStore['unstoppable'].earned  && checkUnstoppable(streak))       newIds.push('unstoppable');
  if (!badgeStore['speed-demon'].earned  && checkSpeedDemon(lastMs))        newIds.push('speed-demon');
  if (!badgeStore['lightning'].earned    && checkLightning(fastAnswerStreak)) newIds.push('lightning');

  return newIds;
}

export function checkBadgesAfterGame(session, badgeStore, timersUsed) {
  const newIds = [];
  const { correctAnswers, lives, score, config, answerTimesMs, questionsAnswered } = session;
  const heartsLost = 3 - lives;

  // Stars: use session.stars if caller pre-computed, else derive from config thresholds
  const threeStarScore = config?.starThresholds?.three ?? 130;
  const twoStarScore   = config?.starThresholds?.two   ?? 70;
  const stars = score >= threeStarScore ? 3 : score >= twoStarScore ? 2 : 1;

  const updatedTimers = timersUsed.includes(config.timerSeconds)
    ? timersUsed
    : [...timersUsed, config.timerSeconds];

  if (!badgeStore['sharp-shooter'].earned  && checkSharpShooter(correctAnswers))              newIds.push('sharp-shooter');
  if (!badgeStore['comeback-kid'].earned   && checkComebackKid(heartsLost, stars))            newIds.push('comeback-kid');
  if (!badgeStore['quick-thinker'].earned  && checkQuickThinker(answerTimesMs, questionsAnswered)) newIds.push('quick-thinker');
  if (!badgeStore['first-win'].earned)                                                         newIds.push('first-win');
  if (!badgeStore['century'].earned        && checkCentury(score))                            newIds.push('century');
  if (!badgeStore['high-roller'].earned    && checkHighRoller(score))                         newIds.push('high-roller');
  if (!badgeStore['math-legend'].earned    && checkMathLegend(score))                         newIds.push('math-legend');
  if (!badgeStore['time-lord'].earned      && checkTimeLord(updatedTimers))                   newIds.push('time-lord');

  return newIds;
}

export function checkBadgesAfterPractice(practiceStats, sessionData, badgeStore) {
  const newIds = [];
  const { sessionsCompleted, operationsCompleted, difficultiesCompleted, totalCorrect } = practiceStats;
  const { difficulty, totalAnswered, totalCorrect: sessionCorrect } = sessionData;

  if (!badgeStore['practice-makes-perfect'].earned && checkPracticeMakesPerfect(sessionsCompleted)) newIds.push('practice-makes-perfect');
  if (!badgeStore['operation-master'].earned        && checkOperationMaster(operationsCompleted))    newIds.push('operation-master');
  if (!badgeStore['dedication'].earned              && checkDedication(totalCorrect))                newIds.push('dedication');
  if (!badgeStore['explorer'].earned                && checkExplorer(difficultiesCompleted))         newIds.push('explorer');
  if (!badgeStore['perfectionist'].earned           && checkPerfectionist(difficulty, totalAnswered, sessionCorrect)) newIds.push('perfectionist');

  return newIds;
}

// ── awardBadges (pure, idempotent) ────────────────────────────────────────

export function awardBadges(badgeIds, badgeStore) {
  const now = new Date().toISOString();
  const updated = {};
  for (const [id, record] of Object.entries(badgeStore)) {
    updated[id] = { ...record };
  }
  for (const id of badgeIds) {
    if (!updated[id]) continue;
    if (!updated[id].earned) {
      updated[id] = { earned: true, unlockedAt: now };
    }
    // Already earned — do not overwrite unlockedAt (idempotent)
  }
  return updated;
}
