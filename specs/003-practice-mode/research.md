# Research: Practice Mode

**Branch**: `003-practice-mode` | **Date**: 2026-04-29
**Plan**: [plan.md](./plan.md)

---

## Decision 1: Difficulty Level Ranges

**Decision**: Three-tier operand ranges (Easy / Medium / Hard) stored in a new `PracticeRanges`
exported constant in `js/math-engine.js`. Hard tier is identical to the main game's
`GameConfig.numberRanges`, providing a natural difficulty bridge from practice to the timed quiz.

| Difficulty | add | sub | mul | div |
|------------|-----|-----|-----|-----|
| Easy | a,b ∈ [1,10]; sum ≤ 20 | a ∈ [2,20], b ≤ min(9, a−1) | a ∈ [2,10], b ∈ [2,5] (2–5× tables) | b ∈ [2,5] |
| Medium | a ∈ [1,50], b ≤ min(49, 100−a) | a ∈ [5,50], b ≤ min(44, a−1) | a,b ∈ [2,10] | b ∈ [2,10] |
| Hard | a ∈ [1,99], b ≤ 100−a | a ∈ [10,99], b ≤ a−1 | a,b ∈ [2,12] (product ≤ 100) | b ∈ [2,12] |

**Pool size check** (minimum unique ordered question keys per combination):

| Tier | Add | Sub | Mul | Div |
|------|-----|-----|-----|-----|
| Easy | ~100 | ~144 | **36** | ~128 |
| Medium | ~2500 | ~1225 | ~81 | ~550 |
| Hard | ~4950 | ~4851 | ~95 | ~528 |

Easy Multiplication is the smallest pool (4×9 = 36 unique pairs for a ∈ [2,10], b ∈ [2,5]).
Normal practice sessions are unlikely to exceed this, and the deduplication fallback handles
exhaustion gracefully (Decision 3).

**Rationale**: The main game has no difficulty levels; Practice Mode introduces them from scratch.
Hard exactly mirrors `GameConfig.numberRanges`, so a child who masters Hard practice is
working with identical question ranges to the timed quiz. Easy targets grade 3 expectations
(small operands, 2–5 times tables). Medium bridges grades 3–4 with mid-range arithmetic.

**Alternatives considered**:
- Using main game ranges for all tiers — no gradation; defeats the purpose of difficulty
  selection and would overwhelm children choosing "Easy."
- Adaptive difficulty (real-time adjustment by performance) — out of scope; requires
  performance tracking infrastructure not in this feature.

---

## Decision 2: Backward-Compatible `generateQuestion` Amendment

**Decision**: Amend `generateQuestion()` to respect `r.bMax` when non-null for the `add` and
`sub` cases. Both currently hardcode the upper bound for `b`:

```js
// BEFORE
add: b = randInt(r.bMin, 100 - a)
sub: b = randInt(r.bMin, a - 1)

// AFTER (backward-compatible)
add: b = randInt(r.bMin, Math.min(r.bMax ?? Infinity, 100 - a))
sub: b = randInt(r.bMin, Math.min(r.bMax ?? Infinity, a - 1))
```

The main game config has `bMax: null` for both operations. `null ?? Infinity` evaluates to
`Infinity`, so `Math.min(Infinity, 100-a)` = `100-a` — **the main game's behavior is
byte-for-byte identical to today.**

**Rationale**: Practice Mode Easy/Medium configs need upper caps on `b` for `add` and `sub` to
keep numbers grade-appropriate (e.g., Easy add should produce sums ≤ 20, not ≤ 110). Duplicating
the generator is explicitly prohibited by the user constraint; a two-line null-coalescing guard
achieves reuse without risk.

**Test required before implementing**: A new test asserts that a `generateQuestion('add', ...)` 
call with `bMax: 5` never returns a question where `b > 5`.

**Alternatives considered**:
- Post-generation rejection loop (generate, test, retry) — can loop infinitely if aMax is above
  target; harder to test deterministically.
- Separate `generatePracticeQuestion()` function — duplicates substantial logic; prohibited.

---

## Decision 3: Question Deduplication

**Decision**: Track shown questions in a `Set<string>` of canonical keys `"a-op-b"`
(e.g., `"7-add-3"`). When generating the next question, call `generateQuestion()` up to
**50 attempts**; use the first result whose key is not in the Set. If 50 attempts all collide
(pool exhausted), use the last generated question — a silent repeat rather than an infinite
loop or a disruptive "all done!" screen.

Key added to Set: `` `${q.a}-${q.operation}-${q.b}` ``
Set is stored on `practiceSession.seenKeys`; discarded when session ends or "Practise Again" fires.

