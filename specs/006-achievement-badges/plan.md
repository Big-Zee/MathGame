# Implementation Plan: Achievement Badges

**Branch**: `006-achievement-badges` | **Date**: 2026-05-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/006-achievement-badges/spec.md`

## Summary

Add 18 achievement badges across 5 categories (Accuracy, Speed, Score, Practice, Variety) to Math Blaster. Badge logic lives in a new pure ES module `js/badge-engine.js` (no DOM dependency, fully unit-testable). Badges are checked at two insertion points in the existing game flow — feedback-end and session-end — via minimal additive amendments to `showFeedback()`, `showResults()`, `showStopSummary()`, and `stopPractising()`. A non-blocking popup queue defers the next question's countdown until badge celebrations finish. A new `#screen-badges` full screen (accessible from Start screen only) shows all 18 badges with earned/unearned states, grouped by category. All 18 badge states persist in `localStorage`. `js/math-engine.js` is not modified.

---

## Technical Context

**Language/Version**: Vanilla JavaScript ES6+ (no transpiler, no framework)
**Primary Dependencies**: None — zero-dependency, zero-build
**Storage**: `localStorage` (browser) — 4 new keys: `mathblaster_badges`, `mathblaster_badges_new`, `mathblaster_practice_stats`, `mathblaster_timers_used`
**Testing**: Node.js built-in test runner (`node --test`) — new `tests/badges.test.js` for badge-engine.js
**Target Platform**: Browser (Chrome, Edge, Safari, Firefox) + Azure Static Web Apps free tier
**Project Type**: Static single-page application
**Performance Goals**: Badge checks complete in < 1 ms (18 O(1) comparisons); popup renders before next question countdown (< 100 ms); `getBadgeStore()` parse < 5 ms
**Constraints**: All new JS in `js/badge-engine.js` (pure) + `index.html` (UI wiring); `js/math-engine.js` untouched; `.github/workflows/` untouched; no new npm dependencies
**Scale/Scope**: 1 new JS module (~250 lines), 1 new test file (~200 lines), ~290 lines added to `index.html` (HTML + CSS + JS)

---

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| No JS frameworks (Principle I stack) | ✅ PASS | Pure vanilla JS; no import of any framework |
| Azure SWA / no build step (Principle VII) | ✅ PASS | `js/badge-engine.js` imported via relative ES module path; no bundler needed |
| `index.html` sole entry point | ✅ PASS | No new HTML files; `#screen-badges` added as a `<section>` in existing `index.html` |
| `js/math-engine.js` unchanged | ✅ PASS | All badge logic isolated in `js/badge-engine.js`; `calculateStars` called by reference from `index.html` as today |
| `.github/workflows/` untouched | ✅ PASS | No deployment pipeline changes |
| WCAG 2.1 AA (Principle III) | ✅ PLANNED | Badge cards need `role="img"` + `aria-label`; popup needs `aria-live`; "← Back" needs focus management; keyboard Escape on popup |
| Test-First / TDD (Principle IV) | ✅ PLANNED | All 18 badge check functions in `badge-engine.js` require failing tests before implementation; Red → Green order enforced in tasks |
| Kid-Friendly Design (Principle II) | ✅ PLANNED | Badge button ≥ 44×44 px; plain language hints; popup tap-to-dismiss; `prefers-reduced-motion` on popup animation |

---

## Project Structure

### Documentation (this feature)

```text
specs/006-achievement-badges/
├── plan.md                          ← This file (/speckit-plan output)
├── spec.md                          ← Feature specification
├── research.md                      ← Phase 0 output
├── data-model.md                    ← Phase 1 output
├── quickstart.md                    ← Phase 1 output
├── checklists/
│   └── requirements.md
├── contracts/
│   ├── badge-api.md                 ← Phase 1 output (badge-engine.js API)
│   └── ui-state-machine.md         ← Phase 1 output (screen + popup states)
└── tasks.md                         ← Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code

```text
js/
├── math-engine.js    ← NO CHANGES
└── badge-engine.js   ← NEW (pure badge logic, localStorage wrappers)

index.html            ← MODIFIED (new HTML sections, new CSS, integration wiring)

