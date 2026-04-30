export const TIMER_OPTIONS = [
  { seconds: 5,  label: 'Super Speed! ⚡' },
  { seconds: 10, label: 'Fast! 🚀'         },
  { seconds: 15, label: 'Normal 🎯'         },
  { seconds: 20, label: 'Relaxed 😊'        },
  { seconds: 25, label: 'Easy Going 🌈'     },
  { seconds: 30, label: 'Take Your Time 🐢' },
];

export const PracticeRanges = {
  easy: {
    add: { aMin: 1,  aMax: 10,  bMin: 1, bMax: 10  },
    sub: { aMin: 2,  aMax: 20,  bMin: 1, bMax: 9   },
    mul: { aMin: 2,  aMax: 10,  bMin: 2, bMax: 5   },
    div: { aMin: 4,  aMax: 50,  bMin: 2, bMax: 5   },
  },
  medium: {
    add: { aMin: 1,  aMax: 50,  bMin: 1, bMax: 49  },
    sub: { aMin: 5,  aMax: 50,  bMin: 1, bMax: 44  },
    mul: { aMin: 2,  aMax: 10,  bMin: 2, bMax: 10  },
    div: { aMin: 4,  aMax: 100, bMin: 2, bMax: 10  },
  },
  hard: {
    add: { aMin: 1,  aMax: 99,  bMin: 1, bMax: null },
    sub: { aMin: 10, aMax: 99,  bMin: 1, bMax: null },
    mul: { aMin: 2,  aMax: 12,  bMin: 2, bMax: 12  },
    div: { aMin: 4,  aMax: 100, bMin: 2, bMax: 12  },
  },
};

export const ENCOURAGING_MESSAGES = [
  '🎉 Brilliant!', '⭐ Excellent!', '🌟 You got it!',
  '💪 Amazing!',   '🔥 Correct!',  '👏 Well done!',
  '✅ Perfect!',   '🚀 Spot on!',
];

export const GameConfig = {
  totalQuestions: 10,
  timerSeconds: 15,
  timerBonusThreshold: 8,
  timerBonusPts: 5,
  basePts: 10,
  streakPts: 15,
  streakThreshold: 3,
  starThresholds: { two: 70, three: 130 },
  operations: ['add', 'sub', 'mul', 'div'],
  numberRanges: {
    add: { aMin: 1,  aMax: 99, bMin: 1, bMax: null },
    sub: { aMin: 10, aMax: 99, bMin: 1, bMax: null },
    mul: { aMin: 2,  aMax: 12, bMin: 2, bMax: 12 },
    div: { aMin: 4,  aMax: 100, bMin: 2, bMax: 12 },
  },
};

export function getPracticeConfig(operation, difficulty) {
  return {
    ...GameConfig,
    numberRanges: PracticeRanges[difficulty],
  };
}

export function getGameConfigForTimer(seconds) {
  return {
    ...GameConfig,
    timerSeconds:         seconds,
    timerBonusThreshold:  Math.floor(seconds * 0.5),
  };
}

export function getTimerPreference() {
  const raw = globalThis.localStorage?.getItem('mathblaster_timer_preference');
  const n = parseInt(raw, 10);
  return TIMER_OPTIONS.some(o => o.seconds === n) ? n : 15;
}

export function setTimerPreference(seconds) {
  globalThis.localStorage?.setItem('mathblaster_timer_preference', String(seconds));
}