**Rationale**: The spec requires "never repeat within the same session" (FR-016). For most
combinations the pool is large enough to never exhaust. The 50-attempt guard is a safety
valve for Easy Multiplication (pool = 36). Silent repeats keep child flow uninterrupted —
a "congratulations, you've seen every question!" banner would be confusing and off-brand.

**Alternatives considered**:
- Pre-generate all questions upfront — requires knowing pool size; large pools (Hard Add ~4950)
  would over-allocate; lazy generation with a Set is simpler and more memory-efficient.
- Show an "all done!" message — interrupts flow; spec says the session runs until the child
  chooses to stop; this decision contradicts the spec.

---

## Decision 4: Streak Reset on Wrong Answer

**Decision**: The practice correct-answer streak resets to 0 on a wrong answer, identical to
the main game's `updateStreak()` behavior. `practiceSession.currentStreak` tracks the running
count; `practiceSession.bestStreak` is updated whenever `currentStreak` exceeds it. The summary
shows `bestStreak` — so resets do not erase the child's peak achievement.

**Reuse**: `updateStreak(streak, correct, GameConfig)` is called directly; `pts` return value
is discarded (Practice Mode has no score).

**Rationale**: A streak counts consecutive correct answers; a wrong answer factually breaks the
sequence. Resetting is informational, not a penalty (no lives lost, no score deducted). Using
the existing `updateStreak()` avoids duplicating reset logic and ensures consistent behavior
across both modes.

**Alternatives considered**:
- Freeze streak (don't reset on wrong) — misrepresents the learning signal; makes "current
  streak" meaningless since it can only go up.
- No streak in Practice Mode — the spec explicitly requests it (User Story 7, FR-010).

---

## Decision 5: Encouraging Messages as Shared Export

**Decision**: Export `ENCOURAGING_MESSAGES` — an array of 8 positive feedback strings — from
`js/math-engine.js`. Practice Mode picks one at random (`Math.floor(Math.random() * ...)`) on
each correct answer. The main game's `showFeedback()` keeps its existing hard-coded
`'🎉 Correct!'` string unchanged (no modification to existing logic).

```js
export const ENCOURAGING_MESSAGES = [
  '🎉 Brilliant!', '⭐ Excellent!', '🌟 You got it!',
  '💪 Amazing!',  '🔥 Correct!',  '👏 Well done!',
  '✅ Perfect!',   '🚀 Spot on!',
];
```

**Rationale**: The user constraint says "reuse existing feedback message arrays." The main game
currently has no arrays — messages are inline strings. This decision establishes the canonical
array once in the engine module. Practice Mode is the first consumer; the main game can migrate
to it in a future polish pass without any API change.

**Alternatives considered**:
- Define messages inline in practice mode JS — fine for now but duplicates if main game later
  adopts them; the engine is the logical home for game content.
- Modify `showFeedback()` to use the array now — changes existing game logic (prohibited).

---

## Decision 6: Practice Mode State Isolation

**Decision**: All practice state lives in a standalone `let practiceSession = null` variable,
declared below the main game's `session` variable in the inline `<script>`. Neither variable
ever reads from the other. The `showScreen()` DOM utility is reused as-is (it has no state
dependency). Nothing from a practice session is written to `localStorage`.

```js
// Existing (untouched)
let session = null;

// New (appended below)
let practiceSession = null;
```

**Rationale**: FR-021 mandates complete isolation. A separate variable with separate functions
is the simplest, safest guarantor. `showScreen()` is a pure DOM helper — reusing it adds zero
coupling risk.

**Alternatives considered**:
- Unified state object with a `mode` flag — creates shared state that both modes can
  accidentally access; a future bug in one mode risks breaking the other.

---

## Decision 7: `getPracticeConfig` Helper

**Decision**: Export `getPracticeConfig(operation, difficulty)` from `js/math-engine.js`.
Returns a config object suitable for `generateQuestion()`:

```js
export function getPracticeConfig(operation, difficulty) {
  return {
    ...GameConfig,
    numberRanges: { [operation]: PracticeRanges[difficulty][operation] },
  };
}
```

`generateQuestion(operation, config, id)` only reads `config.numberRanges[operation]`, so
spreading `GameConfig` and overriding only the relevant operation range is sufficient. The
`id` parameter is set to 0 for all practice questions (order within session is irrelevant).

**Rationale**: Isolates the config composition logic into a testable pure function. Practice
mode JS calls `getPracticeConfig(op, diff)` once per session and reuses the result until
"Practise Again" restarts with (potentially different) settings.

**Alternatives considered**:
- Inline config construction in practice mode JS — works but un-testable without a browser.
- Store pre-built config objects for all 12 combinations (4 ops × 3 diffs) — inflexible;
  `getPracticeConfig` is computed at call time and trivially verified by unit test.
