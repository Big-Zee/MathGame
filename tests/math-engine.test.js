import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GameConfig,
  generateQuestion,
  buildChoices,
  generateRound,
  evaluateAnswer,
  calculateStars,
  updateStreak,
  applyWrongAnswer,
  applyTimerBonus,
  PracticeRanges,
  ENCOURAGING_MESSAGES,
  getPracticeConfig,
  getAccuracyTier,
  TIMER_OPTIONS,
  getGameConfigForTimer,
  getTimerPreference,
} from '../js/math-engine.js';

// ── T006: buildChoices + generateQuestion invariants ──────────────────────

describe('buildChoices', () => {
  for (const op of GameConfig.operations) {
    describe(`operation: ${op}`, () => {
      it('returns exactly 4 choices', () => {
        const q = generateQuestion(op, GameConfig, 0);
        assert.equal(q.choices.length, 4);
      });

      it('includes the correct answer', () => {
        const q = generateQuestion(op, GameConfig, 0);
        assert.ok(
          q.choices.includes(q.answer),
          `answer ${q.answer} not in choices [${q.choices}]`,
        );
      });

      it('all choices are unique positive integers', () => {
        const q = generateQuestion(op, GameConfig, 0);
        assert.equal(
          new Set(q.choices).size,
          4,
          `duplicate choices: [${q.choices}]`,
        );
        for (const c of q.choices) {
          assert.ok(Number.isInteger(c) && c > 0, `invalid choice: ${c}`);
        }
      });
    });
  }
});

describe('generateQuestion', () => {
  it('division always produces a whole-number answer', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('div', GameConfig, 0);
      assert.equal(q.answer % 1, 0, `non-integer: ${q.answer}`);
      assert.ok(q.answer > 0, `non-positive: ${q.answer}`);
    }
  });

  it('subtraction always produces a positive answer', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('sub', GameConfig, 0);
      assert.ok(q.answer > 0, `non-positive: ${q.answer}`);
    }
  });

  for (const op of GameConfig.operations) {
    it(`${op}: answer is always ≤ 100`, () => {
      for (let i = 0; i < 30; i++) {
        const q = generateQuestion(op, GameConfig, 0);
        assert.ok(q.answer <= 100, `answer ${q.answer} > 100 for op=${op}`);
      }
    });
  }
});

// ── T007: generateRound ───────────────────────────────────────────────────

describe('generateRound', () => {
  it('returns exactly totalQuestions questions', () => {
    const round = generateRound(GameConfig);
    assert.equal(round.length, GameConfig.totalQuestions);
  });

  it('each question has 4 unique choices containing the correct answer', () => {
    const round = generateRound(GameConfig);
    for (const q of round) {
      assert.equal(q.choices.length, 4);
      assert.ok(q.choices.includes(q.answer), `answer ${q.answer} missing`);
      assert.equal(new Set(q.choices).size, 4, `duplicates in [${q.choices}]`);
    }
  });
});

// ── T008: evaluateAnswer + calculateStars ────────────────────────────────

describe('evaluateAnswer', () => {
  it('returns true for the correct choice', () => {
    const q = generateQuestion('add', GameConfig, 0);
    assert.equal(evaluateAnswer(q, q.answer).correct, true);
  });

  it('returns false for a wrong choice', () => {
    const q = generateQuestion('add', GameConfig, 0);
    const wrong = q.choices.find(c => c !== q.answer);
    assert.equal(evaluateAnswer(q, wrong).correct, false);
  });
});

describe('calculateStars', () => {
  it('returns 1 star below two-star threshold', () => {
    assert.equal(calculateStars(0, GameConfig), 1);
    assert.equal(calculateStars(GameConfig.starThresholds.two - 1, GameConfig), 1);
  });

  it('returns 2 stars in the middle band', () => {
    assert.equal(calculateStars(GameConfig.starThresholds.two, GameConfig), 2);
    assert.equal(calculateStars(GameConfig.starThresholds.three - 1, GameConfig), 2);
  });

  it('returns 3 stars at or above three-star threshold', () => {
    assert.equal(calculateStars(GameConfig.starThresholds.three, GameConfig), 3);
    assert.equal(calculateStars(200, GameConfig), 3);
  });
});

