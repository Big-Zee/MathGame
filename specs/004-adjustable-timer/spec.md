# Feature Specification: Adjustable Question Timer

**Feature Branch**: `004-adjustable-timer`
**Created**: 2026-04-30
**Status**: Draft
**Input**: User description: "Update the existing Math Blaster spec to make the question timer adjustable by the player before starting a game."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose Timer Before Playing (Priority: P1)

Before tapping "Play!", the child sees a timer selector labelled "⏱️ How much time per question?" showing six labelled options. The currently selected value is highlighted. The child can tap ◀ or ▶ (or tap directly on a value) to cycle through the options; the label updates immediately. The selection is confirmed when the child starts the game.

**Why this priority**: This is the entry point for the whole feature. Without the selector UI, no other story can be tested. A child who plays at 15 seconds (the default) gets the same experience as before — so delivering this story alone is already a safe, non-breaking MVP.

**Independent Test**: Load the Start screen, verify the timer selector is visible with 15 seconds pre-selected and the label "Normal 🎯". Tap ▶ twice; verify the selected value shows 25 seconds and the label updates to "Easy Going 🌈". Tap ▶ once more; verify it wraps to 30 seconds. Tap ▶ once more; verify it wraps to 5 seconds. Without starting a game, this story is fully testable in isolation.

**Acceptance Scenarios**:

1. **Given** the Start screen loads and no saved preference exists, **When** the child views the timer selector, **Then** 15 seconds is pre-selected and the label reads "Normal 🎯".
2. **Given** the timer selector is visible, **When** the child taps ▶, **Then** the next option is selected and its label is displayed immediately.
3. **Given** the timer selector is showing 30 seconds, **When** the child taps ▶, **Then** the selection wraps around to 5 seconds.
4. **Given** the timer selector is showing 5 seconds, **When** the child taps ◀, **Then** the selection wraps around to 30 seconds.
5. **Given** a timer option is selected, **When** the child taps ▶ Play!, **Then** the game starts with that timer duration applied to all questions in the round.

---

### User Story 2 - Timer and Bonus Adjust to Selected Duration (Priority: P2)

Once a game starts, the countdown bar depletes in exactly the selected number of seconds. The speed bonus threshold adjusts to approximately half the selected time (rounded down), so the challenge scales fairly regardless of which timer the child chose.

**Why this priority**: Gameplay correctness is more important than persistence. A child who selects 5 seconds and gets a 15-second countdown would immediately notice the bug. This story ensures the core game loop is correct for all six timer values.

**Independent Test**: Select "Super Speed! ⚡" (5 seconds) and start a game. Verify the countdown bar empties in 5 seconds. Answer a question within 3 seconds and verify the speed bonus is awarded. Answer a question after 3 seconds and verify no bonus is awarded. Repeat with at least one other timer value.

**Acceptance Scenarios**:

1. **Given** the child selected 5 seconds, **When** a question appears, **Then** the countdown bar empties in exactly 5 seconds and the time-out event fires at the 5-second mark.
2. **Given** the child selected 30 seconds, **When** a question appears, **Then** the countdown bar empties in exactly 30 seconds.
3. **Given** the child selected 10 seconds (bonus threshold: 5 s), **When** they answer within 5 seconds, **Then** the speed bonus is awarded.
4. **Given** the child selected 10 seconds, **When** they answer after 5 seconds have elapsed, **Then** no speed bonus is awarded.
5. **Given** any of the six timer values is selected, **When** the game is in progress, **Then** the speed bonus threshold matches the table: 5 s → 3 s; 10 s → 5 s; 15 s → 8 s; 20 s → 10 s; 25 s → 13 s; 30 s → 15 s.

---

### User Story 3 - Timer Selection Shown in Game HUD (Priority: P3)

During gameplay, the selected timer duration is displayed near the countdown bar so the child always knows what rule is in effect.

**Why this priority**: Informational transparency — the game is functionally correct without it. Prevents confusion when a non-default timer is active.

**Independent Test**: Select "Fast! 🚀" (10 seconds), start a game, verify a "10s" or "⏱️ 10s" label is visible adjacent to the countdown bar throughout the round.

**Acceptance Scenarios**:

1. **Given** the child selected 20 seconds, **When** the game screen is displayed, **Then** the HUD shows "⏱️ 20s" (or equivalent) near the countdown bar.
2. **Given** a new question loads within the same round, **When** the countdown bar resets, **Then** the HUD timer label still shows the correct selected duration.

---

### User Story 4 - Preference Remembered Across Sessions (Priority: P4)

The selected timer value is written to `localStorage` when the child starts a game. On subsequent page loads the saved value is pre-selected automatically.

**Why this priority**: Quality-of-life persistence. The game is fully functional without it; a child can always re-select their preferred timer. Persistence makes repeat play more frictionless.

**Independent Test**: Select "Relaxed 😊" (20 seconds), tap ▶ Play!, then reload the page. Verify the timer selector shows 20 seconds without any interaction.

**Acceptance Scenarios**:

