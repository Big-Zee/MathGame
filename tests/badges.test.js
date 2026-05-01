import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ── localStorage mock (must be set up before any badge-engine function is called) ──
let _ls = {};
globalThis.localStorage = {
  getItem:    (k)    => Object.prototype.hasOwnProperty.call(_ls, k) ? _ls[k] : null,
  setItem:    (k, v) => { _ls[k] = String(v); },
  removeItem: (k)    => { delete _ls[k]; },
  clear:      ()     => { _ls = {}; },
};

import {
  BADGE_DEFINITIONS,
  BADGE_CATEGORIES,
  getBadgeStore, saveBadgeStore,
  getBadgesNew, incrementBadgesNew, clearBadgesNew,
  getPracticeStats, savePracticeStats,
  getTimersUsed, saveTimersUsed,
  checkHatTrick, checkOnFire, checkUnstoppable, checkSharpShooter, checkComebackKid,
  checkSpeedDemon, checkLightning, checkQuickThinker,
  checkFirstWin, checkCentury, checkHighRoller, checkMathLegend,
  checkPracticeMakesPerfect, checkOperationMaster, checkDedication,
  checkExplorer, checkTimeLord, checkPerfectionist,
  checkBadgesAfterQuestion, checkBadgesAfterGame, checkBadgesAfterPractice,
  awardBadges,
} from '../js/badge-engine.js';

// ── helpers ───────────────────────────────────────────────────────────────

function freshStore() {
  // Returns an unearned badge store without touching localStorage
  return getBadgeStore();
}

// ── Phase 2: badge store wrappers (T004) ──────────────────────────────────

describe('getBadgeStore', () => {
  beforeEach(() => { _ls = {}; });

  test('absent key returns full 18-badge init state (all unearned)', () => {
    const store = getBadgeStore();
    assert.strictEqual(Object.keys(store).length, 18);
    for (const [, rec] of Object.entries(store)) {
      assert.strictEqual(rec.earned, false);
      assert.strictEqual(rec.unlockedAt, null);
    }
  });

  test('corrupt JSON returns init state without throwing', () => {
    _ls['mathblaster_badges'] = 'not-json{{{';
    const store = getBadgeStore();
    assert.strictEqual(Object.keys(store).length, 18);
    assert.strictEqual(store['hat-trick'].earned, false);
  });

  test('valid JSON missing some badge IDs fills them in as unearned', () => {
    _ls['mathblaster_badges'] = JSON.stringify({ 'hat-trick': { earned: true, unlockedAt: '2026-05-01T00:00:00.000Z' } });
    const store = getBadgeStore();
    assert.strictEqual(Object.keys(store).length, 18);
    assert.strictEqual(store['hat-trick'].earned, true);
    assert.strictEqual(store['speed-demon'].earned, false);
  });

  test('saveBadgeStore → getBadgeStore round-trip preserves earned status and ISO date', () => {
    const initial = getBadgeStore();
    initial['hat-trick'] = { earned: true, unlockedAt: '2026-05-01T12:00:00.000Z' };
    saveBadgeStore(initial);
    const loaded = getBadgeStore();
    assert.strictEqual(loaded['hat-trick'].earned, true);
    assert.strictEqual(loaded['hat-trick'].unlockedAt, '2026-05-01T12:00:00.000Z');
    assert.strictEqual(loaded['speed-demon'].earned, false);
  });
});

describe('getBadgesNew / incrementBadgesNew / clearBadgesNew', () => {
  beforeEach(() => { _ls = {}; });

  test('absent key returns 0', () => {
    assert.strictEqual(getBadgesNew(), 0);
  });

  test('incrementBadgesNew adds to counter', () => {
    incrementBadgesNew(2);
    assert.strictEqual(getBadgesNew(), 2);
    incrementBadgesNew(1);
    assert.strictEqual(getBadgesNew(), 3);
  });

  test('clearBadgesNew resets to 0', () => {
    incrementBadgesNew(5);
    clearBadgesNew();
    assert.strictEqual(getBadgesNew(), 0);
  });
});