// ── T017: applyWrongAnswer ────────────────────────────────────────────────

describe('applyWrongAnswer', () => {
  it('decrements lives by 1', () => {
    assert.equal(applyWrongAnswer(3).newLives, 2);
    assert.equal(applyWrongAnswer(2).newLives, 1);
  });

  it('returns isGameOver: true when lives reach 0', () => {
    const result = applyWrongAnswer(1);
    assert.equal(result.newLives, 0);
    assert.equal(result.isGameOver, true);
  });

  it('returns isGameOver: false while lives remain', () => {
    assert.equal(applyWrongAnswer(3).isGameOver, false);
    assert.equal(applyWrongAnswer(2).isGameOver, false);
  });
});

// ── T028: applyTimerBonus ────────────────────────────────────────────────

describe('applyTimerBonus', () => {
  it('awards timerBonusPts when full time remains (timerTicks=150)', () => {
    const r = applyTimerBonus(150, GameConfig);
    assert.equal(r.bonusPts, GameConfig.timerBonusPts);
  });

  it('awards timerBonusPts when timerTicks=71 (just above threshold)', () => {
    const r = applyTimerBonus(71, GameConfig);
    assert.equal(r.bonusPts, GameConfig.timerBonusPts);
  });

  it('awards 0 pts when timerTicks=70 (at boundary, not within threshold)', () => {
    const r = applyTimerBonus(70, GameConfig);
    assert.equal(r.bonusPts, 0);
  });

  it('awards 0 pts when timerTicks=0 (timer fully expired)', () => {
    const r = applyTimerBonus(0, GameConfig);
    assert.equal(r.bonusPts, 0);
  });
});

// ── T020: updateStreak ────────────────────────────────────────────────────

describe('updateStreak', () => {
  it('correct answer below threshold awards basePts', () => {
    const r = updateStreak(0, true, GameConfig);
    assert.equal(r.pts, GameConfig.basePts);
    assert.equal(r.newStreak, 1);
  });

  it('correct answer at threshold awards streakPts', () => {
    const r = updateStreak(GameConfig.streakThreshold - 1, true, GameConfig);
    assert.equal(r.pts, GameConfig.streakPts);
    assert.equal(r.newStreak, GameConfig.streakThreshold);
  });

  it('correct answer above threshold awards streakPts', () => {
    const r = updateStreak(GameConfig.streakThreshold + 2, true, GameConfig);
    assert.equal(r.pts, GameConfig.streakPts);
  });

  it('wrong answer resets streak to 0 and awards 0 pts', () => {
    const r = updateStreak(5, false, GameConfig);
    assert.equal(r.newStreak, 0);
    assert.equal(r.pts, 0);
  });
});

// ── Practice Mode: PracticeRanges ────────────────────────────────────────

describe('PracticeRanges', () => {
  it('hard tier add ranges equal GameConfig.numberRanges.add', () => {
    assert.deepEqual(PracticeRanges.hard.add, GameConfig.numberRanges.add);
  });

  it('hard tier mul ranges equal GameConfig.numberRanges.mul', () => {
    assert.deepEqual(PracticeRanges.hard.mul, GameConfig.numberRanges.mul);
  });
});

// ── Practice Mode: ENCOURAGING_MESSAGES ─────────────────────────────────

describe('ENCOURAGING_MESSAGES', () => {
  it('array has at least 1 entry', () => {
    assert.ok(ENCOURAGING_MESSAGES.length >= 1);
  });

  it('all entries are non-empty strings', () => {
    for (const msg of ENCOURAGING_MESSAGES) {
      assert.equal(typeof msg, 'string');
      assert.ok(msg.length > 0, `empty message found`);
    }
  });
});

// ── Practice Mode: getPracticeConfig ─────────────────────────────────────

