# Implementation Plan: Stop Session

**Branch**: `005-stop-session` | **Date**: 2026-04-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/005-stop-session/spec.md`

## Summary

Add a ⛔ Stop button to the main quiz game (`#screen-game` only) that lets a child end their session early via an in-page confirmation overlay. The overlay freezes the countdown timer by clearing the JS interval and preserving `session.timerTicks`; a new `resumeTimer()` restarts from the preserved value if the child chooses "Keep playing ▶️". On confirming stop, a dedicated `#screen-stop-summary` screen shows partial-session stats with an accuracy-based star rating. Early-stop scores are saved to the existing single high score on the same terms as a completed game; when the high score originates from an early stop, `#screen-start` appends a 🛑 indicator. Two new pure functions (`calculateEarlyStopStars`, `getEarlyStopMessage`) are added to `js/math-engine.js` with TDD. All other game flows — question generation, timer selector, Practice Mode, normal results — are unchanged.

---

## Technical Context

**Language/Version**: JavaScript ES6+ (vanilla)
**Primary Dependencies**: None (zero-dependency, no build step)
**Storage**: `localStorage` — existing keys `mathgame_highscore` + `mathblaster_timer_preference`; new key `mathgame_highscore_early`
**Testing**: Node.js built-in test runner (`node --test`); unit tests cover pure math-engine.js exports; no browser/DOM in tests
**Target Platform**: Browser (Chrome, Edge, Safari, Firefox) + Azure Static Web Apps free tier
**Project Type**: Static single-page application
**Performance Goals**: Overlay renders synchronously on click (< 1 animation frame, ~16ms); timer freeze is immediate (at most one additional 100ms tick after button press)
**Constraints**: No build step; only `index.html` and `js/math-engine.js` modified; no new source files; `.github/workflows/` untouched
**Scale/Scope**: ~30 new CSS lines, ~45 new HTML lines, ~120 new JS lines in `index.html`; 5 new exports in `js/math-engine.js`; N new test cases in `tests/math-engine.test.js`

---

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| No JS frameworks (Principle I stack) | ✅ PASS | Vanilla JS; `setInterval`/`clearInterval`; `localStorage`; `hidden` attribute |
| Azure SWA compatibility (Principle VII) | ✅ PASS | No build step; no new files in deployment path; `index.html` remains sole entry point |
| WCAG 2.1 AA (Principle III) | ✅ PASS | `#btn-stop-game` ≥ 44×44px; overlay uses `role="dialog"` `aria-modal="true"` `aria-labelledby`; Escape dismissal; focus to `#btn-keep-playing` on open, back to `#btn-stop-game` on close; new summary elements use `aria-live` and `role="img"` on stars |
| Deployment Integrity (Principle VII) | ✅ PASS | Only `index.html` and `js/math-engine.js` touched; `.github/workflows/` not touched; no `node_modules` |
| Test-First / TDD (Principle IV) | ✅ PASS | `calculateEarlyStopStars` and `getEarlyStopMessage` require failing tests before implementation; Red→Green order enforced in tasks |
| Kid-Friendly Design (Principle II) | ✅ PASS | All buttons ≥ 44×44px; plain language in overlay and summary messages; no hover-only affordances; `prefers-reduced-motion` already respected by existing CSS |

---

## Project Structure

### Documentation (this feature)

```text
specs/005-stop-session/
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code Changes

```text
index.html                      ← +CSS (~30 lines) + HTML (~45 lines) + JS (~120 lines)
js/math-engine.js               ← +5 new exports
tests/math-engine.test.js       ← +N new test cases (TDD)
```

No new source files. No changes to `staticwebapp.config.json`, `.github/workflows/`, `package.json`, or any file other than the three above.

---

## Implementation Design

### Phase A — New `js/math-engine.js` Exports (TDD)

Two new **pure** exports (unit-testable without a browser):

#### `calculateEarlyStopStars(totalAnswered, totalCorrect)` → `0 | 1 | 2 | 3`

```
if totalAnswered === 0  → return 0
pct = Math.round(totalCorrect / totalAnswered * 100)
pct >= 80 → 3  |  pct >= 50 → 2  |  otherwise → 1
```

Distinct from `calculateStars(score, config)` (score-based). Does not replace it.

#### `getEarlyStopMessage(totalAnswered, totalCorrect)` → `string`

```
if totalAnswered === 0  → "You didn't answer any questions yet — give it a go! 😊"
pct >= 80               → "Brilliant effort, you were on fire! 🔥"
pct >= 50               → "Great session, keep building on this! 💪"
otherwise               → "Every question counts, well done for trying! 🧠"
```

Three new **thin `localStorage` wrappers** (no unit tests; covered by round-trip integration in index.html):

#### `getEarlyStopFlag()` → `boolean`

```js
const raw = globalThis.localStorage?.getItem('mathgame_highscore_early');
return raw === '1';
```

#### `setEarlyStopFlag()` → `void`

```js
globalThis.localStorage?.setItem('mathgame_highscore_early', '1');
```

#### `clearEarlyStopFlag()` → `void`

```js
globalThis.localStorage?.removeItem('mathgame_highscore_early');
```

TDD order: write failing tests for `calculateEarlyStopStars` and `getEarlyStopMessage` **before** adding any implementation.

---

### Phase B — HTML Additions (`index.html`)

#### 1. CSS additions

```css
/* Stop button — positioned in top-right of game card */
#screen-game { position: relative; }
#btn-stop-game {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 0.85rem;
  padding: 6px 12px;
  min-width: 44px;
  min-height: 44px;
  z-index: 1;
}