// ── Phase 2: practice stats and timers-used wrappers (T006) ──────────────

describe('getPracticeStats', () => {
  beforeEach(() => { _ls = {}; });

  test('absent key returns zero-state', () => {
    const stats = getPracticeStats();
    assert.deepStrictEqual(stats, { sessionsCompleted: 0, operationsCompleted: [], difficultiesCompleted: [], totalCorrect: 0 });
  });

  test('corrupt JSON returns zero-state without throwing', () => {
    _ls['mathblaster_practice_stats'] = 'bad{';
    const stats = getPracticeStats();
    assert.strictEqual(stats.sessionsCompleted, 0);
  });

  test('savePracticeStats → getPracticeStats round-trip', () => {
    const s = { sessionsCompleted: 3, operationsCompleted: ['add', 'sub'], difficultiesCompleted: ['easy'], totalCorrect: 20 };
    savePracticeStats(s);
    const loaded = getPracticeStats();
    assert.deepStrictEqual(loaded, s);
  });
});

describe('getTimersUsed / saveTimersUsed', () => {
  beforeEach(() => { _ls = {}; });

  test('absent key returns empty array', () => {
    assert.deepStrictEqual(getTimersUsed(), []);
  });

  test('saveTimersUsed → getTimersUsed round-trip', () => {
    saveTimersUsed([5, 15, 30]);
    assert.deepStrictEqual(getTimersUsed(), [5, 15, 30]);
  });
});

// ── Phase 4: Accuracy badge checks (T018) ─────────────────────────────────

describe('checkHatTrick', () => {
  test('streak 3 → true',  () => assert.strictEqual(checkHatTrick(3), true));
  test('streak 5 → true',  () => assert.strictEqual(checkHatTrick(5), true));
  test('streak 2 → false', () => assert.strictEqual(checkHatTrick(2), false));
  test('streak 0 → false', () => assert.strictEqual(checkHatTrick(0), false));
});

describe('checkOnFire', () => {
  test('streak 5 → true',  () => assert.strictEqual(checkOnFire(5), true));
  test('streak 6 → true',  () => assert.strictEqual(checkOnFire(6), true));
  test('streak 4 → false', () => assert.strictEqual(checkOnFire(4), false));
});

describe('checkUnstoppable', () => {
  test('streak 10 → true', () => assert.strictEqual(checkUnstoppable(10), true));
  test('streak 11 → true', () => assert.strictEqual(checkUnstoppable(11), true));
  test('streak 9 → false', () => assert.strictEqual(checkUnstoppable(9), false));
});

describe('checkSharpShooter', () => {
  test('10 correct → true',  () => assert.strictEqual(checkSharpShooter(10), true));
  test('9 correct → false',  () => assert.strictEqual(checkSharpShooter(9), false));
  test('11 correct → false', () => assert.strictEqual(checkSharpShooter(11), false));
});

describe('checkComebackKid', () => {
  test('2 hearts lost, 3 stars → true',  () => assert.strictEqual(checkComebackKid(2, 3), true));
  test('1 heart lost, 3 stars → false',  () => assert.strictEqual(checkComebackKid(1, 3), false));
  test('2 hearts lost, 2 stars → false', () => assert.strictEqual(checkComebackKid(2, 2), false));
  test('0 hearts lost, 3 stars → false', () => assert.strictEqual(checkComebackKid(0, 3), false));
});

// ── Phase 4: Speed badge checks (T020) ───────────────────────────────────

describe('checkSpeedDemon', () => {
  test('2999 ms → true',  () => assert.strictEqual(checkSpeedDemon(2999), true));
  test('0 ms → true',     () => assert.strictEqual(checkSpeedDemon(0), true));
  test('3000 ms → false', () => assert.strictEqual(checkSpeedDemon(3000), false));
  test('5000 ms → false', () => assert.strictEqual(checkSpeedDemon(5000), false));
});

