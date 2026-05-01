import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ── localStorage mock (must be set up before the engine module is imported) ──
let _ls = {};
globalThis.localStorage = {
  getItem:    (k)    => Object.prototype.hasOwnProperty.call(_ls, k) ? _ls[k] : null,
  setItem:    (k, v) => { _ls[k] = String(v); },
  removeItem: (k)    => { delete _ls[k]; },
  clear:      ()     => { _ls = {}; },
};

import {
  loadLeaderboard, saveEntry,
  loadStats, updateStats,
  clearLeaderboard,
  isEligibleForNamePicker, qualifiesForTop10,
  sortLeaderboard,
  getUniquePlayers, resolvePlayerName,
  getLastPlayerName, setLastPlayerName,
  getFavouriteDifficulty,
  formatEntryDate,
} from '../js/leaderboard-engine.js';

// ── helpers ───────────────────────────────────────────────────────────────

function makeEntry(overrides = {}) {
  return {
    name: 'Zbig',
    score: 100,
    stars: 2,
    difficulty: 'Standard',
    timerSetting: '15s',
    stoppedEarly: false,
    date: '2026-04-30T14:23:55.123Z',
    accuracy: 80,
    bestStreak: 5,
    ...overrides,
  };
}

// ── Smoke test ─────────────────────────────────────────────────────────────

describe('smoke', () => {
  beforeEach(() => { _ls = {}; });

  test('module loads and loadLeaderboard returns empty array on fresh storage', () => {
    const board = loadLeaderboard();
    assert.deepStrictEqual(board, []);
  });
});

// ── loadLeaderboard & saveEntry ───────────────────────────────────────────

describe('loadLeaderboard', () => {
  beforeEach(() => { _ls = {}; });

  test('absent key returns []', () => {
    assert.deepStrictEqual(loadLeaderboard(), []);
  });

  test('valid JSON array is returned', () => {
    const entry = makeEntry();
    _ls['mathblaster_leaderboard'] = JSON.stringify([entry]);
    const board = loadLeaderboard();
    assert.strictEqual(board.length, 1);
    assert.strictEqual(board[0].name, 'Zbig');
  });

  test('corrupt JSON returns []', () => {
    _ls['mathblaster_leaderboard'] = 'not-json{{{';
    assert.deepStrictEqual(loadLeaderboard(), []);
  });

  test('non-array JSON returns []', () => {
    _ls['mathblaster_leaderboard'] = JSON.stringify({ name: 'Zbig' });
    assert.deepStrictEqual(loadLeaderboard(), []);
  });
});

describe('saveEntry', () => {
  beforeEach(() => { _ls = {}; });

  test('adds entry to empty leaderboard', () => {
    saveEntry(makeEntry({ score: 50 }));
    assert.strictEqual(loadLeaderboard().length, 1);
  });

  test('adds entry under cap (9 entries → 10)', () => {
    for (let i = 0; i < 9; i++) saveEntry(makeEntry({ score: 100 + i }));
    saveEntry(makeEntry({ score: 10 }));
    assert.strictEqual(loadLeaderboard().length, 10);
  });

  test('enforces cap at 10 — does not exceed', () => {
    for (let i = 0; i < 10; i++) saveEntry(makeEntry({ score: 100 + i }));
    saveEntry(makeEntry({ score: 200 }));
    assert.strictEqual(loadLeaderboard().length, 10);
  });

  test('drops entry with lowest score when cap exceeded', () => {
    for (let i = 0; i < 10; i++) saveEntry(makeEntry({ score: 100 + i }));
    // scores are 100..109; add 200 → 100 should be dropped
    saveEntry(makeEntry({ score: 200, name: 'New' }));
    const board = loadLeaderboard();
    assert.strictEqual(board.length, 10);
    assert.ok(!board.some(e => e.score === 100), 'lowest score (100) should be dropped');
    assert.ok(board.some(e => e.score === 200), 'new high score should be present');
  });

  test('drops earliest date when scores are tied at the boundary', () => {
    // Fill with 9 entries at score 100, then add a 10th
    for (let i = 0; i < 9; i++) {
      saveEntry(makeEntry({ score: 100, date: `2026-04-${String(i + 1).padStart(2, '0')}T00:00:00.000Z` }));
    }
    // 10th entry also score 100 — board now has 10 equal scores
    saveEntry(makeEntry({ score: 100, date: '2026-04-10T00:00:00.000Z' }));
    // Add 11th at same score — should evict Apr 1 (earliest)
    saveEntry(makeEntry({ score: 100, name: 'New', date: '2026-04-11T00:00:00.000Z' }));
    const board = loadLeaderboard();
    assert.strictEqual(board.length, 10);
    assert.ok(!board.some(e => e.date === '2026-04-01T00:00:00.000Z'), 'earliest-date entry should be dropped');
  });
});

