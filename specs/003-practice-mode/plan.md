# Implementation Plan: Practice Mode

**Branch**: `003-practice-mode` | **Date**: 2026-04-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/003-practice-mode/spec.md`

## Summary

Practice Mode adds a pressure-free, operation-focused drill to Math Blaster. It introduces
four new `<section>` screens (operation selector, difficulty selector, practice session,
practice summary) within the existing `index.html`, a `PracticeRanges` data config and
`getPracticeConfig()` helper in `js/math-engine.js`, and a self-contained `practiceSession`
state object driven by new JS functions appended below the existing inline script.

**No existing game, results, or leaderboard logic is modified.** The `generateQuestion()`
function is reused directly with a single two-line backward-compatible amendment (Decision 2
in research.md); `updateStreak()` and `evaluateAnswer()` are reused as-is. Practice Mode Hard
difficulty mirrors `GameConfig.numberRanges` exactly, providing a smooth on-ramp to the
timed quiz.

## Technical Context

**Language/Version**: HTML5 + ES6+ JavaScript + CSS3 (unchanged from feature 001)
**Primary Dependencies**: None — zero new libraries or frameworks
**Storage**: None — practice sessions are fully in-memory; nothing written to `localStorage`
**Testing**: Node.js 18+ `node --test` for new `math-engine.js` exports; no browser required
**Target Platform**: Same modern evergreen browsers served by Azure SWA free tier
**Project Type**: Additive feature to existing single-page app; same screen-toggle architecture
**Performance Goals**: Feedback rendered within 100ms of answer submission; tally update within 100ms
**Constraints**: Zero build tools; WCAG 2.1 AA — zero known violations at ship; no `.github/workflows/` modifications; all Practice Mode state isolated from main `session` variable
**Scale/Scope**: Single player, single device, one mode active at a time; no server calls

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Learning-First | ✅ PASS | Practice Mode directly targets skill acquisition; no time pressure removes barriers for struggling learners; Easy → Medium → Hard difficulty tiers scale to learner level; Hard tier produces the same question distribution as the main game. |
| II. Kid-Friendly Design (9–10) | ✅ PASS | Text input and all buttons ≥ 44×44 CSS px; plain language throughout; "Stop Practising" always visible (never hidden or disabled); operation + difficulty label always on screen; no hover-only affordances. |
| III. Accessibility (WCAG 2.1 AA) | ✅ PASS | Text input has `<label for="practice-input">`; tally region uses `role="status"` + `aria-live="polite"`; correct heading hierarchy (h1 → h2) on all practice screens; keyboard path verified: Tab/Enter through all interactive elements. Accessibility audit task required in Polish phase. |
| IV. Test-First | ✅ PASS | New `math-engine.js` exports (`getPracticeConfig`, `PracticeRanges`, `ENCOURAGING_MESSAGES`) and the `generateQuestion` amendment each require a **failing test before implementation** (see quickstart.md for full test list). Accuracy-tier logic (`getAccuracyTier`) requires its own failing tests before implementation. |
| V. Incremental Delivery | ✅ PASS | 5 user stories (P1–P5) are each independently testable. P1 alone (entry flow + operation/difficulty selection) delivers navigable screens with no practice logic. Each subsequent story builds on the previous without breaking it. |
| VI. Immediate Feedback | ✅ PASS | Correct/wrong feedback rendered synchronously (<100ms) on every submit. Practice sessions are intentionally ephemeral (no persistence); this is not a violation because Constitution VI's persistence requirement applies to the main game's `PlayerResult` (high score in `localStorage`) — Practice Mode is explicitly a no-score mode per FR-020/FR-021. |
| VII. Deployment Integrity | ✅ PASS | Only `index.html` and `js/math-engine.js` are touched; no bundler, build step, or `.github/workflows/` changes. All additions are static HTML/CSS/JS deployed to Azure SWA unchanged. |
| Technical Standards | ✅ PASS | Vanilla HTML5/ES6+/CSS3; zero new dependencies; difficulty configuration is data-driven (`PracticeRanges` const object); all practice logic in a DOM-free-capable helper (`getPracticeConfig`) that is unit-testable in Node. |

*Post-Phase 1 re-check*: All gates still pass after design (see data-model.md and contracts/).

## Project Structure

### Documentation (this feature)

```text
specs/003-practice-mode/
├── plan.md                          # This file
├── research.md                      # Phase 0 output — 7 key decisions
├── data-model.md                    # Phase 1 output — entities + amendments
├── quickstart.md                    # Phase 1 output — manual + unit test guide
├── contracts/
│   ├── ui-state-machine.md          # Updated state machine (4 new screens)
│   └── math-engine-amendments.md   # Additive changes to math-engine.js API
└── tasks.md                         # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
index.html                  # + 4 new <section> elements (practice screens)
                            # + new CSS rules for practice UI (additive)
                            # + practice JS appended below existing event listeners