describe('checkLightning', () => {
  test('fastAnswerStreak 5 → true',  () => assert.strictEqual(checkLightning(5), true));
  test('fastAnswerStreak 6 → true',  () => assert.strictEqual(checkLightning(6), true));
  test('fastAnswerStreak 4 → false', () => assert.strictEqual(checkLightning(4), false));
  test('fastAnswerStreak 0 → false', () => assert.strictEqual(checkLightning(0), false));
});

describe('checkQuickThinker', () => {
  test('10 answers averaging 6999 ms → true', () => {
    const times = Array(10).fill(6999);
    assert.strictEqual(checkQuickThinker(times, 10), true);
  });
  test('10 answers averaging exactly 7000 ms → false', () => {
    const times = Array(10).fill(7000);
    assert.strictEqual(checkQuickThinker(times, 10), false);
  });
  test('10 answers averaging 7001 ms → false', () => {
    const times = Array(10).fill(7001);
    assert.strictEqual(checkQuickThinker(times, 10), false);
  });
  test('questionsAnswered 9 (incomplete game) → false', () => {
    const times = Array(9).fill(1000);
    assert.strictEqual(checkQuickThinker(times, 9), false);
  });
  test('mixed fast times with average < 7000 → true', () => {
    const times = [1000, 2000, 3000, 4000, 5000, 6000, 1000, 2000, 3000, 4000];
    const avg = times.reduce((a, b) => a + b, 0) / times.length; // 3100
    assert.ok(avg < 7000);
    assert.strictEqual(checkQuickThinker(times, 10), true);
  });
});

// ── Phase 4: Score badge checks (T022) ───────────────────────────────────

describe('checkFirstWin', () => {
  test('not already earned → true',  () => assert.strictEqual(checkFirstWin(false), true));
  test('already earned → false',     () => assert.strictEqual(checkFirstWin(true), false));
});

describe('checkCentury', () => {
  test('score 100 → true',  () => assert.strictEqual(checkCentury(100), true));
  test('score 200 → true',  () => assert.strictEqual(checkCentury(200), true));
  test('score 99 → false',  () => assert.strictEqual(checkCentury(99), false));
});

describe('checkHighRoller', () => {
  test('score 150 → true',  () => assert.strictEqual(checkHighRoller(150), true));
  test('score 149 → false', () => assert.strictEqual(checkHighRoller(149), false));
});

describe('checkMathLegend', () => {
  test('score 200 → true',  () => assert.strictEqual(checkMathLegend(200), true));
  test('score 199 → false', () => assert.strictEqual(checkMathLegend(199), false));
});

// ── Phase 4: Practice badge checks (T024) ────────────────────────────────

describe('checkPracticeMakesPerfect', () => {
  test('5 sessions → true',  () => assert.strictEqual(checkPracticeMakesPerfect(5), true));
  test('10 sessions → true', () => assert.strictEqual(checkPracticeMakesPerfect(10), true));
  test('4 sessions → false', () => assert.strictEqual(checkPracticeMakesPerfect(4), false));
});

describe('checkOperationMaster', () => {
  test('all 4 operations (add/sub/mul/div) → true', () => {
    assert.strictEqual(checkOperationMaster(['add', 'sub', 'mul', 'div']), true);
  });
  test('only 3 operations → false', () => {
    assert.strictEqual(checkOperationMaster(['add', 'sub', 'mul']), false);
  });
  test('empty array → false', () => {
    assert.strictEqual(checkOperationMaster([]), false);
  });
  test('order does not matter', () => {
    assert.strictEqual(checkOperationMaster(['div', 'mul', 'sub', 'add']), true);
  });
});

describe('checkDedication', () => {
  test('50 correct → true',  () => assert.strictEqual(checkDedication(50), true));
  test('100 correct → true', () => assert.strictEqual(checkDedication(100), true));
  test('49 correct → false', () => assert.strictEqual(checkDedication(49), false));
});

