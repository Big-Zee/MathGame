# Feature Specification: Game Audit Log

**Feature Branch**: `010-game-audit-log`  
**Created**: 2026-05-24  
**Status**: Draft  
**Input**: User description: "Add a new feature called Game Audit Log to Math Blaster."

## Clarifications

### Session 2026-05-24

- Q: What is the exact moment `startTime` should be captured? → A: When the first question is visible and the answer timer starts ticking — the moment the player can interact with the question.
- Q: Which `endReason` wins when question 10 completion and a Stop confirmation occur simultaneously? → A: `"completed"` always wins — if question 10 was answered, the session is completed regardless of Stop button state.
- Q: Should the system use `mathblaster_last_player_name` as a fallback when leaderboard save was skipped, or always show "—"? → A: Always show "—" when save was skipped — no fallback lookup, avoids misattribution on shared devices.
- Q: Should End Time always show full date + time, or time-only with a midnight exception? → A: Always show full "Apr 30, 14:31" format for End Time — consistent with Start Time, midnight edge case eliminated.
- Q: Should `timerSetting` be displayed as a column in the audit log table? → A: Store only — not displayed in the current UI, reserved for future use.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Audit Log Table (Priority: P1)

A parent opens the start screen and taps the "📋 Audit Log" button. They are taken to the Audit Log screen, which shows a table of all completed game sessions sorted by date descending (newest first). Each row shows: Date & Start Time, End Time, Game Duration, Errors, End Reason, Player name, Score, and Difficulty.

**Why this priority**: The audit log table is the core deliverable. Without it, no other story has value.

**Independent Test**: Can be tested end-to-end by playing one complete game, then navigating to the Audit Log screen and verifying the entry appears with correct data.

**Acceptance Scenarios**:

1. **Given** the start screen is visible, **When** the parent taps "📋 Audit Log", **Then** the Audit Log screen opens showing a table of recorded sessions.
2. **Given** the Audit Log has multiple entries, **When** the screen renders, **Then** entries are ordered newest-first by start time.
3. **Given** a completed game session, **When** the Audit Log screen opens, **Then** the row displays start time formatted as "Apr 30, 14:23", end time in the same "Apr 30, 14:31" format, duration as "3m 12s" (or "45s" if under 60s), error count, end reason emoji label, player name (or "—"), score, and difficulty.
4. **Given** the Audit Log is empty, **When** the screen opens, **Then** the message "No games recorded yet — play a game to see your history! 🎮" is shown instead of the table.

---

### User Story 2 - Session Recording (Priority: P1)

The system automatically records an entry in the audit log whenever a game session reaches a definitive end state: all lives lost, all 10 questions completed, or the player confirmed stopping via the Stop button.

**Why this priority**: Data collection is a prerequisite for the view. This must work silently and correctly.

**Independent Test**: Play a full game to completion; open localStorage in browser DevTools and verify a valid JSON entry exists under `mathblaster_audit_log`.

**Acceptance Scenarios**:

1. **Given** a game where all 3 lives are lost, **When** the results screen appears, **Then** an entry with `endReason: "no_lives"` is appended to the audit log.
2. **Given** a game where question 10 is answered, **When** the results screen appears, **Then** an entry with `endReason: "completed"` is appended.
3. **Given** the player clicks Stop and confirms stopping, **When** the game returns to the main menu, **Then** an entry with `endReason: "stopped"` is appended.
4. **Given** the player clicks Stop and chooses "Keep Playing", **When** the game resumes, **Then** no entry is added to the audit log.
5. **Given** a Practice Mode session ends, **Then** no entry is added to the audit log.
6. **Given** the player closes the browser mid-session, **Then** no partial entry is added to the audit log.
7. **Given** `startTime` is being recorded, **When** the first question becomes visible and its countdown timer begins, **Then** the ISO 8601 timestamp is captured at that exact moment.
8. **Given** `endTime` is being recorded, **When** the results/summary screen renders, **Then** the ISO 8601 timestamp is captured at that exact moment.

---

### User Story 3 - Summary Statistics (Priority: P2)

A parent sees a summary row above the audit log table showing: total sessions, total play time, average errors per game, and most active player.

**Why this priority**: Adds meaningful at-a-glance insight beyond the raw table. Enhances the parental monitoring value.

**Independent Test**: After 3+ sessions with different players, verify the summary row calculates and displays all four stats correctly.

**Acceptance Scenarios**:

1. **Given** 5 recorded sessions, **When** the Audit Log screen opens, **Then** the summary row shows "5 sessions".
2. **Given** sessions with known durations, **When** the summary row renders, **Then** total play time equals the sum of all individual durations, formatted consistently with single-duration format.
3. **Given** sessions with varying error counts, **When** the summary row renders, **Then** average errors is shown rounded to 1 decimal place.
4. **Given** multiple players with different session counts, **When** the summary row renders, **Then** the most active player (highest session count) is displayed by name.

---

### User Story 4 - Clear Audit Log (Priority: P3)

A parent taps "🗑️ Clear Audit Log" at the bottom of the screen. A confirmation dialog appears: "Are you sure? This will delete all audit log entries." with buttons [ Yes, clear ] and [ Cancel ]. Confirming clears only the audit log; leaderboard, badges, and practice stats are unaffected.

**Why this priority**: Data management is important but secondary to viewing data.

**Independent Test**: Clear the audit log, verify `mathblaster_audit_log` is empty, verify all other localStorage keys are unchanged.

**Acceptance Scenarios**:

1. **Given** the Audit Log screen is open, **When** the parent taps "🗑️ Clear Audit Log", **Then** a confirmation dialog appears with the specified message.
2. **Given** the confirmation dialog is open, **When** the parent taps "Yes, clear", **Then** all audit log entries are deleted and the empty state message appears.
3. **Given** the confirmation dialog is open, **When** the parent taps "Cancel", **Then** the dialog closes and the audit log is unchanged.
4. **Given** the audit log is cleared, **When** checking all other localStorage keys, **Then** `mathblaster_leaderboard`, `mathblaster_badges`, and practice stats keys are all unchanged.

---

### User Story 5 - Back to Menu Navigation (Priority: P3)

A parent taps "🏠 Back to Menu" on the Audit Log screen and is returned to the start screen.

**Why this priority**: Navigation is required but trivial.

**Independent Test**: Navigate to Audit Log, tap Back to Menu, verify start screen appears.

**Acceptance Scenarios**:

1. **Given** the Audit Log screen is open, **When** the parent taps "🏠 Back to Menu", **Then** the start screen is shown.

---

### User Story 6 - FIFO Entry Limit (Priority: P4)

The audit log is capped at 100 entries. When a new session is recorded and 100 entries already exist, the oldest entry is dropped to make room.

**Why this priority**: Storage hygiene. Important for long-term use but not observable until 100+ sessions.

**Independent Test**: Seed localStorage with exactly 100 entries, play one more game, verify the total is still 100 and the oldest entry is gone.

**Acceptance Scenarios**:

1. **Given** the audit log has exactly 100 entries, **When** a new session is recorded, **Then** the oldest entry is removed and the new entry is added, keeping the total at 100.
2. **Given** the audit log has fewer than 100 entries, **When** a new session is recorded, **Then** the new entry is added without removing any existing entries.

---

### Edge Cases

