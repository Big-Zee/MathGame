# Feature Specification: Fix "Save Score" Button — Leaderboard

**Feature Branch**: `008-fix-save-score`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: Bug fix — "💾 Save Score" button does nothing when clicked on the results screen

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Save Score Works for All Name Picker Scenarios (Priority: P1)

A child who has finished a game session selects or types their name on the results screen, clicks "💾 Save Score", and is taken directly to the leaderboard screen with their new entry highlighted in gold.

**Why this priority**: The Save Score button is the core action of the entire Leaderboard feature. Without it working, no score can ever be recorded, making the whole feature non-functional.

**Independent Test**: Can be fully tested by completing a game, choosing a name (via button tap, new name input, or pre-selected returning player), pressing Save Score, and confirming the leaderboard screen appears with the new entry highlighted.

**Acceptance Scenarios**:

1. **Given** the results screen with existing name buttons (Scenario A), **When** the player taps a name button and clicks Save Score, **Then** the entry is saved to localStorage and the leaderboard screen opens with that entry highlighted in gold.
2. **Given** the results screen with no existing players (Scenario B), **When** the player types a name and clicks Save Score, **Then** the entry is saved and the leaderboard screen opens with the new entry highlighted in gold.
3. **Given** a returning player whose name is pre-selected (Scenario C), **When** the results screen renders and Save Score is clicked without any further interaction, **Then** the entry is saved and the leaderboard screen opens with the new entry highlighted in gold.
4. **Given** the player types a valid name in the text input and presses Enter, **When** Save Score is enabled, **Then** the save flow is triggered identically to clicking the button.
5. **Given** the player clicks Save Score twice in rapid succession, **When** the second click fires, **Then** only one entry is saved (second click is ignored).

---

### User Story 2 — Save Score Button Enables and Disables Correctly (Priority: P1)

The Save Score button is disabled until a valid name is active (button selected or non-empty text typed), and becomes enabled as soon as a valid name is available — whether that is a tapped name button, typed text, or a pre-selected returning-player button.

**Why this priority**: The disabled-state logic is the guard that determines whether the save flow is even reachable. If enable/disable wiring is broken, the button may stay permanently disabled (blocking save) or stay permanently enabled (allowing empty-name saves).

**Independent Test**: Can be fully tested without saving: check that the button starts disabled (no name selected, empty input), becomes enabled after a single tap on a name button or typing one character, and returns to disabled if the text input is cleared and no button is selected.

**Acceptance Scenarios**:

1. **Given** the name picker renders with name buttons and no pre-selection, **When** no button is tapped and the text input is empty, **Then** Save Score is disabled.
2. **Given** Save Score is disabled, **When** the player taps any name button, **Then** Save Score becomes enabled immediately.
3. **Given** Save Score is enabled via a tapped name button, **When** the player taps "+ Add new name" (which deselects the button and expands the text input), **Then** Save Score becomes disabled again until at least 1 character is typed.
4. **Given** the text input is visible, **When** the player types at least 1 non-whitespace character, **Then** Save Score becomes enabled.
5. **Given** Save Score is enabled via typed text, **When** the player clears the text input to empty or whitespace only, **Then** Save Score becomes disabled.
6. **Given** a returning player (Scenario C) whose name is pre-selected, **When** the results screen renders, **Then** Save Score is already enabled without any user action.

---

### User Story 3 — Leaderboard Screen Appears After Save (Priority: P1)

After a successful save, the game transitions automatically to the leaderboard screen, shows the newly saved entry highlighted in gold, and (when applicable) shows the personal best banner.

**Why this priority**: Without the state transition, the user never sees confirmation that their score was saved. The transition is the visible outcome of the save action.

**Independent Test**: Can be fully tested by saving a score and observing the screen change — no extra navigation is needed.

**Acceptance Scenarios**:

1. **Given** Save Score is clicked with a valid name, **When** the save completes, **Then** the leaderboard screen is shown immediately without any additional user action.
2. **Given** the newly saved score is rank 1 on the leaderboard, **When** the leaderboard screen opens, **Then** the banner "🎉 New Personal Best! You're #1!" is displayed.
3. **Given** the newly saved score is not rank 1, **When** the leaderboard screen opens, **Then** no personal best banner is shown, but the new entry's row is highlighted in gold.

---

### User Story 4 — Skip Button Remains Unaffected (Priority: P2)

The Skip button continues to work correctly after this fix: pressing it returns the player to the start screen without saving any score.

**Why this priority**: The Skip button is part of the same results-screen UI. Fixing the Save Score wiring must not break the Skip path.

**Independent Test**: Can be fully tested by pressing Skip and verifying no entry is saved and the start screen is shown.

**Acceptance Scenarios**:

1. **Given** the results screen with name picker visible, **When** the player presses Skip, **Then** no score entry is saved to localStorage and the player is returned to the start screen.
2. **Given** the player selected a name, **When** the player presses Skip instead of Save, **Then** no entry is saved.

---

### Edge Cases

- What happens when localStorage is unavailable or throws during save? → Save fails gracefully; the player is not blocked (no crash, no frozen screen).
- What happens when the text input contains only whitespace (e.g., spaces)? → Trimmed result is empty, so Save Score stays disabled.
- What happens when Save Score is clicked while already saving (debounce scenario)? → Second invocation is ignored; exactly one entry is written per session.
- What happens if the name input is programmatically cleared after enable? → Save Score reverts to disabled.
- What happens with the badges, Practice Mode, Stop Session, timer, and game loop features? → No change — this fix is isolated to the results-screen name picker wiring and does not touch any other feature's logic.