// ── Phase 4: Variety badge checks (T026) ─────────────────────────────────

describe('checkExplorer', () => {
  test('all 3 difficulties → true', () => {
    assert.strictEqual(checkExplorer(['easy', 'medium', 'hard']), true);
  });
  test('only 2 difficulties → false', () => {
    assert.strictEqual(checkExplorer(['easy', 'medium']), false);
  });
  test('empty → false', () => {
    assert.strictEqual(checkExplorer([]), false);
  });
});

describe('checkTimeLord', () => {
  test('all 6 timers [5,10,15,20,25,30] → true', () => {
    assert.strictEqual(checkTimeLord([5, 10, 15, 20, 25, 30]), true);
  });
  test('only 5 timers → false', () => {
    assert.strictEqual(checkTimeLord([5, 10, 15, 20, 25]), false);
  });
  test('empty → false', () => {
    assert.strictEqual(checkTimeLord([]), false);
  });
});

describe('checkPerfectionist', () => {
  test('hard, 10 answered, 10 correct → true',     () => assert.strictEqual(checkPerfectionist('hard', 10, 10), true));
  test('hard, 10 answered, 9 correct → false',     () => assert.strictEqual(checkPerfectionist('hard', 10, 9), false));
  test('medium, 10 answered, 10 correct → false',  () => assert.strictEqual(checkPerfectionist('medium', 10, 10), false));
  test('hard, 0 answered, 0 correct → false',      () => assert.strictEqual(checkPerfectionist('hard', 0, 0), false));
  test('hard, 1 answered, 1 correct → true',       () => assert.strictEqual(checkPerfectionist('hard', 1, 1), true));
});

// ── Phase 4: Orchestrators and awardBadges (T028) ────────────────────────

describe('checkBadgesAfterQuestion', () => {
  beforeEach(() => { _ls = {}; });

  test('returns only IDs for unearned badges whose conditions are met', () => {
    const store = getBadgeStore();
    const session = { streak: 3, answerTimesMs: [2500], fastAnswerStreak: 1 };
    const ids = checkBadgesAfterQuestion(session, store);
    assert.ok(ids.includes('hat-trick'), 'should earn hat-trick at streak 3');
    assert.ok(!ids.includes('on-fire'), 'should not earn on-fire at streak 3');
    assert.ok(ids.includes('speed-demon'), 'should earn speed-demon at 2500ms');
  });

  test('skips already-earned badges', () => {
    const store = getBadgeStore();
    store['hat-trick'] = { earned: true, unlockedAt: '2026-01-01T00:00:00.000Z' };
    const session = { streak: 5, answerTimesMs: [2000], fastAnswerStreak: 5 };
    const ids = checkBadgesAfterQuestion(session, store);
    assert.ok(!ids.includes('hat-trick'), 'hat-trick already earned — skip');
    assert.ok(ids.includes('on-fire'));
    assert.ok(ids.includes('lightning'));
    assert.ok(ids.includes('speed-demon'));
  });

  test('returns empty array when no conditions met', () => {
    const store = getBadgeStore();
    const session = { streak: 1, answerTimesMs: [8000], fastAnswerStreak: 0 };
    const ids = checkBadgesAfterQuestion(session, store);
    assert.deepStrictEqual(ids, []);
  });
});

