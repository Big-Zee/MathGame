# Research: Math Quiz Game

**Branch**: `001-math-quiz-game` | **Date**: 2026-04-28 | **Amended**: 2026-04-28
**Plan**: [plan.md](./plan.md)

## Decision 1: Timer Implementation

**Decision**: `setInterval` at 100ms tick, decrementing a `timerTicks` counter (integer 0–150
representing tenths of seconds for a 15-second countdown). An 8-second bonus window is tracked
by comparing `timerTicks > 70` (i.e., more than 7.0 s elapsed = answered within the first 8 s).

**Rationale**: A 100ms interval is precise enough for a 15-second countdown to look smooth
(±100ms error is imperceptible to children). The bonus threshold (8 s) maps cleanly to
`timerTicks > 70` (150 − 80 = 70 remaining ticks). `requestAnimationFrame` adds unnecessary
complexity for a countdown that only needs to update every 100ms. `setInterval` is simpler,
well-supported, and sufficient.

**Timer bonus logic**: When the player answers correctly and `timerTicks > 70`, `applyTimerBonus`
returns `+5`. This is a pure function testable in Node without DOM.

**Alternatives considered**:
- `requestAnimationFrame` + `Date.now()` delta — more accurate but overkill for a 15s countdown;
  no perceptible difference for the target audience.
- `setTimeout` recursive — same accuracy as setInterval but more code; no advantage here.
- Storing a `Date.now()` snapshot at question start and diffing on answer — works but introduces
  a dependency on wall-clock time; tick counting is simpler to test.

---

## Decision 2: Azure Static Web Apps Configuration

**Decision**: Provide a `staticwebapp.config.json` at repo root with `navigationFallback`
pointing to `/index.html` and no platform API runtime.

**Rationale**: Azure SWA free tier supports static hosting with no server-side code. The config
file enables deep-link support (not strictly needed for a single-screen app but good practice)
and sets correct cache-control headers for `index.html` (no-cache) vs. `js/` assets
(immutable when versioned).

**Key config shape**:
```json
{
  "navigationFallback": { "rewrite": "/index.html" },
  "mimeTypes": { ".js": "text/javascript" },
  "globalHeaders": {
    "Cache-Control": "no-cache, no-store"
  }
}
```

**Alternatives considered**:
- No config file — works but loses cache-control and fallback routing.
- Azure App Service — costs money; SWA free tier fully sufficient.

---

## Decision 3: Multiple-Choice Distractor Generation

**Decision**: Generate three wrong answer choices ("distractors") using offset-based mutation:
±1, ±2, ±a, ±b, and operation-neighbor strategies, filtered to ensure all four choices are
unique positive integers plausible for the number range.

**Rationale**: Distractors must be wrong but plausible — too-easy distractors (99, 1000) make
the game trivial. The offset strategy produces answers a 9–10 year old might genuinely
miscalculate (e.g., off-by-one errors, operand swaps).

**Algorithm sketch**:
1. Start with candidate pool: `[answer±1, answer±2, answer±3, answer±5, a, b, a+b, a-b, a*2]`
2. Remove duplicates and the correct answer
3. Remove negatives and values > 115 (out of plausible range; answers ≤ 100 + small offset headroom)
4. Shuffle and take 3
5. Combine with correct answer → shuffle all 4

**Alternatives considered**:
- Random integers in range — easy to generate non-plausible distractors (e.g., 79 for a single-
  digit multiplication answer of 12), reducing educational value.
- Common-mistake modeling (wrong operation result) — more realistic but harder to implement
  reliably for all four operations; deferred to v2.

---

## Decision 4: Testing Strategy

**Decision**: Node.js 18+ built-in test runner (`node --test`) for `js/math-engine.js` unit
tests. No test framework installed.

**Rationale**: The constitution mandates zero build tools and pure-module testability. Node 18+
ships a built-in `node:test` module and `assert` — no `npm install` required. This is the
lightest possible testing setup compatible with the no-framework constraint.

**Test file**: `tests/math-engine.test.js`
**Run command**: `node --test tests/math-engine.test.js`

**What is tested**:
- `generateQuestion()` returns a Question with correct answer and 4 unique choices
- `buildChoices()` always includes the correct answer
- `evaluateAnswer()` correctly identifies right/wrong
- `updateStreak()` activates at threshold, resets on wrong
- `calculateStars()` returns 1/2/3 for the defined thresholds
- Division questions always produce whole-number answers
- No choice array contains duplicates