/* Confirmation overlay */
.stop-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.stop-overlay-card {
  background: var(--clr-card);
  border-radius: var(--radius);
  padding: 24px 20px;
  max-width: 300px;
  width: 90%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}

.stop-overlay-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.stop-overlay-subtitle {
  color: var(--clr-muted);
  font-size: 0.95rem;
  margin-bottom: 20px;
}

.stop-overlay-card .btn { margin-top: 8px; }

/* Stop summary screen */
#screen-stop-summary .summary-stats { margin: 12px 0; }
#btn-stop-play-again { margin-top: 10px; }
```

#### 2. `#screen-game` additions

Add `#btn-stop-game` after the `<header>` element, immediately before `#question-counter`:

```html
<button id="btn-stop-game" class="btn-stop" aria-label="Stop game">⛔ Stop</button>
```

Add `#stop-confirm-overlay` as the last child of `<section id="screen-game">`:

```html
<div id="stop-confirm-overlay" class="stop-overlay" hidden
     role="dialog" aria-modal="true" aria-labelledby="stop-confirm-title">
  <div class="stop-overlay-card">
    <p id="stop-confirm-title" class="stop-overlay-title">Are you sure you want to stop? 🤔</p>
    <p class="stop-overlay-subtitle">Your progress so far will be shown.</p>
    <button class="btn btn-secondary" id="btn-keep-playing">Keep playing ▶️</button>
    <button class="btn btn-stop"      id="btn-confirm-stop">Yes, stop 🛑</button>
  </div>
</div>
```

#### 3. New `#screen-stop-summary` section

Insert after `</section><!-- ── RESULTS SCREEN ── -->`:

```html
<!-- ── STOP SUMMARY ── -->
<section id="screen-stop-summary" hidden>
  <h2>Session stopped early 🛑</h2>
  <div id="stop-stars-container" class="stars" role="img" aria-label="0 stars out of 3"></div>
  <div class="summary-stats">
    <p id="stop-questions-answered"></p>
    <p id="stop-correct"></p>
    <p id="stop-incorrect"></p>
    <p id="stop-accuracy"></p>
    <p id="stop-score"></p>
    <p id="stop-streak"></p>
    <p id="stop-hearts"></p>
  </div>
  <p id="stop-highscore"     class="result-highscore"></p>
  <p id="stop-new-highscore" class="result-new-highscore" hidden>🏆 New high score!</p>
  <p id="stop-message" class="summary-message" aria-live="off"></p>
  <button class="btn btn-primary"   id="btn-stop-main-menu">🏠 Main Menu</button>
  <button class="btn btn-secondary" id="btn-stop-play-again">🔄 Play Again</button>
</section>
```

---

### Phase C — JavaScript Additions (`index.html` inline module)

#### 1. Import additions

```js
import {
  // ... existing imports ...
  calculateEarlyStopStars,
  getEarlyStopMessage,
  getEarlyStopFlag,
  setEarlyStopFlag,
  clearEarlyStopFlag,
} from './js/math-engine.js';
```

#### 2. New module-level state

```js
let stopOverlayActive = false;
```

#### 3. `newSession()` amendment — add `bestStreak`

```js
function newSession(config) {
  return {
    score: 0,
    lives: 3,
    streak: 0,
    bestStreak: 0,          // ← NEW
    questionIndex: 0,
    correctAnswers: 0,
    questionsAnswered: 0,
    config,
    questions: generateRound(config),
    timerTicks: config.timerSeconds * 10,
    timerHandle: null,
    phase: 'question',
  };
}
```

#### 4. `showFeedback()` amendment — track `bestStreak`

After `session.streak = newStreak;`:

```js
if (session.streak > session.bestStreak) session.bestStreak = session.streak;
```

#### 5. `startTimer()` guard — prevents double-start during overlay

Add as the **first line** of `startTimer()`:

```js
if (stopOverlayActive) return;
```

#### 6. New `resumeTimer()` function

```js
function resumeTimer() {
  updateTimerBar();
  session.timerHandle = setInterval(() => {
    session.timerTicks--;
    updateTimerBar();
    if (session.timerTicks <= 0) {
      stopTimer();
      showFeedback(null, true);
    }
  }, 100);
}
```

#### 7. `showStopOverlay()`, `hideStopOverlay()`

```js
function showStopOverlay() {
  if (stopOverlayActive) return;          // double-tap guard
  stopOverlayActive = true;
  stopTimer();
  document.getElementById('stop-confirm-overlay').hidden = false;
  document.getElementById('btn-keep-playing').focus();
}

function hideStopOverlay() {
  stopOverlayActive = false;
  document.getElementById('stop-confirm-overlay').hidden = true;
  document.getElementById('btn-stop-game').focus();
  if (session.phase === 'question') resumeTimer();
  // feedback phase: timer was already stopped; leave it stopped
}
```