js/
└── math-engine.js          # + PracticeRanges (new export)
                            # + getPracticeConfig() (new export)
                            # + ENCOURAGING_MESSAGES (new export)
                            # ~ generateQuestion: 2-line bMax amendment (backward-compatible)

tests/
└── math-engine.test.js     # + ~18 new test cases for above exports and amendment
                            # (all existing tests unchanged and still passing)
```

**Structure Decision**: Strictly additive within the existing single-file architecture. No new
source files. The existing `session` variable and all main-game functions remain untouched.
A new `let practiceSession = null` variable and practice-specific functions are appended below
the last existing event listener in the inline `<script type="module">`.

## Complexity Tracking

> No constitution violations requiring justification.

---

## Phase 0: Research Summary

All NEEDS CLARIFICATION markers from the spec are resolved. See `research.md` for full
rationale. Key decisions in summary:

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Difficulty level ranges (FR-004 gap) | Three tiers defined; Hard = main game ranges |
| 2 | `generateQuestion` amendment | 2-line bMax null-coalescing guard; fully backward-compatible |
| 3 | Question deduplication | Set of canonical keys; 50-attempt loop with silent-repeat fallback |
| 4 | Streak reset on wrong answer | Resets to 0 (informational, not penalty); `bestStreak` preserved |
| 5 | Encouraging messages | `ENCOURAGING_MESSAGES[]` exported from `math-engine.js` |
| 6 | State isolation | Separate `practiceSession` variable; `showScreen()` reused as-is |
| 7 | `getPracticeConfig` helper | Pure exported function; spreads `GameConfig` + overrides one op range |

---

## Phase 1: Design Summary

### New entities

See `data-model.md` for full shapes and invariants.

- **`PracticeRanges`** — new export; 3 tiers × 4 operations of `NumberRange` objects
- **`ENCOURAGING_MESSAGES`** — new export; 8 feedback strings
- **`getPracticeConfig(op, diff)`** — new export; pure function returning a `generateQuestion`-compatible config
- **`PracticeSession`** — in-memory state for an active session; never persisted
- **`PracticeSummary`** — ephemeral derived view; computed once on "Stop Practising"

### Screen contracts

See `contracts/ui-state-machine.md` for full element IDs, transition diagram, and ARIA spec.

New screens added to `index.html`:

| Screen ID | Purpose |
|-----------|---------|
| `#screen-practice-op` | Operation selection (new, unique to Practice Mode) |
| `#screen-practice-diff` | Difficulty selection |
| `#screen-practice-session` | Active practice (question + tally + stop button) |
| `#screen-practice-summary` | Session results |

### math-engine.js API changes

See `contracts/math-engine-amendments.md` for full API spec.

- **3 new exports**: `PracticeRanges`, `ENCOURAGING_MESSAGES`, `getPracticeConfig`
- **1 backward-compatible amendment**: `generateQuestion` respects `r.bMax` for add/sub
- **10 unchanged exports**: all existing functions, `GameConfig`, and constants

### Key UX difference from main game

In the main game, feedback auto-advances to the next question after 1 000ms.
In Practice Mode, the child must tap **"Next Question"** explicitly — there is no auto-advance.
This is intentional: removing the time pressure extends to the feedback phase as well.