describe('getPracticeConfig', () => {
  it('returns config with correct numberRanges for easy/add', () => {
    const cfg = getPracticeConfig('add', 'easy');
    assert.deepEqual(cfg.numberRanges.add, PracticeRanges.easy.add);
  });

  it('returns config with correct numberRanges for hard/mul', () => {
    const cfg = getPracticeConfig('mul', 'hard');
    assert.deepEqual(cfg.numberRanges.mul, PracticeRanges.hard.mul);
  });

  it('hard/add ranges match GameConfig.numberRanges.add', () => {
    const cfg = getPracticeConfig('add', 'hard');
    assert.deepEqual(cfg.numberRanges.add, GameConfig.numberRanges.add);
  });
});

// ── Practice Mode: generateQuestion bMax constraint ──────────────────────

describe('generateQuestion with bMax constraint', () => {
  it('add: b never exceeds bMax when bMax is set', () => {
    const cfg = getPracticeConfig('add', 'easy'); // bMax: 10
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion('add', cfg, 0);
      assert.ok(q.b <= cfg.numberRanges.add.bMax, `b=${q.b} > bMax=${cfg.numberRanges.add.bMax}`);
    }
  });

  it('sub: b never exceeds bMax when bMax is set', () => {
    const cfg = getPracticeConfig('sub', 'easy'); // bMax: 9
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion('sub', cfg, 0);
      assert.ok(q.b <= cfg.numberRanges.sub.bMax, `b=${q.b} > bMax=${cfg.numberRanges.sub.bMax}`);
    }
  });

  it('existing add behavior unchanged when bMax is null', () => {
    // Hard add has bMax: null — should still produce valid answers <= 100
    const cfg = getPracticeConfig('add', 'hard');
    assert.equal(cfg.numberRanges.add.bMax, null);
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('add', cfg, 0);
      assert.ok(q.answer <= 100, `answer ${q.answer} > 100`);
      assert.ok(q.answer > 0);
    }
  });

  it('existing sub behavior unchanged when bMax is null', () => {
    const cfg = getPracticeConfig('sub', 'hard');
    assert.equal(cfg.numberRanges.sub.bMax, null);
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('sub', cfg, 0);
      assert.ok(q.answer > 0, `non-positive: ${q.answer}`);
      assert.ok(q.answer <= 100);
    }
  });
});

// ── Practice Mode: generateQuestion div aMax constraint ──────────────────

describe('generateQuestion div aMax constraint', () => {
  it('div: quotient never exceeds Math.floor(aMax / b) when aMax is set', () => {
    // Easy div: aMax=50, so max divisible dividend ≤ 50, quotient ≤ floor(50/bMin)
    const cfg = getPracticeConfig('div', 'easy'); // aMax: 50, bMin:2, bMax:5
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion('div', cfg, 0);
      assert.ok(q.a <= cfg.numberRanges.div.aMax,
        `dividend a=${q.a} exceeds aMax=${cfg.numberRanges.div.aMax}`);
    }
  });
});

// ── Adjustable Timer: TIMER_OPTIONS ──────────────────────────────────────

describe('TIMER_OPTIONS', () => {
  it('has exactly 6 entries', () => {
    assert.equal(TIMER_OPTIONS.length, 6);
  });

  it('index 2 has seconds === 15 (the default)', () => {
    assert.equal(TIMER_OPTIONS[2].seconds, 15);
  });

  it('entries are ordered ascending by seconds', () => {
    for (let i = 1; i < TIMER_OPTIONS.length; i++) {
      assert.ok(
        TIMER_OPTIONS[i].seconds > TIMER_OPTIONS[i - 1].seconds,
        `index ${i}: ${TIMER_OPTIONS[i].seconds} not > ${TIMER_OPTIONS[i - 1].seconds}`,
      );
    }
  });

  it('all entries have non-empty label strings', () => {
    for (const opt of TIMER_OPTIONS) {
      assert.equal(typeof opt.label, 'string');
      assert.ok(opt.label.length > 0, `empty label at seconds=${opt.seconds}`);
    }
  });
});

// ── Adjustable Timer: getGameConfigForTimer ───────────────────────────────