#### 8. `renderHighScore()` — extracted from inline init, flag-aware

```js
function renderHighScore() {
  const hs = getHighScore();
  const el = document.getElementById('start-highscore');
  if (hs > 0) {
    el.textContent = getEarlyStopFlag() ? `Best: ${hs} pts 🛑` : `Best: ${hs} pts`;
  } else {
    el.textContent = '';
  }
}
```

Replace the existing inline high-score init block with a call to `renderHighScore()`.

#### 9. `showResults()` amendment — clear 🛑 flag when completed game sets new high

```js
function showResults() {
  // ... existing code ...
  const prevHigh = getHighScore();
  const isNewHigh = session.score > prevHigh;
  if (isNewHigh) {
    setHighScore(session.score);
    clearEarlyStopFlag();               // ← NEW: completed game clears the 🛑 marker
  }
  renderHighScore();                    // ← NEW: refresh start screen
  // ... rest of existing code ...
}
```

#### 10. `showStopSummary()`

```js
function showStopSummary() {
  const { questionsAnswered, correctAnswers, score, lives, bestStreak, config } = session;
  const incorrect = questionsAnswered - correctAnswers;
  const pct = questionsAnswered === 0 ? 0 : Math.round(correctAnswers / questionsAnswered * 100);
  const stars = calculateEarlyStopStars(questionsAnswered, correctAnswers);

  // Star display
  const starsEl = document.getElementById('stop-stars-container');
  starsEl.setAttribute('aria-label', `${stars} stars out of 3`);
  starsEl.innerHTML = [0, 1, 2]
    .map(i => `<span aria-hidden="true">${i < stars ? '⭐' : '☆'}</span>`)
    .join('');

  // Stats
  document.getElementById('stop-questions-answered').textContent =
    `${questionsAnswered} of ${config.totalQuestions} questions answered`;
  document.getElementById('stop-correct').textContent   = `${correctAnswers} correct ✅`;
  document.getElementById('stop-incorrect').textContent = `${incorrect} incorrect ❌`;
  document.getElementById('stop-accuracy').textContent  = `${pct}% accuracy`;
  document.getElementById('stop-score').textContent     = `Score: ${score} pts`;
  document.getElementById('stop-streak').textContent    = `Best streak 🔥: ${bestStreak}`;
  document.getElementById('stop-hearts').textContent    =
    `Hearts remaining: ${'❤️'.repeat(lives)}${'🤍'.repeat(3 - lives)}`;

  // High score
  const prevHigh = getHighScore();
  const isNewHigh = questionsAnswered >= 1 && score > prevHigh;
  if (isNewHigh) {
    setHighScore(score);
    setEarlyStopFlag();
  }
  renderHighScore();
  document.getElementById('stop-highscore').textContent =
    `Best: ${isNewHigh ? score : prevHigh} pts`;
  document.getElementById('stop-new-highscore').hidden = !isNewHigh;

  // Message
  document.getElementById('stop-message').textContent =
    getEarlyStopMessage(questionsAnswered, correctAnswers);

  // Play Again button: hidden when 0 answered
  document.getElementById('btn-stop-play-again').hidden = questionsAnswered === 0;

  showScreen('screen-stop-summary');
  document.getElementById('btn-stop-main-menu').focus();
}
```

#### 11. New event listeners

```js
document.getElementById('btn-stop-game').addEventListener('click', showStopOverlay);

document.getElementById('btn-keep-playing').addEventListener('click', hideStopOverlay);

document.getElementById('btn-confirm-stop').addEventListener('click', () => {
  hideStopOverlay();
  showStopSummary();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && stopOverlayActive) hideStopOverlay();
});

document.getElementById('btn-stop-main-menu').addEventListener('click', () => {
  session = null;
  showScreen('screen-start');
  renderHighScore();
});

document.getElementById('btn-stop-play-again').addEventListener('click', () => {
  startGame(TIMER_OPTIONS[selectedTimerIndex]);
});
```

---

## Source Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `js/math-engine.js` | +5 exports | `calculateEarlyStopStars`, `getEarlyStopMessage`, `getEarlyStopFlag`, `setEarlyStopFlag`, `clearEarlyStopFlag` |
| `tests/math-engine.test.js` | +N tests | TDD for `calculateEarlyStopStars` (≥6 cases) and `getEarlyStopMessage` (≥5 cases) |
| `index.html` | CSS +~30 lines | `.stop-overlay`, `.stop-overlay-card`, `#btn-stop-game` positioning, `#screen-stop-summary` adjustments |
| `index.html` | HTML +~45 lines | `#btn-stop-game`, `#stop-confirm-overlay`, `#screen-stop-summary` |
| `index.html` | JS +~120 lines | `resumeTimer`, `showStopOverlay`, `hideStopOverlay`, `showStopSummary`, `renderHighScore`; amendments to `newSession`, `showFeedback`, `startTimer`, `showResults`; 6 new event listeners |

---

## Complexity Tracking

No constitution violations — no entries needed.