---

## Requirements *(mandatory)*

### Functional Requirements

**Event Listener Integrity**

- **FR-001**: The Save Score button click handler MUST be attached after the results screen HTML is fully rendered in the DOM (not before).
- **FR-002**: The Enter key handler on the name text input MUST be attached after the text input element exists in the DOM.
- **FR-003**: No event handler MUST stop propagation in a way that prevents the Save Score click from reaching its registered listener.

**Active Name Resolution**

- **FR-004**: When Save Score is triggered, the system MUST resolve the active name as: the selected name button's label if one is selected, otherwise the trimmed text input value.
- **FR-005**: If the resolved active name is empty or whitespace only, the save MUST be aborted silently (button should already be disabled, but the handler MUST guard against this as a safety check).
- **FR-006**: The selected name variable and the text input value MUST both be readable within the save handler's scope at the time the handler executes.

**Save Flow**

- **FR-007**: When Save Score is triggered with a valid active name, the system MUST call LeaderboardManager (or equivalent storage function) to persist the entry with all required fields: name, score, stars, difficulty, timerSetting, stoppedEarly, date (ISO string), accuracy, bestStreak.
- **FR-008**: After a successful save, the system MUST update `mathblaster_last_player_name` in localStorage to the saved name.
- **FR-009**: Any error thrown during the save MUST be caught and logged; it MUST NOT cause the screen to freeze or produce a silent failure with no visible feedback.

**State Transition**

- **FR-010**: After a successful save, the system MUST transition the game state to the leaderboard screen immediately (one automatic transition, no user action required).
- **FR-011**: The leaderboard screen render function MUST be called with a reference to the newly saved entry so it can apply the gold highlight.
- **FR-012**: The leaderboard render function MUST evaluate whether the saved entry is rank 1 and, if so, display the personal best banner.

**Button Enable/Disable**

- **FR-013**: The Save Score button MUST start in the disabled state when the name picker renders (except Scenario C where a name is pre-selected).
- **FR-014**: The Save Score button MUST become enabled immediately when a name button is tapped.
- **FR-015**: The Save Score button MUST become enabled when the text input contains at least 1 non-whitespace character.
- **FR-016**: The Save Score button MUST become disabled again when the text input is cleared to empty or whitespace only and no name button is selected.
- **FR-017**: In Scenario C (returning player, pre-selected name), the Save Score button MUST be enabled at the time the results screen finishes rendering.

**Double-Save Prevention**

- **FR-018**: After Save Score is clicked once and the save begins, the button MUST be disabled or the handler MUST short-circuit so a second rapid click does not trigger a second save.

**Regression Guard**

- **FR-019**: The Skip button MUST continue to work after this fix, returning the player to the start screen without saving.
- **FR-020**: Badges, Practice Mode, Stop Session, adjustable timer, and the game loop MUST be unaffected by changes made as part of this fix.

### Key Entities

- **LeaderboardEntry**: The data object persisted on each save. Fields: name (string, max 12 chars), score (integer), stars (1–3), difficulty (Easy/Medium/Hard), timerSetting (string), stoppedEarly (boolean), date (ISO 8601 string), accuracy (0–100 number), bestStreak (integer).
- **ActiveName**: The runtime-resolved string used for the save — either the selected name button's label or the trimmed text input value. Determined at save time, not at render time.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clicking Save Score with a valid name always saves the entry on the first click — 100% success rate across all three name picker scenarios (A, B, C).
- **SC-002**: After clicking Save Score, the leaderboard screen appears within 500 ms with no additional user action.
- **SC-003**: The Save Score button transitions from disabled to enabled within one interaction step (single tap on a name button, or first character typed) — zero extra steps required.
- **SC-004**: Double-clicking Save Score rapidly results in exactly one entry saved — never zero, never two.
- **SC-005**: Pressing Enter in the text input (when Save Score is enabled) triggers the save flow with the same outcome as clicking the button — verified across all scenarios where text input is active.
- **SC-006**: The Skip button continues to work correctly after the fix — no entries are saved when Skip is pressed, confirmed in 100% of test runs.
- **SC-007**: No regression observed in badges, Practice Mode, Stop Session, adjustable timer, or game loop behaviour after the fix is applied.

---

## Assumptions

- The existing leaderboard implementation (LeaderboardManager or equivalent) is functionally correct for storage — the bug is isolated to the UI event wiring and state transition, not to the storage logic itself.
- The results screen is rendered dynamically (not present in the initial HTML) — this is why attaching handlers before render is the most likely root cause.
- "Stars", "accuracy", "bestStreak", "stoppedEarly", and "timerSetting" are all available on the results screen at the time Save Score is clicked.
- The leaderboard screen render function already exists and already supports a "highlight entry" parameter — the fix only needs to ensure it is called correctly after save.
- The fix must not change any data schema, localStorage key names, or LeaderboardEntry field names — purely a UI event-wiring repair.
- No changes to CSS or visual design are required beyond what is already specified in the original Leaderboard feature spec (007-leaderboard).