- Sessions spanning midnight: both Start Time and End Time always display full date + time ("Apr 30, 14:23" / "May 1, 00:07") — no special midnight detection needed.
- What if Stop is clicked at the exact same moment question 10 completes? `"completed"` always wins — once question 10 is answered, the session is complete regardless of Stop state.
- What if two players share the device and the last known name in localStorage belongs to a different child? (player name attribution for non-leaderboard sessions TBD in clarification).
- What if two players have equal session counts in the "most active player" summary? (tie-breaking rule TBD in clarification).
- When leaderboard save is skipped: always show "—" — no fallback lookup is performed.
- What if the user clears the leaderboard — do referenced player names in audit log change? No — audit log entries are immutable after writing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a "📋 Audit Log" button on the main start screen.
- **FR-002**: System MUST record an audit log entry when a game session ends due to all lives being lost (`endReason: "no_lives"`).
- **FR-003**: System MUST record an audit log entry when question 10 is answered and the results screen appears (`endReason: "completed"`). If Stop is clicked simultaneously, `"completed"` takes precedence.
- **FR-004**: System MUST record an audit log entry when the Stop button is confirmed and the game returns to the main menu (`endReason: "stopped"`).
- **FR-005**: System MUST NOT record an entry when Stop is clicked but the player chooses "Keep Playing".
- **FR-006**: System MUST NOT record entries for Practice Mode sessions.
- **FR-007**: System MUST NOT record partial entries when the player closes the browser mid-session.
- **FR-008**: System MUST capture `startTime` as an ISO 8601 timestamp at the exact moment the first question becomes visible and the per-question countdown timer begins ticking (i.e., the player can now interact with the question).
- **FR-009**: System MUST capture `endTime` as an ISO 8601 timestamp at the moment the results/summary screen renders.
- **FR-010**: System MUST increment error count on every wrong answer AND every timer timeout (question expired without answer).
- **FR-011**: System MUST reset the session error count to 0 at the start of each new game session.
- **FR-012**: System MUST store the audit log in localStorage under key `mathblaster_audit_log` as a JSON array.
- **FR-013**: System MUST cap the audit log at 100 entries using FIFO: when the log is full, the oldest entry is removed before the new entry is added.
- **FR-014**: System MUST display the audit log table sorted newest-first by `startTime`.
- **FR-015**: System MUST display a summary row above the table with: total sessions, total play time, average errors per game, and most active player name.
- **FR-016**: System MUST calculate Game Duration at display time from `(endTime - startTime)` in milliseconds; duration is never stored.
- **FR-017**: System MUST format durations under 60 seconds as "Xs" and durations of 60 seconds or more as "Xm Ys".
- **FR-018**: System MUST display Player as "—" (em dash) when the leaderboard save was skipped, regardless of any name stored in `mathblaster_last_player_name`. Player name is only recorded when the player actively saves to the leaderboard.
- **FR-019**: ~~Removed~~ — Fallback to `mathblaster_last_player_name` is not used; see FR-018.
- **FR-020**: System MUST provide a "🗑️ Clear Audit Log" button with a confirmation dialog matching the specified text.
- **FR-021**: Clearing the audit log MUST delete only the `mathblaster_audit_log` key; all other localStorage keys MUST remain unchanged.
- **FR-022**: System MUST provide a "🏠 Back to Menu" button on the Audit Log screen.
- **FR-023**: System MUST display the empty-state message "No games recorded yet — play a game to see your history! 🎮" when the audit log is empty.
- **FR-024**: The audit log table MUST scroll horizontally on narrow screens rather than breaking layout.
- **FR-025**: Audit log entries MUST be immutable after writing — no modifications except FIFO trim.
- **FR-026**: The `timerSetting` field MUST be stored in each audit log entry but MUST NOT be displayed as a column in the audit log table (reserved for future use).
- **FR-027**: Both the Date & Start Time column and the End Time column MUST always display in "Mmm DD, HH:MM" format (e.g., "Apr 30, 14:23") — no time-only or conditional midnight formatting.

### Key Entities *(include if feature involves data)*

- **Audit Log Entry**: A record of a single completed game session. Fields: `startTime` (ISO 8601), `endTime` (ISO 8601), `errors` (integer ≥ 0), `endReason` ("no_lives" | "completed" | "stopped"), `playerName` (string or null), `score` (integer ≥ 0), `difficulty` ("Easy" | "Medium" | "Hard"), `timerSetting` (integer, seconds).
- **Audit Log**: The ordered collection of up to 100 entries, stored as a JSON array. Newest entries are appended; FIFO trim removes from the front when at capacity.
- **Summary Stats**: Derived values computed at display time from the full log: total session count, total play time (sum of all durations), average errors (total errors / session count, 1 decimal), most active player (name with highest session count).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A parent can navigate from the start screen to the Audit Log and identify the most recent game session in under 10 seconds.
- **SC-002**: Every completed game session (all three end conditions) appears in the audit log within the same session without any manual action by the user.
- **SC-003**: Zero audit log entries are created for Practice Mode sessions, mid-session browser closes, or "Keep Playing" continuations — confirmed across all three scenarios.
- **SC-004**: After 100+ games, the audit log never exceeds 100 entries and always contains the most recent 100 sessions.
- **SC-005**: Clearing the audit log leaves all other game data (leaderboard, badges, practice stats) intact — verified by checking all affected localStorage keys before and after clearing.
- **SC-006**: The audit log table renders without horizontal overflow on a screen 375px wide (iPhone SE equivalent).
- **SC-007**: All displayed timestamps reflect the device's local time zone.

## Assumptions

- The Audit Log feature applies only to the main game mode; Practice Mode is explicitly excluded.
- Player name in the audit log is recorded only when the player actively saves to the leaderboard; skipped saves always result in "—" with no fallback lookup.
- Timer timeout (question expires) is already tracked as an error in the existing game logic; the audit log simply reads this count.
- The game currently supports exactly 10 questions per session and 3 lives — these constants are treated as fixed for this feature.
- No authentication or access control is needed; the audit log is local-only and accessible to anyone using the device.
- The audit log does not sync across devices; it is a device-local record.
- Leaderboard clearing does not retroactively update player names in existing audit log entries — the log is immutable.
- The `timerSetting` field is stored in each entry for potential future use; its display in the table is a clarification point.