describe('checkBadgesAfterGame', () => {
  beforeEach(() => { _ls = {}; });

  function makeSession(overrides = {}) {
    return {
      correctAnswers: 5,
      lives: 3,
      score: 50,
      config: { timerSeconds: 15, starThresholds: { two: 70, three: 130 } },
      answerTimesMs: Array(10).fill(5000),
      questionsAnswered: 10,
      ...overrides,
    };
  }

  test('first-win earns on first game (badge not earned)', () => {
    const store = getBadgeStore();
    const ids = checkBadgesAfterGame(makeSession(), store, []);
    assert.ok(ids.includes('first-win'));
  });

  test('first-win skipped when already earned', () => {
    const store = getBadgeStore();
    store['first-win'] = { earned: true, unlockedAt: '2026-01-01T00:00:00.000Z' };
    const ids = checkBadgesAfterGame(makeSession(), store, []);
    assert.ok(!ids.includes('first-win'));
  });

  test('century earns at score 100', () => {
    const store = getBadgeStore();
    const ids = checkBadgesAfterGame(makeSession({ score: 100 }), store, []);
    assert.ok(ids.includes('century'));
  });

  test('high-roller earns at score 150', () => {
    const store = getBadgeStore();
    const ids = checkBadgesAfterGame(makeSession({ score: 150 }), store, []);
    assert.ok(ids.includes('high-roller'));
  });

  test('math-legend earns at score 200', () => {
    const store = getBadgeStore();
    const ids = checkBadgesAfterGame(makeSession({ score: 200 }), store, []);
    assert.ok(ids.includes('math-legend'));
  });

  test('sharp-shooter earns when 10 correct', () => {
    const store = getBadgeStore();
    const ids = checkBadgesAfterGame(makeSession({ correctAnswers: 10 }), store, []);
    assert.ok(ids.includes('sharp-shooter'));
  });

  test('comeback-kid earns: 2 hearts lost (lives=1), score >= 130 (3 stars)', () => {
    const store = getBadgeStore();
    const ids = checkBadgesAfterGame(makeSession({ lives: 1, score: 130 }), store, []);
    assert.ok(ids.includes('comeback-kid'));
  });

  test('comeback-kid does not earn: 1 heart lost (lives=2)', () => {
    const store = getBadgeStore();
    const ids = checkBadgesAfterGame(makeSession({ lives: 2, score: 130 }), store, []);
    assert.ok(!ids.includes('comeback-kid'));
  });

  test('time-lord earns when all 6 timers used', () => {
    const store = getBadgeStore();
    const ids = checkBadgesAfterGame(makeSession({ config: { timerSeconds: 30, starThresholds: { two: 70, three: 130 } } }), store, [5, 10, 15, 20, 25]);
    assert.ok(ids.includes('time-lord'));
  });

  test('quick-thinker earns with 10 answers all fast', () => {
    const store = getBadgeStore();
    const times = Array(10).fill(3000);
    const ids = checkBadgesAfterGame(makeSession({ answerTimesMs: times, questionsAnswered: 10 }), store, []);
    assert.ok(ids.includes('quick-thinker'));
  });
});