tests/
├── math-engine.test.js   ← NO CHANGES
└── badges.test.js        ← NEW (unit tests for badge-engine.js)
```

**Structure Decision**: Single-file app extended by one new pure module, consistent with how `math-engine.js` was added in feature 001. All DOM-dependent logic (screens, popup, button updates) remains inline in `index.html`. Testable pure logic extracted to `badge-engine.js`.

---

## Complexity Tracking

No constitution violations requiring justification.

---

## Phase 0: Research (Complete)

See [research.md](research.md). Key decisions:

| Decision | Resolution |
|----------|-----------|
| Badge logic location | `js/badge-engine.js` — new pure ES module; testable without browser |
| "Explorer" badge scope | Practice Mode: complete session at all 3 difficulty levels (main game has no difficulty selector) |
| "Perfectionist" badge scope | Practice Mode: 100% correct answers in a Hard difficulty session |
| Per-question elapsed time | Computed from `(config.timerSeconds * 10 − session.timerTicks) * 100` at `showFeedback` call time |
| Popup ↔ `advanceRound` gating | Popup queue accepts a callback; `advanceRound` not modified; callback fires on final dismiss |
| "Comeback Kid" condition | Exactly `3 − session.lives === 2` AND `calculateStars === 3` at game end |
| "Lightning" counter reset | Resets on any wrong answer OR any answer ≥ 5 000 ms |

---

## Phase 1: Design (Complete)

See [data-model.md](data-model.md), [contracts/badge-api.md](contracts/badge-api.md), [contracts/ui-state-machine.md](contracts/ui-state-machine.md), [quickstart.md](quickstart.md).

---

## Delivery Plan

### Foundational Work (prerequisite to all stories — no user-visible changes)

Tasks here produce working, tested infrastructure that each story layer builds on.

| Task | Description | Files |
|------|-------------|-------|
| **T001** | `badge-engine.js` skeleton: ES module file, `BADGE_DEFINITIONS` constant (18 badges), `BADGE_CATEGORIES` constant | `js/badge-engine.js` |
| **T002** | localStorage wrappers: `getBadgeStore`, `saveBadgeStore`, `getBadgesNew`, `incrementBadgesNew`, `clearBadgesNew` | `js/badge-engine.js` |
| **T003** | Practice stats wrappers: `getPracticeStats`, `savePracticeStats` | `js/badge-engine.js` |
| **T004** | Timer-used wrappers: `getTimersUsed`, `saveTimersUsed` | `js/badge-engine.js` |
| **T005** | Tests for T001–T004: `getBadgeStore` init (absent key), `getPracticeStats` init, `getTimersUsed` init, round-trip save/load | `tests/badges.test.js` |

---

### Story 1 — Badges Screen (P1): "I want a 🏅 Badges button and a screen showing all my badges"

Delivers a fully working Badges screen (all 18 badges visible, earn state correct) and button on Start screen.

| Task | Description | Files |
|------|-------------|-------|
| **T006** | HTML: Add `#screen-badges` `<section>` with 5 category sections, 18 badge card `<div>` elements (placeholders) | `index.html` |
| **T007** | HTML: Add `#btn-badges` button to `#screen-start` | `index.html` |
| **T008** | CSS: Badge grid layout (responsive, min 3 columns), section headers, progress indicator | `index.html` |
| **T009** | CSS: Earned badge card (full colour), unearned badge card (greyed, 0.35 opacity), unlock date and hint text styles | `index.html` |
| **T010** | JS: `renderBadgesScreen()` — read `getBadgeStore()`, populate 18 badge cards (earned/unearned state, formatted date "May 1"), section progress counts, total count | `index.html` |
| **T011** | JS: `updateBadgesButton()` — read `getBadgesNew()`, set button label with/without "(N new!)" | `index.html` |
| **T012** | JS: `showBadgesScreen()` — calls `clearBadgesNew()`, `renderBadgesScreen()`, `showScreen('screen-badges')`; wire "← Back" button → `showScreen('screen-start')` | `index.html` |
| **T013** | JS: Wire `#btn-badges` click → `showBadgesScreen()`; call `updateBadgesButton()` inside `showScreen('screen-start')` | `index.html` |
| **T014** | Accessibility: `role="main"`, `<h1>`, `<h2>` section headings, `role="img"` + `aria-label` on each badge card, `aria-label` on Back button, focus on "← Back" on entry | `index.html` |

**Independent test**: Zero badges earned → open Badges screen → all 18 greyed with hints; total reads "0 out of 18"; section progress all "0 / N". Earn one badge via DevTools (`localStorage.setItem(…)`), reload, open Badges screen → that badge shows earned with today's date.

---

### Story 2 — Badge Earning (P2): "Earn badges automatically when conditions are met"

Delivers all 18 badge checks, all integration hooks, and the new-badge counter on the Start screen button.

