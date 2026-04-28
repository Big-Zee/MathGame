export const GameConfig = {
  totalQuestions: 10,
  timerSeconds: 10,
  basePts: 10,
  streakPts: 15,
  streakThreshold: 3,
  starThresholds: { two: 70, three: 130 },
  operations: ['add', 'sub', 'mul', 'div'],
  numberRanges: {
    add: { aMin: 1,  aMax: 99, bMin: 1, bMax: 99 },
    sub: { aMin: 10, aMax: 99, bMin: 1, bMax: null },
    mul: { aMin: 2,  aMax: 12, bMin: 2, bMax: 12 },
    div: { aMin: 4,  aMax: 144, bMin: 2, bMax: 12 },
  },
};

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

function maxAnswerFor(operation, config) {
  const r = config.numberRanges[operation];
  if (operation === 'add') return r.aMax + r.bMax;
  if (operation === 'sub') return r.aMax - 1;
  if (operation === 'mul') return r.aMax * r.bMax;
  return 12; // div: max quotient
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
      b = randInt(r.bMin, r.bMax);
      answer = a + b;
      break;
    case 'sub':
      a = randInt(r.aMin, r.aMax);
      b = randInt(r.bMin, a - 1);
      answer = a - b;
      break;
    case 'mul':
      a = randInt(r.aMin, r.aMax);
      b = randInt(r.bMin, r.bMax);
      answer = a * b;
      break;
    case 'div': {
      b = randInt(r.bMin, r.bMax);
      const quotient = randInt(1, 12);
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

export function getHighScore() {
  const n = parseInt(globalThis.localStorage?.getItem('mathgame_highscore'), 10);
  return Number.isFinite(n) ? n : 0;
}

export function setHighScore(score) {
  globalThis.localStorage?.setItem('mathgame_highscore', String(score));
}