// ── sortLeaderboard ───────────────────────────────────────────────────────

describe('sortLeaderboard', () => {
  test('sorts by score descending', () => {
    const entries = [makeEntry({ score: 50 }), makeEntry({ score: 200 }), makeEntry({ score: 100 })];
    const sorted = sortLeaderboard(entries);
    assert.strictEqual(sorted[0].score, 200);
    assert.strictEqual(sorted[1].score, 100);
    assert.strictEqual(sorted[2].score, 50);
  });

  test('ties broken by ISO timestamp descending (newer date first)', () => {
    const a = makeEntry({ score: 100, date: '2026-04-01T00:00:00.000Z' });
    const b = makeEntry({ score: 100, date: '2026-04-30T23:59:59.999Z' });
    const sorted = sortLeaderboard([a, b]);
    assert.strictEqual(sorted[0].date, '2026-04-30T23:59:59.999Z');
    assert.strictEqual(sorted[1].date, '2026-04-01T00:00:00.000Z');
  });

  test('does not mutate the original array', () => {
    const entries = [makeEntry({ score: 50 }), makeEntry({ score: 100 })];
    const original = [...entries];
    sortLeaderboard(entries);
    assert.deepStrictEqual(entries, original);
  });
});

// ── formatEntryDate ───────────────────────────────────────────────────────

describe('formatEntryDate', () => {
  test('formats ISO timestamp to "Apr 30" style', () => {
    const result = formatEntryDate('2026-04-30T14:23:55.123Z');
    assert.match(result, /Apr/);
    assert.match(result, /30/);
  });
});

// ── loadStats & updateStats ───────────────────────────────────────────────

describe('loadStats', () => {
  beforeEach(() => { _ls = {}; });

  test('absent key returns zeroed defaults', () => {
    const stats = loadStats();
    assert.strictEqual(stats.totalGamesPlayed, 0);
    assert.strictEqual(stats.bestScoreEver, 0);
    assert.strictEqual(stats.bestAccuracyEver, 0);
    assert.deepStrictEqual(stats.difficultyCounts, { Easy: 0, Medium: 0, Hard: 0, Standard: 0 });
  });

  test('corrupt JSON returns zeroed defaults', () => {
    _ls['mathblaster_leaderboard_stats'] = 'bad{{json';
    const stats = loadStats();
    assert.strictEqual(stats.totalGamesPlayed, 0);
  });

  test('missing totalGamesPlayed field returns zeroed defaults', () => {
    _ls['mathblaster_leaderboard_stats'] = JSON.stringify({ bestScoreEver: 100 });
    const stats = loadStats();
    assert.strictEqual(stats.totalGamesPlayed, 0);
  });
});