| Task | Description | Files |
|------|-------------|-------|
| **T015** | Tests (RED): 5 Accuracy badge check functions — one failing test each | `tests/badges.test.js` |
| **T016** | Accuracy badge checks (GREEN): `checkHatTrick`, `checkOnFire`, `checkUnstoppable`, `checkSharpShooter`, `checkComebackKid` | `js/badge-engine.js` |
| **T017** | Tests (RED): 3 Speed badge check functions | `tests/badges.test.js` |
| **T018** | Speed badge checks (GREEN): `checkSpeedDemon`, `checkLightning`, `checkQuickThinker` | `js/badge-engine.js` |
| **T019** | Tests (RED): 4 Score badge check functions | `tests/badges.test.js` |
| **T020** | Score badge checks (GREEN): `checkFirstWin`, `checkCentury`, `checkHighRoller`, `checkMathLegend` | `js/badge-engine.js` |
| **T021** | Tests (RED): 3 Practice badge check functions | `tests/badges.test.js` |
| **T022** | Practice badge checks (GREEN): `checkPracticeMakesPerfect`, `checkOperationMaster`, `checkDedication` | `js/badge-engine.js` |
| **T023** | Tests (RED): 3 Variety badge check functions | `tests/badges.test.js` |
| **T024** | Variety badge checks (GREEN): `checkExplorer`, `checkTimeLord`, `checkPerfectionist` | `js/badge-engine.js` |
| **T025** | Tests (RED): 3 orchestrators (`checkBadgesAfterQuestion`, `checkBadgesAfterGame`, `checkBadgesAfterPractice`) and `awardBadges` | `tests/badges.test.js` |
| **T026** | Orchestrators and `awardBadges` (GREEN) | `js/badge-engine.js` |
| **T027** | Session extension: add `answerTimesMs: []`, `fastAnswerStreak: 0` to `newSession(config)` | `index.html` |
| **T028** | `showFeedback()` amendment: compute `elapsedMs`, push to `session.answerTimesMs`, update `session.fastAnswerStreak`; call `checkBadgesAfterQuestion`; award + save + `incrementBadgesNew` if new badges; (popup gating in T033) | `index.html` |
| **T029** | `showResults()` amendment: call `checkBadgesAfterGame`; update `mathblaster_timers_used`; award + save + `incrementBadgesNew`; (popup gating in T034) | `index.html` |
| **T030** | `showStopSummary()` amendment: same pattern as T029 | `index.html` |
| **T031** | `stopPractising()` amendment: update `mathblaster_practice_stats` (sessionsCompleted, operationsCompleted, difficultiesCompleted, totalCorrect); call `checkBadgesAfterPractice`; award + save + `incrementBadgesNew`; (popup gating in T035) | `index.html` |
| **T032** | Verify `updateBadgesButton()` is called on each `showScreen('screen-start')` so new-badge count reflects latest state | `index.html` |

**Independent test**: Start a game, answer correctly within 2 s → after feedback, Badges screen should show Speed Demon as earned. Earn "First Win" by completing a game. Check `localStorage.getItem('mathblaster_badges')` in DevTools.

---

### Story 3 — Badge Unlock Popup (P3): "Celebrate earning a badge mid-game"

Delivers the animated popup queue, `advanceRound` gating, and screen-transition gating.

| Task | Description | Files |
|------|-------------|-------|
| **T033** | HTML: Add `#badge-unlock-popup` overlay (hidden by default) with emoji, name, description placeholders | `index.html` |
| **T034** | CSS: Popup animation (`@keyframes` slide-in/fade, `prefers-reduced-motion` override), z-index, positioning | `index.html` |
| **T035** | JS: `badgePopupQueue`, `badgePopupCallback`, `badgePopupTimer` module-level state; `enqueueBadgePopups(badgeIds, callback)`, `showNextBadgePopup()`, `dismissCurrentPopup()` | `index.html` |
| **T036** | JS: Wire `#badge-unlock-popup` click → `dismissCurrentPopup()`; Escape key → `dismissCurrentPopup()` | `index.html` |
| **T037** | JS: `showFeedback()` — integrate popup gating: when badges queued, skip `setTimeout(advanceRound, 1000)` and pass `advanceRound` as callback to `enqueueBadgePopups` | `index.html` |
| **T038** | JS: `showResults()` / `showStopSummary()` — integrate popup gating: wrap `showScreen(...)` call in a callback passed to `enqueueBadgePopups` | `index.html` |
| **T039** | JS: `stopPractising()` — integrate popup gating: wrap `showScreen('screen-practice-summary')` in callback | `index.html` |
| **T040** | Accessibility: `aria-live="assertive"` on popup content, `aria-label` on popup, Escape handling, no focus steal | `index.html` |

**Independent test**: Earn "Speed Demon" → popup appears, shows correct badge name and description, auto-dismisses in 3 s → next question loads and countdown starts. Earn two badges on same question → both popups show sequentially, countdown does not start until second popup clears.

---

### Story 4 — Persistence Guarantee (P4): "Badges survive page reload"

Delivers hardened persistence tests covering all edge cases.