export function getAccuracyTier(totalAnswered, totalCorrect) {
  const pct = totalAnswered === 0 ? 0 : Math.round(totalCorrect / totalAnswered * 100);
  if (pct >= 90) return 'master';
  if (pct >= 70) return 'amazing';
  if (pct >= 50) return 'good';
  return 'keep-going';
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function maxAnswerFor(_operation, _config) {
  return 100;
}

export function buildChoices(answer, operation, config) {
  const ceiling = maxAnswerFor(operation, config);
  const raw = [
    answer + 1, answer - 1,
    answer + 2, answer - 2,
    answer + 3, answer - 3,
    answer + 5, answer - 5,
    answer + 10, answer - 10,
    answer + 11, answer - 11,
  ];
  const pool = [
    ...new Set(raw.filter(n => n > 0 && n !== answer && n <= ceiling + 15)),
  ];

  let pad = 1;
  while (pool.length < 3) {
    if (pad !== answer && !pool.includes(pad)) pool.push(pad);
    pad++;
  }

  return shuffle([answer, ...pool.slice(0, 3)]);
}

export function generateQuestion(operation, config, id) {
  const r = config.numberRanges[operation];
  let a, b, answer;

  switch (operation) {
    case 'add':
      a = randInt(r.aMin, r.aMax);
      b = randInt(r.bMin, Math.min(r.bMax ?? Infinity, 100 - a));
      answer = a + b;
      break;
    case 'sub':
      a = randInt(r.aMin, r.aMax);
      b = randInt(r.bMin, Math.min(r.bMax ?? Infinity, a - 1));
      answer = a - b;
      break;
    case 'mul':
      b = randInt(r.bMin, r.bMax);
      a = randInt(r.aMin, Math.floor(100 / b));
      answer = a * b;
      break;
    case 'div': {
      b = randInt(r.bMin, r.bMax);
      const maxQuotient = Math.min(Math.floor(100 / b), Math.floor(r.aMax / b));
      const quotient = randInt(1, maxQuotient);
      a = b * quotient;
      answer = quotient;
      break;
    }
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  const symbol = { add: '+', sub: '−', mul: '×', div: '÷' }[operation];
  return { id, operation, symbol, a, b, answer, choices: buildChoices(answer, operation, config) };
}

export function generateRound(config) {
  const guaranteed = shuffle([...config.operations]);
  const extra = config.totalQuestions - config.operations.length;
  const filler = Array.from({ length: extra }, () =>
    config.operations[Math.floor(Math.random() * config.operations.length)],
  );
  return shuffle([...guaranteed, ...filler]).map((op, i) => generateQuestion(op, config, i));
}

export function evaluateAnswer(question, selectedChoice) {
  return { correct: selectedChoice === question.answer };
}

export function calculateStars(score, config) {
  if (score >= config.starThresholds.three) return 3;
  if (score >= config.starThresholds.two) return 2;
  return 1;
}

export function updateStreak(streak, correct, config) {
  if (!correct) return { newStreak: 0, pts: 0 };
  const newStreak = streak + 1;
  const pts = newStreak >= config.streakThreshold ? config.streakPts : config.basePts;
  return { newStreak, pts };
}

export function applyWrongAnswer(lives) {
  const newLives = lives - 1;
  return { newLives, isGameOver: newLives <= 0 };
}

export function applyTimerBonus(timerTicks, config) {
  const bonusThresholdTicks = (config.timerSeconds - config.timerBonusThreshold) * 10;
  return { bonusPts: timerTicks > bonusThresholdTicks ? config.timerBonusPts : 0 };
}

export function getHighScore() {
  const n = parseInt(globalThis.localStorage?.getItem('mathgame_highscore'), 10);
  return Number.isFinite(n) ? n : 0;
}

export function setHighScore(score) {
  globalThis.localStorage?.setItem('mathgame_highscore', String(score));
}

export function calculateEarlyStopStars(totalAnswered, totalCorrect) {
  if (totalAnswered === 0) return 0;
  const pct = Math.round(totalCorrect / totalAnswered * 100);
  if (pct >= 80) return 3;
  if (pct >= 50) return 2;
  return 1;
}

export function getEarlyStopMessage(totalAnswered, totalCorrect) {
  if (totalAnswered === 0) return "You didn't answer any questions yet — give it a go! 😊";
  const pct = Math.round(totalCorrect / totalAnswered * 100);
  if (pct >= 80) return 'Brilliant effort, you were on fire! 🔥';
  if (pct >= 50) return 'Great session, keep building on this! 💪';
  return 'Every question counts, well done for trying! 🧠';
}

export function getEarlyStopFlag() {
  return globalThis.localStorage?.getItem('mathgame_highscore_early') === '1';
}

export function setEarlyStopFlag() {
  globalThis.localStorage?.setItem('mathgame_highscore_early', '1');
}

export function clearEarlyStopFlag() {
  globalThis.localStorage?.removeItem('mathgame_highscore_early');
}