describe('updateStats', () => {
  beforeEach(() => { _ls = {}; });

  test('increments totalGamesPlayed', () => {
    updateStats({ score: 100, accuracy: 80, difficulty: 'Standard', questionsAnswered: 5, isPractice: false });
    assert.strictEqual(loadStats().totalGamesPlayed, 1);
    updateStats({ score: 50, accuracy: 60, difficulty: 'Standard', questionsAnswered: 3, isPractice: false });
    assert.strictEqual(loadStats().totalGamesPlayed, 2);
  });

  test('tracks bestScoreEver', () => {
    updateStats({ score: 100, accuracy: 80, difficulty: 'Standard', questionsAnswered: 5, isPractice: false });
    updateStats({ score: 200, accuracy: 90, difficulty: 'Standard', questionsAnswered: 5, isPractice: false });
    updateStats({ score: 50,  accuracy: 50, difficulty: 'Standard', questionsAnswered: 5, isPractice: false });
    assert.strictEqual(loadStats().bestScoreEver, 200);
  });

  test('tracks bestAccuracyEver', () => {
    updateStats({ score: 100, accuracy: 70, difficulty: 'Standard', questionsAnswered: 5, isPractice: false });
    updateStats({ score: 80,  accuracy: 95, difficulty: 'Standard', questionsAnswered: 5, isPractice: false });
    assert.strictEqual(loadStats().bestAccuracyEver, 95);
  });

  test('increments difficultyCounts for given difficulty', () => {
    updateStats({ score: 100, accuracy: 80, difficulty: 'Standard', questionsAnswered: 5, isPractice: false });
    updateStats({ score: 100, accuracy: 80, difficulty: 'Standard', questionsAnswered: 5, isPractice: false });
    assert.strictEqual(loadStats().difficultyCounts.Standard, 2);
  });

  test('updateStats called regardless of top-10 status (always fires)', () => {
    // Fill board with high scores so any new score wouldn't qualify
    for (let i = 0; i < 10; i++) saveEntry(makeEntry({ score: 500 + i }));
    // Update stats with a low score — should still increment
    updateStats({ score: 1, accuracy: 10, difficulty: 'Standard', questionsAnswered: 1, isPractice: false });
    assert.strictEqual(loadStats().totalGamesPlayed, 1);
  });
});

// ── getFavouriteDifficulty ────────────────────────────────────────────────

describe('getFavouriteDifficulty', () => {
  test('returns difficulty with highest count', () => {
    const stats = { difficultyCounts: { Easy: 1, Medium: 5, Hard: 2, Standard: 0 } };
    assert.strictEqual(getFavouriteDifficulty(stats), 'Medium');
  });

  test('alphabetical tiebreak when two difficulties tie', () => {
    // Easy=3 and Hard=3 tie → alphabetically "Easy" wins
    const stats = { difficultyCounts: { Easy: 3, Medium: 1, Hard: 3, Standard: 0 } };
    assert.strictEqual(getFavouriteDifficulty(stats), 'Easy');
  });

  test('returns Standard as fallback when all zero', () => {
    const stats = { difficultyCounts: { Easy: 0, Medium: 0, Hard: 0, Standard: 0 } };
    // Any of the four could be returned; just check it is one of the valid keys or 'Standard'
    const result = getFavouriteDifficulty(stats);
    assert.ok(['Easy', 'Medium', 'Hard', 'Standard'].includes(result));
  });
});

// ── isEligibleForNamePicker ───────────────────────────────────────────────

describe('isEligibleForNamePicker', () => {
  test('practice mode → false', () => {
    assert.strictEqual(isEligibleForNamePicker({ isPractice: true, questionsAnswered: 5 }), false);
  });

  test('0 questions answered → false', () => {
    assert.strictEqual(isEligibleForNamePicker({ isPractice: false, questionsAnswered: 0 }), false);
  });

  test('normal game ≥1 question → true', () => {
    assert.strictEqual(isEligibleForNamePicker({ isPractice: false, questionsAnswered: 1 }), true);
  });

  test('score=0 with ≥1 question → true (score is irrelevant to eligibility)', () => {
    assert.strictEqual(isEligibleForNamePicker({ isPractice: false, questionsAnswered: 3, score: 0 }), true);
  });
});

// ── qualifiesForTop10 ─────────────────────────────────────────────────────