| Task | Description | Files |
|------|-------------|-------|
| **T041** | Tests: `getBadgeStore()` with absent key returns full 18-badge init state | `tests/badges.test.js` |
| **T042** | Tests: `getBadgeStore()` with corrupt JSON returns init state (no crash) | `tests/badges.test.js` |
| **T043** | Tests: Round-trip `saveBadgeStore` → `getBadgeStore` — earned status and ISO date string preserved | `tests/badges.test.js` |
| **T044** | Tests: Re-earning an already-earned badge does not overwrite `unlockedAt` date | `tests/badges.test.js` |
| **T045** | Tests: `getPracticeStats()` accumulation — sessionsCompleted increments, operationsCompleted is a union set, totalCorrect sums | `tests/badges.test.js` |
| **T046** | Manual test in browser: Earn a badge → reload → badge still earned. Clear high score → badges unaffected. | `index.html` |

**Independent test**: Earn several badges across different categories. Close the browser tab. Reopen. Badges screen shows the same earned state.

---

### Story 5 — Practice Mode Badges (P5): "Reward Practice Mode dedication"

Delivers the complete Practice badge tracking, including the Explorer and Perfectionist variety badges.

| Task | Description | Files |
|------|-------------|-------|
| **T047** | Verify `stopPractising()` correctly reads `practiceSession.operation` and `practiceSession.difficulty` and writes both to `mathblaster_practice_stats` | `index.html` |
| **T048** | Manual test: Complete 5 Practice sessions → "Practice Makes Perfect" badge earns on 5th. Complete sessions in all 4 operations → "Operation Master" earns. Accumulate 50 correct answers → "Dedication" earns. | `index.html` |
| **T049** | Manual test: Complete Practice sessions at Easy, Medium, Hard → "Explorer" earns on 3rd difficulty. Complete a Hard session with 100% correct → "Perfectionist" earns. | `index.html` |
| **T050** | Accessibility audit: Full WCAG 2.1 AA check on Badges screen and popup — screen reader test (role announcements, aria-live), keyboard navigation (Tab through badge cards), colour contrast (earned vs unearned against background) | `index.html` |
| **T051** | Polish: Verify `prefers-reduced-motion` disables popup slide-in animation; badge popup still appears but without motion; Badges screen badge cards still distinguish earned/unearned without colour alone (use icon/opacity difference) | `index.html` |

---

## Integration Points (Minimal Amendment Summary)

The following existing functions require **additive amendments only** — no existing logic removed or restructured:

| Function | Current Last Line | Addition |
|----------|-------------------|---------|
| `newSession(config)` | Returns `{ ..., timerHandle: null, pendingAdvance: null, ... }` | Add `answerTimesMs: [], fastAnswerStreak: 0` to returned object |
| `showFeedback(choice, timedOut)` | `session.pendingAdvance = setTimeout(advanceRound, 1000)` | Before this line: compute elapsed time; check badges; if new badges → `enqueueBadgePopups(ids, advanceRound)` and skip the `setTimeout`; else keep `setTimeout` |
| `showResults()` | `showScreen('screen-results')` | Before `showScreen`: check end-game badges; if new badges → `enqueueBadgePopups(ids, () => showScreen('screen-results'))`; else call `showScreen` directly |
| `showStopSummary()` | `showScreen('screen-stop-summary')` | Same pattern as `showResults()` |
| `stopPractising()` | `showScreen('screen-practice-summary')` | Before `showScreen`: update practice stats; check practice badges; gate screen via popup queue |
| `showScreen('screen-start')` (call sites) | Various | Add `updateBadgesButton()` call after `showScreen` at each call site that navigates to Start |

**NOT amended**: `startTimer()`, `stopTimer()`, `resumeTimer()`, `advanceRound()`, `renderQuestion()`, `startGame()`, `newPracticeSession()`.

---

## Re-check: Constitution Check Post-Design

| Gate | Status | Notes |
|------|--------|-------|
| No JS frameworks | ✅ PASS | `badge-engine.js` is pure JS; `index.html` additions are vanilla JS |
| Azure SWA / Deployment Integrity | ✅ PASS | `js/badge-engine.js` is a static file served alongside `index.html`; imported via `./js/badge-engine.js` relative path |
| `index.html` sole entry point | ✅ PASS | New `<section id="screen-badges">` inside existing `index.html` |
| Math engine unchanged | ✅ PASS | `calculateStars` used by reference from `index.html` (already imported); `badge-engine.js` does not import math-engine.js |
| WCAG 2.1 AA | ✅ PLANNED | T014 (badges screen) + T040 (popup) + T050 (audit) cover this |
| TDD enforced | ✅ PLANNED | RED tests (T015/T017/T019/T021/T023/T025/T041–T045) before GREEN implementations |