**Alternatives considered**:
- Vitest / Jest — require npm install and (for Vitest) a build config; violates no-build-tools
  constraint.
- Browser-based test page — works but cannot run in CI without a headless browser; Node is
  simpler.

---

## Decision 5: WCAG 2.1 AA — Timer in a Game Context

**Decision**: The 15-second countdown timer is classified as an "essential" timing function
(WCAG 2.2.1 exception for essential timers in games/real-time events). No pause control is
required for v1. A pre-game notice informs players of the timer and the 8-second bonus window.

**Rationale**: WCAG 2.2.1 Timing Adjustable applies to time limits that are not "an essential
part of the activity." Competitive/educational timed games fall under the essential-timing
exception. The constitution requires WCAG 2.1 AA conformance; this exception is compliant.

**Mitigation**: The Start screen explicitly states "You have 15 seconds per question" so players
are not surprised. The timer bar is both color-coded AND uses a shrinking visual width (not
color alone), satisfying Principle III (color not the sole indicator). The 8-second bonus window
is communicated on the Start screen and indicated by a visual cue on the timer bar.

**Alternatives considered**:
- Providing a "no timer" accessibility mode — valid enhancement for v2; deferred.
- Keeping timer at 10 seconds — less thinking time for younger learners; 15 s better matches
  the target age per spec amendment.

---

## Decision 6: High-Score Persistence

**Decision**: Use `localStorage` to persist the player's all-time high score under the key
`mathgame_highscore`. No other data is persisted.

**Rationale**: Constitution Principle VI requires score state to be persistent across sessions.
`localStorage` is universally supported, requires zero server infrastructure, and aligns with
the static-only mandate. Storing only the high score (a single integer) raises no privacy
concerns.

**Key**: `mathgame_highscore` (integer string, fallback to `0` if absent or NaN)

**Alternatives considered**:
- `sessionStorage` — does not persist across page closes; violates constitution requirement.
- No persistence — violates Constitution Principle VI.
- User accounts / server storage — out of scope per spec assumptions (v1).

---

## Decision 7: ≤ 100 Result Cap — Generation Strategy

**Decision**: Enforce the ≤ 100 result constraint at question-generation time by constraining
the operand selection loop, not by post-generation rejection.

**Per-operation approach**:
- **Addition**: Pick `a` in [1, 99], then pick `b` in [1, 100 − a]. This guarantees `a + b ≤ 100`
  by construction with no retry needed.
- **Subtraction**: Already positive by design (b < a). Cap: pick `a` in [10, 99], `b` in
  [1, a − 1]. Maximum result is 98; ≤ 100 is automatically satisfied.
- **Multiplication**: Pick `b` in [2, 12], then pick `a` in [2, floor(100 / b)]. This ensures
  `a × b ≤ 100` and keeps operands in the 1–12 grade-appropriate range.
- **Division**: Pick divisor `b` in [2, 12], pick quotient `q` in [1, floor(100 / b)], set
  `a = b × q`. Result is `q ≤ 100` by construction.

**`GameConfig.numberRanges` changes**:
- `add.bMax`: no longer a fixed 99; computed as `100 - a` dynamically in `generateQuestion`.
- `mul.aMax`: no longer a fixed 12; computed as `Math.floor(100 / b)` dynamically.
- `div.aMax`: no longer a fixed 144; dividend is computed as `b × q` with `q ≤ floor(100/b)`.

**`buildChoices` ceiling update**: The ceiling passed to `buildChoices` changes from
`r.aMax + r.bMax` to `100` for all operations, ensuring distractors stay in the
post-cap plausible range.

**Rationale**: Constructive generation is always preferred over rejection sampling — it
produces results in O(1) without risk of infinite loops, and keeps `GameConfig` as the
authoritative source for range constraints. Updating the ranges in `generateQuestion` is
sufficient; the public API signatures of all exported functions remain unchanged.

**Alternatives considered**:
- Post-generation rejection (generate, test result > 100, retry) — simple but can loop
  infinitely for multiplication if config ranges are wide; harder to test deterministically.
- Hardcoded lookup tables for valid operand pairs — avoids runtime computation but inflexible
  and violates the "config as data" principle.
- Reducing `aMax`/`bMax` statically in `GameConfig` — too conservative (e.g., capping mul at
  9×9=81 excludes valid pairs like 4×25); dynamic computation is more accurate.
