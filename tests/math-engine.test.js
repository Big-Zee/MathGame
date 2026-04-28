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