1. **Given** the child selects 20 seconds and taps Play!, **When** they reload the page, **Then** the timer selector pre-selects 20 seconds.
2. **Given** a saved preference of 10 seconds exists, **When** the Start screen loads, **Then** 10 seconds is selected and "Fast! 🚀" is shown immediately.
3. **Given** `localStorage` is unavailable (e.g., private browsing), **When** the Start screen loads, **Then** the selector defaults to 15 seconds silently with no error message.
4. **Given** an unrecognised or corrupt value is stored in `localStorage`, **When** the Start screen loads, **Then** the selector falls back to 15 seconds silently.

---

### Edge Cases

- What if the child changes the timer using ◀/▶ but does not tap Play!? The preference is saved only when Play! is tapped — unsaved selections are discarded on navigation.
- What if `localStorage` throws an exception (quota exceeded, security policy)? Silently fall back to the in-memory default of 15 seconds; no error shown.
- What if the child uses keyboard-only navigation? ◀/▶ buttons must be reachable via Tab and activatable via Enter or Space.
- What if a race condition occurs between answer submission and timer expiry at exactly 0 seconds? The first event to fire wins; double-processing must be prevented.
- What if the page is loaded mid-round (e.g., hard refresh during a game)? The game state is not persisted; the player returns to the Start screen with their saved timer preference pre-selected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game entry point MUST display a timer selector labelled "⏱️ How much time per question?" with six options: 5 s, 10 s, 15 s, 20 s, 25 s, 30 s. The selector is placed on the existing `#screen-start`, between the rules list and the Play! button. No new screen is introduced. *(Resolved in planning — research.md Decision 1)*
- **FR-002**: Each timer option MUST display its duration and descriptive label: 5 s "Super Speed! ⚡", 10 s "Fast! 🚀", 15 s "Normal 🎯", 20 s "Relaxed 😊", 25 s "Easy Going 🌈", 30 s "Take Your Time 🐢".
- **FR-003**: The default selected option MUST be 15 seconds when no saved `localStorage` preference exists.
- **FR-004**: The selector MUST provide ◀ and ▶ navigation controls; tapping ◀ moves to the previous option wrapping from 5 s to 30 s; tapping ▶ moves to the next option wrapping from 30 s to 5 s.
- **FR-005**: Changing the selected value MUST update the displayed label immediately with no page reload required.
- **FR-006**: The game MUST use the selected timer duration (in seconds) as the countdown for every question in the round.
- **FR-007**: The timer bonus threshold for each option MUST be: 5 s → 3 s bonus threshold; 10 s → 5 s; 15 s → 8 s; 20 s → 10 s; 25 s → 13 s; 30 s → 15 s.
- **FR-008**: The selected timer duration MUST be visible in the game HUD during gameplay, displayed near the countdown bar.
- **FR-009**: The selected timer value MUST be written to `localStorage` when the child taps "▶ Play!".
- **FR-010**: On page load, the saved `localStorage` value MUST be read and pre-selected; if absent, unrecognised, or unreadable, the selector MUST silently fall back to 15 seconds.
- **FR-011**: The countdown bar depletion speed MUST reflect the selected duration — the bar takes exactly the selected number of seconds to deplete from full to empty.
- **FR-012**: The timer selector MUST NOT be visible during an active game round or on the results screen; it is only accessible before a game starts.

### Key Entities

- **TimerOption**: `{ seconds, label, bonusThresholdSeconds }` — one of six immutable configurations
- **TimerPreference**: `{ selectedSeconds }` — persisted in `localStorage`; read on load; written on game start

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A child can change the timer value and tap Play! in under 10 seconds from the Start screen loading.
- **SC-002**: The countdown bar empties in exactly the selected number of seconds (±0.2 s browser rendering tolerance) for all six options — verified by automated timer tests.
- **SC-003**: The speed bonus fires at the correct documented threshold for all six timer options — verified by unit tests in `tests/math-engine.test.js`.
- **SC-004**: The saved preference is correctly restored on page reload for all six possible values.
- **SC-005**: A child who leaves the default (15 s) experiences no change to the existing game behaviour.

## Assumptions

- The six timer options are fixed values; no free-text input or slider is provided.
- The `GameConfig.timerSeconds` and `GameConfig.timerBonusThreshold` values are currently hardcoded. This feature derives these values at game-start from the selected `TimerOption` rather than mutating `GameConfig`; `GameConfig` remains a static module-level const.
- The `localStorage` key for the timer preference will be defined during planning (e.g., `mathgame_timer`).
- Saving occurs on Play! tap, not on every ◀/▶ tap, to avoid storing an uncommitted selection.
- Practice Mode is unaffected — it has no timer and does not use this selector.
- No other game logic (scoring, lives, question generation, leaderboard, Practice Mode) is changed.

## Clarifications

### Session 2026-04-30

- Q: Where does the timer selector appear in the main-game flow? → A: Deferred to planning. The feature description references a "difficulty selection screen" that does not yet exist in the main game. The planner must decide: add the selector to the existing Start screen, or introduce a new pre-game setup screen between Start and Game.
