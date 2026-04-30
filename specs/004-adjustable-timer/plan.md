# Implementation Plan: Adjustable Question Timer

**Branch**: `004-adjustable-timer` | **Date**: 2026-04-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/004-adjustable-timer/spec.md`

## Summary

Adjustable Timer lets a child choose how long they get per question (5–30 s) before
starting the main game. The selector lives on the existing Start screen (no new screen).
The selected value drives the game countdown, the speed-bonus threshold
(`Math.floor(seconds × 0.5)`), and a HUD label during play. The preference is persisted
to `localStorage` under key `mathblaster_timer_preference`.

Four new exports are added to `js/math-engine.js` (`TIMER_OPTIONS`, `getTimerPreference`,
`setTimerPreference`, `getGameConfigForTimer`). `index.html` gains a selector widget on
the Start screen, a HUD label on the Game screen, and updated `startGame(timerOption)`
plumbing. `GameConfig` is not mutated. Practice Mode, question generation, scoring, and
the leaderboard are untouched.

## Technical Context

**Language/Version**: HTML5 + ES6+ JavaScript + CSS3 (unchanged)
**Primary Dependencies**: None — zero new libraries or frameworks
**Storage**: `localStorage` key `mathblaster_timer_preference` — integer seconds as string
**Testing**: Node.js 18+ `node --test` for new `math-engine.js` exports; no browser required
**Target Platform**: Modern evergreen browsers; Azure SWA free tier
**Project Type**: Additive amendment to existing single-page app; same screen-toggle architecture
**Performance Goals**: Timer selector label updates within 50ms of ◀/▶ tap; game start unchanged
**Constraints**: Zero build tools; WCAG 2.1 AA — zero known violations at ship; no `.github/workflows/` modifications; `GameConfig` immutable; Practice Mode isolated
**Scale/Scope**: Single player, single device; no server calls

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Learning-First | ✅ PASS | Timer choice is a learner-controlled difficulty input; slower timers reduce stress for struggling learners; faster timers challenge confident learners. Directly serves skill acquisition for ages 9–10. |
| II. Kid-Friendly Design (9–10) | ✅ PASS | ◀/▶ buttons ≥ 44×44 CSS px; plain labels at 4th-grade reading level; no hover-only affordances; immediate visual feedback on selection; wrapping prevents dead ends. |
| III. Accessibility (WCAG 2.1 AA) | ✅ PASS | `role="group"` + `aria-labelledby` on selector; `aria-live="polite"` on value/label display; ◀/▶ buttons keyboard-navigable (Tab + Enter/Space); focus order preserved; HUD label `aria-hidden="true"` (decorative only). Accessibility audit task required in Polish phase. |
| IV. Test-First | ✅ PASS | All four new `math-engine.js` exports (`TIMER_OPTIONS`, `getTimerPreference`, `setTimerPreference`, `getGameConfigForTimer`) require **failing tests before implementation** (see quickstart.md). `applyTimerBonus` backward-compatibility verified by existing tests. |
| V. Incremental Delivery | ✅ PASS | US1 (selector UI) alone is a viable MVP — a child who never changes the default gets the identical classic experience. US2 (timer plumbing), US3 (HUD), US4 (persistence) each add independent value. |
| VI. Immediate Feedback | ✅ PASS | Timer selector label updates synchronously on ◀/▶ tap. Countdown bar behaviour unchanged. No persistence or score changes introduced that could delay feedback. |
| VII. Deployment Integrity | ✅ PASS | Only `index.html` and `js/math-engine.js` are modified. No bundler, build step, or `.github/workflows/` changes. Zero new files outside `specs/`. |
| Technical Standards | ✅ PASS | Vanilla HTML5/ES6+/CSS3; zero new dependencies; timer configuration is data-driven (`TIMER_OPTIONS` const array); all new helpers are DOM-free and unit-testable in Node. |

*Post-Phase 1 re-check*: All gates still pass after design (see data-model.md and contracts/).

## Project Structure

### Documentation (this feature)

```text
specs/004-adjustable-timer/
├── plan.md                          # This file
├── research.md                      # Phase 0 output — 7 decisions
├── data-model.md                    # Phase 1 output — entities + amendments
├── quickstart.md                    # Phase 1 output — manual + unit test guide
├── contracts/
│   ├── ui-state-machine.md          # Amended state machine (no new screens; Start + Game amended)
│   └── math-engine-amendments.md   # 4 new exports; all existing exports unchanged
└── tasks.md                         # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
index.html          # + timer selector widget on #screen-start (◀/▶ buttons + value/label display)
                    # + #timer-hud-label on #screen-game (adjacent to countdown bar)
                    # + CSS for .timer-selector, .btn-timer-nav
                    # + startGame(timerOption) — now receives selected TimerOption
                    # + setTimerPreference() called on Play! click
                    # + selectedTimerIndex module-level variable

