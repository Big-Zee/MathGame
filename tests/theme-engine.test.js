import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ── localStorage mock (must be set up before importing theme-engine) ──
let _ls = {};
globalThis.localStorage = {
  getItem:    (k)    => Object.prototype.hasOwnProperty.call(_ls, k) ? _ls[k] : null,
  setItem:    (k, v) => { _ls[k] = String(v); },
  removeItem: (k)    => { delete _ls[k]; },
  clear:      ()     => { _ls = {}; },
};

import {
  THEMES,
  getTheme,
  getAllThemes,
  getActiveThemeId,
  saveActiveThemeId,
} from '../js/theme-engine.js';

const REQUIRED_VAR_KEYS = [
  '--color-bg-start', '--color-bg-end', '--color-primary', '--color-accent',
  '--color-card-bg', '--color-card-border', '--color-button-bg', '--color-button-text',
  '--border-radius-btn', '--color-text', '--color-text-muted', '--color-surface',
  '--color-border',
];

const EXPECTED_IDS = ['space', 'ocean', 'jungle', 'volcano', 'candy', 'midnight'];

// ── T003: THEMES data completeness ───────────────────────────────────────────

describe('THEMES data completeness', () => {
  test('THEMES has exactly 6 keys', () => {
    assert.strictEqual(Object.keys(THEMES).length, 6);
  });

  test('THEMES contains all expected theme ids', () => {
    for (const id of EXPECTED_IDS) {
      assert.ok(Object.prototype.hasOwnProperty.call(THEMES, id), `Missing theme: ${id}`);
    }
  });

  test('each theme has all 13 required CSS variable keys in vars', () => {
    for (const id of EXPECTED_IDS) {
      const theme = THEMES[id];
      for (const key of REQUIRED_VAR_KEYS) {
        assert.ok(
          Object.prototype.hasOwnProperty.call(theme.vars, key),
          `Theme "${id}" missing var: ${key}`
        );
        assert.ok(typeof theme.vars[key] === 'string' && theme.vars[key].length > 0,
          `Theme "${id}" var "${key}" must be a non-empty string`);
      }
      assert.strictEqual(Object.keys(theme.vars).length, 13,
        `Theme "${id}" vars should have exactly 13 keys`);
    }
  });

  test('each theme has a non-empty emoji string', () => {
    for (const id of EXPECTED_IDS) {
      assert.ok(typeof THEMES[id].emoji === 'string' && THEMES[id].emoji.length > 0,
        `Theme "${id}" missing emoji`);
    }
  });

  test('each theme has exactly 3 decorations', () => {
    for (const id of EXPECTED_IDS) {
      const decs = THEMES[id].decorations;
      assert.ok(Array.isArray(decs), `Theme "${id}" decorations must be an array`);
      assert.strictEqual(decs.length, 3, `Theme "${id}" must have exactly 3 decorations`);
      for (const d of decs) {
        assert.ok(typeof d === 'string' && d.length > 0,
          `Theme "${id}" decoration must be a non-empty string`);
      }
    }
  });

  test('each theme has id, name, emoji, vars, decorations fields', () => {
    for (const id of EXPECTED_IDS) {
      const t = THEMES[id];
      assert.strictEqual(t.id, id, `Theme "${id}" id field must equal key`);
      assert.ok(typeof t.name === 'string' && t.name.length > 0, `Theme "${id}" missing name`);
    }
  });
});

// ── T004: getTheme() ──────────────────────────────────────────────────────────

describe('getTheme', () => {
  test('getTheme("space") returns object with id "space"', () => {
    const t = getTheme('space');
    assert.strictEqual(t.id, 'space');
  });

  test('getTheme("midnight") returns object with id "midnight"', () => {
    const t = getTheme('midnight');
    assert.strictEqual(t.id, 'midnight');
  });

  test('getTheme with unknown id throws an error', () => {
    assert.throws(() => getTheme('unknown'), /unknown theme/i);
  });
});

// ── T005: getAllThemes() ──────────────────────────────────────────────────────

describe('getAllThemes', () => {
  test('returns an array of exactly 6 objects', () => {
    const themes = getAllThemes();
    assert.ok(Array.isArray(themes));
    assert.strictEqual(themes.length, 6);
  });

  test('each object in the array has an id property', () => {
    const themes = getAllThemes();
    for (const t of themes) {
      assert.ok(typeof t.id === 'string' && t.id.length > 0);
    }
  });

  test('returned array contains all 6 expected ids', () => {
    const ids = getAllThemes().map(t => t.id);
    for (const expected of EXPECTED_IDS) {
      assert.ok(ids.includes(expected), `Missing id: ${expected}`);
    }
  });
});

// ── T006: getActiveThemeId() ──────────────────────────────────────────────────

describe('getActiveThemeId', () => {
  beforeEach(() => { _ls = {}; });

  test('returns "space" when localStorage is empty', () => {
    assert.strictEqual(getActiveThemeId(), 'space');
  });

  test('returns saved value when mathblaster_theme key exists', () => {
    _ls['mathblaster_theme'] = 'ocean';
    assert.strictEqual(getActiveThemeId(), 'ocean');
  });

  test('returns "space" when localStorage has unrecognised value', () => {
    _ls['mathblaster_theme'] = 'neon-disco';
    assert.strictEqual(getActiveThemeId(), 'space');
  });

  test('returns "space" when localStorage value is empty string', () => {
    _ls['mathblaster_theme'] = '';
    assert.strictEqual(getActiveThemeId(), 'space');
  });
});

// ── T007: saveActiveThemeId() ─────────────────────────────────────────────────

describe('saveActiveThemeId', () => {
  beforeEach(() => { _ls = {}; });

  test('after saveActiveThemeId("ocean"), getActiveThemeId() returns "ocean"', () => {
    saveActiveThemeId('ocean');
    assert.strictEqual(getActiveThemeId(), 'ocean');
  });

  test('writes to the mathblaster_theme key in localStorage', () => {
    saveActiveThemeId('jungle');
    assert.strictEqual(_ls['mathblaster_theme'], 'jungle');
  });

  test('second call overwrites the first', () => {
    saveActiveThemeId('volcano');
    saveActiveThemeId('midnight');
    assert.strictEqual(getActiveThemeId(), 'midnight');
  });
});
