import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Minimal localStorage mock for Node.js test environment
const makeStorage = () => {
  const store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { for (const k in store) delete store[k]; },
    _store: store,
  };
};

let storage;
globalThis.localStorage = null;

// Re-import after patching localStorage requires dynamic import trick;
// instead we test pure functions by injecting storage through the module.
// We patch global before importing the module.

import {
  loadAuditLog,
  appendAuditEntry,
  clearAuditLog,
  formatDuration,
  formatTimestamp,
  computeAuditSummary,
  timerToDifficulty,
} from '../js/audit-log-engine.js';

beforeEach(() => {
  storage = makeStorage();
  globalThis.localStorage = storage;
});

// ── loadAuditLog ──────────────────────────────────────────────────────────────

describe('loadAuditLog', () => {
  it('returns empty array when key is absent', () => {
    const result = loadAuditLog();
    assert.deepEqual(result, []);
  });

  it('returns parsed array when key contains valid JSON array', () => {
    const entries = [{ startTime: '2026-01-01T00:00:00.000Z', errors: 0 }];
    storage.setItem('mathblaster_audit_log', JSON.stringify(entries));
    const result = loadAuditLog();
    assert.equal(result.length, 1);
    assert.equal(result[0].errors, 0);
  });

  it('returns empty array when key contains malformed JSON', () => {
    storage.setItem('mathblaster_audit_log', 'not-json');
    const result = loadAuditLog();
    assert.deepEqual(result, []);
  });
});

// ── appendAuditEntry ──────────────────────────────────────────────────────────

const makeEntry = (overrides = {}) => ({
  startTime: '2026-01-01T10:00:00.000Z',
  endTime: '2026-01-01T10:05:00.000Z',
  errors: 1,
  endReason: 'completed',
  playerName: 'Test',
  score: 100,
  difficulty: 'Medium',
  timerSetting: 15,
  ...overrides,
});

describe('appendAuditEntry', () => {
  it('appends entry to empty log', () => {
    appendAuditEntry(makeEntry());
    const log = loadAuditLog();
    assert.equal(log.length, 1);
    assert.equal(log[0].score, 100);
  });

  it('appends multiple entries in order', () => {
    appendAuditEntry(makeEntry({ score: 10 }));
    appendAuditEntry(makeEntry({ score: 20 }));
    const log = loadAuditLog();
    assert.equal(log.length, 2);
    assert.equal(log[0].score, 10);
    assert.equal(log[1].score, 20);
  });

  it('does not exceed 100 entries — trims oldest when at cap', () => {
    // Seed exactly 100 entries
    const seed = Array.from({ length: 100 }, (_, i) => makeEntry({ score: i }));
    storage.setItem('mathblaster_audit_log', JSON.stringify(seed));

    appendAuditEntry(makeEntry({ score: 999 }));
    const log = loadAuditLog();
    assert.equal(log.length, 100);
    assert.equal(log[99].score, 999);
    assert.equal(log[0].score, 1); // oldest (score 0) was dropped
  });

  it('does not exceed 100 entries when seeded with 101', () => {
    const seed = Array.from({ length: 101 }, (_, i) => makeEntry({ score: i }));
    storage.setItem('mathblaster_audit_log', JSON.stringify(seed));

    appendAuditEntry(makeEntry({ score: 999 }));
    const log = loadAuditLog();
    assert.equal(log.length, 100);
    assert.equal(log[99].score, 999);
  });
});

// ── clearAuditLog ─────────────────────────────────────────────────────────────

describe('clearAuditLog', () => {
  it('removes mathblaster_audit_log key', () => {
    storage.setItem('mathblaster_audit_log', '[]');
    clearAuditLog();
    assert.equal(storage.getItem('mathblaster_audit_log'), null);
  });

  it('does not affect other keys', () => {
    storage.setItem('mathblaster_audit_log', '[]');
    storage.setItem('mathblaster_leaderboard', '[{"name":"Zbig"}]');
    storage.setItem('mathblaster_badges', '{}');
    clearAuditLog();
    assert.notEqual(storage.getItem('mathblaster_leaderboard'), null);
    assert.notEqual(storage.getItem('mathblaster_badges'), null);
  });
});

// ── formatDuration ────────────────────────────────────────────────────────────