js/
└── math-engine.js  # + TIMER_OPTIONS (new export — 6-item array)
                    # + getTimerPreference() (new export)
                    # + setTimerPreference(seconds) (new export)
                    # + getGameConfigForTimer(seconds) (new export)
                    # (all existing exports unchanged)

tests/
└── math-engine.test.js  # + ~13 new test cases for new exports
                         # (all 56 existing tests unchanged and still passing)
```

**Structure Decision**: Strictly additive. The only behavioural change to existing code is
`startGame()` receiving a `timerOption` argument and using the derived config; the existing
`GameConfig` fallback remains valid for the default 15-second case.

## Complexity Tracking

> No constitution violations requiring justification.

**Formula vs. spec table discrepancy**: The user's explicit constraint (`Math.floor(seconds * 0.5)`)
supersedes the spec table for three timer values (5 s, 15 s, 25 s). The differences are ≤1 second
and are documented in research.md Decision 3. No constitution principles are implicated.

---

## Phase 0: Research Summary

All NEEDS CLARIFICATION markers resolved. See `research.md` for full rationale.

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Selector placement (FR-001 gap) | Placed on existing `#screen-start`; no new screen |
| 2 | localStorage key and value format | Key `mathblaster_timer_preference`; value = integer seconds as string |
| 3 | Bonus threshold formula | `Math.floor(seconds * 0.5)` — supersedes spec table for 5 s, 15 s, 25 s |
| 4 | GameConfig isolation | `getGameConfigForTimer(seconds)` spreads `GameConfig`; no mutation |
| 5 | Countdown bar speed mechanism | `timerTicks = selectedSeconds * 10` with existing 100ms interval |
| 6 | TIMER_OPTIONS data structure | Labels only (`seconds` + `label`); threshold computed by formula |
| 7 | Scope boundary | Only `index.html` + `js/math-engine.js`; Practice Mode untouched |

---

## Phase 1: Design Summary

### New entities

See `data-model.md` for full shapes and invariants.

- **`TIMER_OPTIONS`** — new export; 6 `{ seconds, label }` objects, index 2 = default 15 s
- **`getTimerPreference()`** — new export; reads localStorage, validates, returns seconds integer
- **`setTimerPreference(seconds)`** — new export; writes to localStorage on Play! tap
- **`getGameConfigForTimer(seconds)`** — new export; derived GameConfig with timer overrides
- **`selectedTimerIndex`** — new module-level variable in index.html inline script

### Screen contracts

See `contracts/ui-state-machine.md` for full element IDs and ARIA spec.

**No new screens.** Two existing screens amended:

| Screen | Change |
|--------|--------|
| `#screen-start` | + `#timer-selector` widget (◀ `#btn-timer-prev` · `#timer-value-display` · `#timer-label-display` · ▶ `#btn-timer-next`) |
| `#screen-game` | + `#timer-hud-label` adjacent to countdown bar |

### math-engine.js API changes

See `contracts/math-engine-amendments.md` for full API spec.

- **4 new exports**: `TIMER_OPTIONS`, `getTimerPreference`, `setTimerPreference`, `getGameConfigForTimer`
- **0 breaking changes**: all 14 existing exports unchanged in signature and behaviour
- **`GameConfig`** retains `timerSeconds: 15, timerBonusThreshold: 8` as static defaults

### Key interaction difference from current game

Currently `startGame()` takes no arguments and uses `GameConfig` directly.
After this feature, `startGame(timerOption)` receives the selected `TimerOption`
and uses `getGameConfigForTimer(timerOption.seconds)` for all timer-dependent logic.
The `Play Again` button re-starts with the **same** timerOption that was active when
the round started (stored in session or re-read from `selectedTimerIndex`).