describe('getGameConfigForTimer', () => {
  it('returns config with timerSeconds matching input', () => {
    for (const opt of TIMER_OPTIONS) {
      const cfg = getGameConfigForTimer(opt.seconds);
      assert.equal(cfg.timerSeconds, opt.seconds);
    }
  });

  it('timerBonusThreshold === Math.floor(seconds * 0.5) for all 6 values', () => {
    for (const opt of TIMER_OPTIONS) {
      const cfg = getGameConfigForTimer(opt.seconds);
      assert.equal(cfg.timerBonusThreshold, Math.floor(opt.seconds * 0.5));
    }
  });

  it('all other GameConfig fields are unchanged', () => {
    const cfg = getGameConfigForTimer(10);
    assert.equal(cfg.totalQuestions,      GameConfig.totalQuestions);
    assert.equal(cfg.basePts,             GameConfig.basePts);
    assert.equal(cfg.streakPts,           GameConfig.streakPts);
    assert.equal(cfg.streakThreshold,     GameConfig.streakThreshold);
    assert.deepEqual(cfg.starThresholds,  GameConfig.starThresholds);
    assert.deepEqual(cfg.operations,      GameConfig.operations);
    assert.deepEqual(cfg.numberRanges,    GameConfig.numberRanges);
  });

  it('applyTimerBonus works correctly with getGameConfigForTimer(5)', () => {
    const cfg = getGameConfigForTimer(5); // threshold = 2s → ticks boundary = (5-2)*10 = 30
    assert.equal(applyTimerBonus(31, cfg).bonusPts, GameConfig.timerBonusPts); // > 30 → bonus
    assert.equal(applyTimerBonus(30, cfg).bonusPts, 0);                        // = 30 → no bonus
  });

  it('applyTimerBonus works correctly with getGameConfigForTimer(30)', () => {
    const cfg = getGameConfigForTimer(30); // threshold = 15s → ticks boundary = (30-15)*10 = 150
    assert.equal(applyTimerBonus(151, cfg).bonusPts, GameConfig.timerBonusPts);
    assert.equal(applyTimerBonus(150, cfg).bonusPts, 0);
  });
});

// ── Adjustable Timer: getTimerPreference ─────────────────────────────────

describe('getTimerPreference', () => {
  it('returns 15 when localStorage is empty', () => {
    globalThis.localStorage = { getItem: () => null };
    assert.equal(getTimerPreference(), 15);
    delete globalThis.localStorage;
  });

  it('returns saved value when a valid seconds value is stored', () => {
    globalThis.localStorage = { getItem: () => '20' };
    assert.equal(getTimerPreference(), 20);
    delete globalThis.localStorage;
  });

  it('returns 15 for an invalid stored value (not in TIMER_OPTIONS)', () => {
    globalThis.localStorage = { getItem: () => '99' };
    assert.equal(getTimerPreference(), 15);
    delete globalThis.localStorage;
  });

  it('returns 15 for a non-numeric stored value', () => {
    globalThis.localStorage = { getItem: () => 'abc' };
    assert.equal(getTimerPreference(), 15);
    delete globalThis.localStorage;
  });
});

// ── Practice Mode: getAccuracyTier ───────────────────────────────────────

describe('Practice accuracy tier', () => {
  it('100% accuracy → master tier', () => {
    assert.equal(getAccuracyTier(10, 10), 'master');
  });

  it('90% accuracy → master tier', () => {
    assert.equal(getAccuracyTier(10, 9), 'master');
  });

  it('89% accuracy → amazing tier', () => {
    // 89 of 100 = 89%
    assert.equal(getAccuracyTier(100, 89), 'amazing');
  });

  it('70% accuracy → amazing tier', () => {
    assert.equal(getAccuracyTier(10, 7), 'amazing');
  });

  it('69% accuracy → good tier', () => {
    assert.equal(getAccuracyTier(100, 69), 'good');
  });

  it('50% accuracy → good tier', () => {
    assert.equal(getAccuracyTier(10, 5), 'good');
  });

  it('49% accuracy → keep-going tier', () => {
    assert.equal(getAccuracyTier(100, 49), 'keep-going');
  });

  it('0 answered → 0% accuracy → keep-going tier', () => {
    assert.equal(getAccuracyTier(0, 0), 'keep-going');
  });
});