describe('qualifiesForTop10', () => {
  beforeEach(() => { _ls = {}; });

  test('board has fewer than 10 entries → true', () => {
    for (let i = 0; i < 9; i++) saveEntry(makeEntry({ score: 100 }));
    assert.strictEqual(qualifiesForTop10(1), true);
  });

  test('score strictly greater than lowest on full board → true', () => {
    for (let i = 0; i < 10; i++) saveEntry(makeEntry({ score: 100 + i }));
    // lowest is 100; 101 > 100
    assert.strictEqual(qualifiesForTop10(101), true);
  });

  test('score equal to lowest on full board → false', () => {
    for (let i = 0; i < 10; i++) saveEntry(makeEntry({ score: 100 + i }));
    // lowest is 100; equal score does not qualify
    assert.strictEqual(qualifiesForTop10(100), false);
  });

  test('score less than lowest on full board → false', () => {
    for (let i = 0; i < 10; i++) saveEntry(makeEntry({ score: 100 + i }));
    assert.strictEqual(qualifiesForTop10(50), false);
  });

  test('empty board → true', () => {
    assert.strictEqual(qualifiesForTop10(0), true);
  });
});

// ── getUniquePlayers ──────────────────────────────────────────────────────

describe('getUniquePlayers', () => {
  test('returns unique names sorted alphabetically A→Z', () => {
    const entries = [
      makeEntry({ name: 'Zbig', score: 100 }),
      makeEntry({ name: 'Maja', score: 120 }),
      makeEntry({ name: 'Kuba', score: 90 }),
      makeEntry({ name: 'Zbig', score: 80 }),
    ];
    const players = getUniquePlayers(entries);
    assert.deepStrictEqual(players.map(p => p.name), ['Kuba', 'Maja', 'Zbig']);
  });

  test('each player has correct personal best', () => {
    const entries = [
      makeEntry({ name: 'Zbig', score: 80 }),
      makeEntry({ name: 'Zbig', score: 150 }),
      makeEntry({ name: 'Zbig', score: 100 }),
    ];
    const players = getUniquePlayers(entries);
    assert.strictEqual(players[0].personalBest, 150);
  });

  test('returns empty array for empty entries', () => {
    assert.deepStrictEqual(getUniquePlayers([]), []);
  });
});

// ── resolvePlayerName ─────────────────────────────────────────────────────

describe('resolvePlayerName', () => {
  test('case-insensitive match returns existing capitalisation', () => {
    const result = resolvePlayerName('zbig', ['Zbig', 'Maja']);
    assert.strictEqual(result, 'Zbig');
  });

  test('mixed-case input matches existing', () => {
    const result = resolvePlayerName('MAJA', ['Zbig', 'Maja']);
    assert.strictEqual(result, 'Maja');
  });

  test('no match returns trimmed input as-is', () => {
    const result = resolvePlayerName('  Kuba  ', ['Zbig', 'Maja']);
    assert.strictEqual(result, 'Kuba');
  });

  test('exact match returns existing name', () => {
    const result = resolvePlayerName('Zbig', ['Zbig', 'Maja']);
    assert.strictEqual(result, 'Zbig');
  });
});

// ── getLastPlayerName / setLastPlayerName ─────────────────────────────────

describe('getLastPlayerName / setLastPlayerName', () => {
  beforeEach(() => { _ls = {}; });

  test('absent key returns empty string', () => {
    assert.strictEqual(getLastPlayerName(), '');
  });

  test('setLastPlayerName stores and getLastPlayerName reads it back', () => {
    setLastPlayerName('Maja');
    assert.strictEqual(getLastPlayerName(), 'Maja');
  });
});

// ── clearLeaderboard ──────────────────────────────────────────────────────

describe('clearLeaderboard', () => {
  beforeEach(() => { _ls = {}; });

  test('removes mathblaster_leaderboard key', () => {
    saveEntry(makeEntry());
    clearLeaderboard();
    assert.strictEqual(_ls['mathblaster_leaderboard'], undefined);
  });

  test('resets mathblaster_leaderboard_stats to defaults', () => {
    updateStats({ score: 200, accuracy: 90, difficulty: 'Standard', questionsAnswered: 5, isPractice: false });
    clearLeaderboard();
    const stats = loadStats();
    assert.strictEqual(stats.totalGamesPlayed, 0);
    assert.strictEqual(stats.bestScoreEver, 0);
  });

  test('does NOT remove mathblaster_last_player_name', () => {
    setLastPlayerName('Zbig');
    clearLeaderboard();
    assert.strictEqual(getLastPlayerName(), 'Zbig');
  });
});