describe('formatDuration', () => {
  it('formats durations under 60 seconds as "Xs"', () => {
    const start = '2026-01-01T10:00:00.000Z';
    const end   = '2026-01-01T10:00:45.000Z'; // 45 000 ms
    assert.equal(formatDuration(start, end), '45s');
  });

  it('formats durations of exactly 60 seconds as "1m 0s"', () => {
    const start = '2026-01-01T10:00:00.000Z';
    const end   = '2026-01-01T10:01:00.000Z'; // 60 000 ms
    assert.equal(formatDuration(start, end), '1m 0s');
  });

  it('formats durations over 60 seconds as "Xm Ys"', () => {
    const start = '2026-01-01T10:00:00.000Z';
    const end   = '2026-01-01T10:03:12.000Z'; // 192 000 ms = 3m 12s
    assert.equal(formatDuration(start, end), '3m 12s');
  });

  it('formats 1 second as "1s"', () => {
    const start = '2026-01-01T10:00:00.000Z';
    const end   = '2026-01-01T10:00:01.000Z';
    assert.equal(formatDuration(start, end), '1s');
  });
});

// ── formatTimestamp ───────────────────────────────────────────────────────────

describe('formatTimestamp', () => {
  it('returns a non-empty string for a valid ISO timestamp', () => {
    const result = formatTimestamp('2026-04-30T12:23:00.000Z');
    assert.ok(typeof result === 'string' && result.length > 0);
  });

  it('includes the day number in the output', () => {
    // We can't test exact timezone output reliably, but we can test structure.
    // Use a timestamp where day = 30 in most UTC-adjacent timezones.
    const result = formatTimestamp('2026-04-30T14:00:00.000Z');
    assert.ok(result.includes('30'), `Expected "30" in "${result}"`);
  });

  it('includes a colon for the time separator', () => {
    const result = formatTimestamp('2026-04-30T14:23:00.000Z');
    assert.ok(result.includes(':'), `Expected ":" in "${result}"`);
  });
});

// ── computeAuditSummary ───────────────────────────────────────────────────────

describe('computeAuditSummary', () => {
  it('returns zero-state for empty log', () => {
    const summary = computeAuditSummary([]);
    assert.equal(summary.totalSessions, 0);
    assert.equal(summary.totalPlayTimeMs, 0);
    assert.equal(summary.avgErrors, 0);
    assert.equal(summary.mostActivePlayer, null);
  });

  it('returns correct totals for single entry', () => {
    const entry = makeEntry({
      startTime: '2026-01-01T10:00:00.000Z',
      endTime:   '2026-01-01T10:05:00.000Z', // 300 000 ms
      errors: 3,
      playerName: 'Maja',
    });
    const summary = computeAuditSummary([entry]);
    assert.equal(summary.totalSessions, 1);
    assert.equal(summary.totalPlayTimeMs, 300000);
    assert.equal(summary.avgErrors, 3);
    assert.equal(summary.mostActivePlayer, 'Maja');
  });

  it('returns most active player (highest session count)', () => {
    const e1 = makeEntry({ playerName: 'Maja' });
    const e2 = makeEntry({ playerName: 'Maja' });
    const e3 = makeEntry({ playerName: 'Kuba' });
    const summary = computeAuditSummary([e1, e2, e3]);
    assert.equal(summary.mostActivePlayer, 'Maja');
  });

  it('breaks ties alphabetically (A first)', () => {
    const e1 = makeEntry({ playerName: 'Zbig' });
    const e2 = makeEntry({ playerName: 'Ana' });
    const e3 = makeEntry({ playerName: 'Zbig' });
    const e4 = makeEntry({ playerName: 'Ana' });
    const summary = computeAuditSummary([e1, e2, e3, e4]);
    assert.equal(summary.mostActivePlayer, 'Ana');
  });

  it('returns null mostActivePlayer when all entries have null playerName', () => {
    const entries = [makeEntry({ playerName: null }), makeEntry({ playerName: null })];
    const summary = computeAuditSummary(entries);
    assert.equal(summary.mostActivePlayer, null);
  });

  it('averages errors correctly and rounds to 1 decimal', () => {
    const e1 = makeEntry({ errors: 1 });
    const e2 = makeEntry({ errors: 2 });
    const summary = computeAuditSummary([e1, e2]);
    assert.equal(summary.avgErrors, 1.5);
  });
});

// ── timerToDifficulty ─────────────────────────────────────────────────────────

describe('timerToDifficulty', () => {
  it('returns "Hard" for 5 seconds', () => {
    assert.equal(timerToDifficulty(5), 'Hard');
  });

  it('returns "Hard" for 10 seconds', () => {
    assert.equal(timerToDifficulty(10), 'Hard');
  });

  it('returns "Medium" for 15 seconds', () => {
    assert.equal(timerToDifficulty(15), 'Medium');
  });

  it('returns "Medium" for 20 seconds', () => {
    assert.equal(timerToDifficulty(20), 'Medium');
  });

  it('returns "Easy" for 25 seconds', () => {
    assert.equal(timerToDifficulty(25), 'Easy');
  });

  it('returns "Easy" for 30 seconds', () => {
    assert.equal(timerToDifficulty(30), 'Easy');
  });
});