describe('checkBadgesAfterPractice', () => {
  beforeEach(() => { _ls = {}; });

  test('practice-makes-perfect earns at 5 sessions', () => {
    const store = getBadgeStore();
    const stats = { sessionsCompleted: 5, operationsCompleted: ['add'], difficultiesCompleted: ['easy'], totalCorrect: 10 };
    const sessionData = { difficulty: 'easy', totalAnswered: 10, totalCorrect: 10 };
    const ids = checkBadgesAfterPractice(stats, sessionData, store);
    assert.ok(ids.includes('practice-makes-perfect'));
  });

  test('operation-master earns when all 4 operations completed', () => {
    const store = getBadgeStore();
    const stats = { sessionsCompleted: 4, operationsCompleted: ['add', 'sub', 'mul', 'div'], difficultiesCompleted: ['easy'], totalCorrect: 20 };
    const sessionData = { difficulty: 'easy', totalAnswered: 5, totalCorrect: 4 };
    const ids = checkBadgesAfterPractice(stats, sessionData, store);
    assert.ok(ids.includes('operation-master'));
  });

  test('dedication earns at 50 total correct', () => {
    const store = getBadgeStore();
    const stats = { sessionsCompleted: 2, operationsCompleted: ['add'], difficultiesCompleted: ['easy'], totalCorrect: 50 };
    const sessionData = { difficulty: 'easy', totalAnswered: 10, totalCorrect: 5 };
    const ids = checkBadgesAfterPractice(stats, sessionData, store);
    assert.ok(ids.includes('dedication'));
  });

  test('explorer earns when all 3 difficulties completed', () => {
    const store = getBadgeStore();
    const stats = { sessionsCompleted: 3, operationsCompleted: ['add'], difficultiesCompleted: ['easy', 'medium', 'hard'], totalCorrect: 30 };
    const sessionData = { difficulty: 'hard', totalAnswered: 10, totalCorrect: 8 };
    const ids = checkBadgesAfterPractice(stats, sessionData, store);
    assert.ok(ids.includes('explorer'));
  });

  test('perfectionist earns on hard session with 100% correct', () => {
    const store = getBadgeStore();
    const stats = { sessionsCompleted: 1, operationsCompleted: ['add'], difficultiesCompleted: ['hard'], totalCorrect: 10 };
    const sessionData = { difficulty: 'hard', totalAnswered: 10, totalCorrect: 10 };
    const ids = checkBadgesAfterPractice(stats, sessionData, store);
    assert.ok(ids.includes('perfectionist'));
  });

  test('perfectionist does not earn on hard with less than 100%', () => {
    const store = getBadgeStore();
    const stats = { sessionsCompleted: 1, operationsCompleted: ['add'], difficultiesCompleted: ['hard'], totalCorrect: 9 };
    const sessionData = { difficulty: 'hard', totalAnswered: 10, totalCorrect: 9 };
    const ids = checkBadgesAfterPractice(stats, sessionData, store);
    assert.ok(!ids.includes('perfectionist'));
  });
});

describe('awardBadges', () => {
  beforeEach(() => { _ls = {}; });

  test('awards badge with earned:true and ISO unlockedAt', () => {
    const store = getBadgeStore();
    const updated = awardBadges(['hat-trick'], store);
    assert.strictEqual(updated['hat-trick'].earned, true);
    assert.ok(typeof updated['hat-trick'].unlockedAt === 'string');
    assert.ok(updated['hat-trick'].unlockedAt.includes('T'));
  });

  test('calling awardBadges twice on same badge does NOT change unlockedAt', () => {
    const store = getBadgeStore();
    const first = awardBadges(['hat-trick'], store);
    const firstDate = first['hat-trick'].unlockedAt;
    const second = awardBadges(['hat-trick'], first);
    assert.strictEqual(second['hat-trick'].unlockedAt, firstDate);
  });

  test('does NOT mutate the input store', () => {
    const store = getBadgeStore();
    const updated = awardBadges(['hat-trick'], store);
    assert.strictEqual(store['hat-trick'].earned, false, 'original should be unchanged');
    assert.strictEqual(updated['hat-trick'].earned, true);
  });

  test('other badges remain unaffected', () => {
    const store = getBadgeStore();
    const updated = awardBadges(['hat-trick'], store);
    assert.strictEqual(updated['speed-demon'].earned, false);
    assert.strictEqual(updated['first-win'].earned, false);
  });
});

// ── Phase 6: Persistence edge cases (T043-T046) ──────────────────────────

describe('getBadgeStore persistence edge cases', () => {
  beforeEach(() => { _ls = {}; });

  test('absent key → full 18-badge init with all earned:false, unlockedAt:null', () => {
    const store = getBadgeStore();
    assert.strictEqual(Object.keys(store).length, 18);
    assert.ok(Object.values(store).every(r => r.earned === false && r.unlockedAt === null));
  });

  test('"not-json" stored → returns init state, no exception thrown', () => {
    _ls['mathblaster_badges'] = 'not-json';
    let store;
    assert.doesNotThrow(() => { store = getBadgeStore(); });
    assert.strictEqual(Object.keys(store).length, 18);
    assert.ok(Object.values(store).every(r => r.earned === false));
  });

  test('valid JSON missing some badges → fills in missing as unearned', () => {
    _ls['mathblaster_badges'] = JSON.stringify({
      'hat-trick': { earned: true, unlockedAt: '2026-05-01T00:00:00.000Z' },
    });
    const store = getBadgeStore();
    assert.strictEqual(store['hat-trick'].earned, true);
    assert.strictEqual(store['speed-demon'].earned, false);
    assert.strictEqual(Object.keys(store).length, 18);
  });
});

describe('awardBadges idempotency', () => {
  beforeEach(() => { _ls = {}; });

  test('awarding a new badge sets earned:true and ISO unlockedAt', () => {
    const store = getBadgeStore();
    const updated = awardBadges(['speed-demon'], store);
    assert.strictEqual(updated['speed-demon'].earned, true);
    assert.match(updated['speed-demon'].unlockedAt, /^\d{4}-\d{2}-\d{2}T/);
  });

  test('awarding same badge a second time does NOT change unlockedAt', () => {
    const store = getBadgeStore();
    const first = awardBadges(['speed-demon'], store);
    const originalDate = first['speed-demon'].unlockedAt;
    const second = awardBadges(['speed-demon'], first);
    assert.strictEqual(second['speed-demon'].unlockedAt, originalDate);
  });

  test('returns new object — does not mutate input store', () => {
    const store = getBadgeStore();
    const updated = awardBadges(['hat-trick'], store);
    assert.notStrictEqual(store, updated);
    assert.strictEqual(store['hat-trick'].earned, false);
  });
});

describe('getPracticeStats accumulation', () => {
  beforeEach(() => { _ls = {}; });

  test('absent key returns sessionsCompleted:0 and empty arrays', () => {
    assert.deepStrictEqual(getPracticeStats(), {
      sessionsCompleted: 0,
      operationsCompleted: [],
      difficultiesCompleted: [],
      totalCorrect: 0,
    });
  });

  test('sessionsCompleted increments correctly across two saves', () => {
    savePracticeStats({ sessionsCompleted: 1, operationsCompleted: ['add'], difficultiesCompleted: ['easy'], totalCorrect: 10 });
    let s = getPracticeStats();
    s.sessionsCompleted++;
    savePracticeStats(s);
    assert.strictEqual(getPracticeStats().sessionsCompleted, 2);
  });
});

describe('getTimersUsed edge cases', () => {
  beforeEach(() => { _ls = {}; });

  test('absent key returns []', () => {
    assert.deepStrictEqual(getTimersUsed(), []);
  });

  test('saveTimersUsed([5,15]) then saveTimersUsed([5,15,30]) → [5,15,30]', () => {
    saveTimersUsed([5, 15]);
    saveTimersUsed([5, 15, 30]);
    assert.deepStrictEqual(getTimersUsed(), [5, 15, 30]);
  });

  test('checkTimeLord([5,10,15,20,25,30]) → true', () => {
    assert.strictEqual(checkTimeLord([5, 10, 15, 20, 25, 30]), true);
  });

  test('checkTimeLord([5,10,15,20,25]) → false', () => {
    assert.strictEqual(checkTimeLord([5, 10, 15, 20, 25]), false);
  });
});

// ── Constants check ────────────────────────────────────────────────────────

describe('BADGE_DEFINITIONS', () => {
  test('contains exactly 18 badges', () => {
    assert.strictEqual(BADGE_DEFINITIONS.length, 18);
  });

  test('all badges have required fields', () => {
    for (const b of BADGE_DEFINITIONS) {
      assert.ok(b.id, `badge missing id`);
      assert.ok(b.name, `badge ${b.id} missing name`);
      assert.ok(b.emoji, `badge ${b.id} missing emoji`);
      assert.ok(b.category, `badge ${b.id} missing category`);
      assert.ok(b.hint, `badge ${b.id} missing hint`);
      assert.ok(b.description, `badge ${b.id} missing description`);
    }
  });
});

describe('BADGE_CATEGORIES', () => {
  test('contains exactly 5 categories', () => {
    assert.strictEqual(BADGE_CATEGORIES.length, 5);
  });
});
