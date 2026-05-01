# Feature Specification: Leaderboard

**Feature Branch**: `007-leaderboard`  
**Created**: 2026-05-01  
**Status**: Draft  
**Input**: User description: "Add a new feature called Leaderboard to Math Blaster"

## Clarifications

### Session 2026-05-01

- Q: Should cumulative stats be updated for all eligible game ends, even when the score doesn't make the top 10? → A: Yes — stats (totalGamesPlayed, bestScoreEver, bestAccuracyEver, difficultyCounts) update at the end of every eligible game session regardless of top-10 placement.
- Q: Beyond Practice Mode and 0-question early-stop, are there other game states that should suppress the name picker? → A: No — the three existing suppressions (Practice Mode, 0-question early-stop, score too low for full board) are exhaustive. A score of 0 with ≥1 question answered remains eligible.
- Q: After saving, should the leaderboard screen include a "Play Again" shortcut so children don't have to go via the start screen? → A: Yes — a "▶ Play Again" button is always present on the leaderboard screen (not only after saving), alongside "🏠 Back to Menu".
- Q: When the leaderboard is cleared, should `mathblaster_last_player_name` also be cleared? → A: No — keep the last player name after clearing. The next game shows the Scenario C fallback path: "+ Add new name" expands with the name pre-filled (since the name no longer exists on the now-empty leaderboard).
- Q: When two entries share the same score and the same calendar day, what is the tertiary sort key? → A: Full ISO timestamp descending — the entry saved later ranks higher. No extra data needed; sub-day precision is already available in the stored ISO date string.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Save Score After Game (Priority: P1)

After completing or early-stopping a quiz session, a child is presented with a smart name picker on the results screen that lets them save their score with a single tap (returning player) or by typing a short name (new player). The score is then stored locally for future comparison.

**Why this priority**: This is the core entry point for all leaderboard data. Without score saving, nothing else in the feature has value.

**Independent Test**: Can be fully tested by completing a game session and verifying that the name picker appears, a name can be selected or typed, Save Score stores a record in localStorage, and the leaderboard screen is shown with the new entry highlighted.

**Acceptance Scenarios**:

1. **Given** the leaderboard already has players (Scenario A), **When** the results screen appears, **Then** alphabetically sorted name buttons (each showing that player's personal best) are displayed, plus a "+ Add new name" button, a disabled Save Score button, and a Skip button.
2. **Given** a name button is tapped, **When** it becomes selected (gold highlight), **Then** the Save Score button is enabled immediately — no typing required.
3. **Given** the leaderboard is empty (Scenario B), **When** the results screen appears, **Then** no name buttons are shown and a text input is displayed auto-focused with placeholder "Enter your name...".
4. **Given** the last-used name exists on the leaderboard (Scenario C — returning player), **When** the results screen renders, **Then** that name button is pre-selected and Save Score is enabled without any user action.
5. **Given** the last-used name is NOT on the leaderboard (dropped when full), **When** the results screen renders, **Then** "+ Add new name" expands automatically with that name pre-filled in the text input.
6. **Given** "+ Add new name" is tapped, **When** the text input expands, **Then** it is auto-focused and any previously selected name button is deselected.
7. **Given** the user types in the text input, **When** at least 1 character is entered, **Then** the Save Score button becomes enabled and any selected name button is deselected.
8. **Given** a name is typed that matches an existing player (case-insensitive), **When** Save Score is pressed, **Then** the entry is stored under the existing player's capitalisation (e.g., "zbig" saves as "Zbig").
9. **Given** Save Score is pressed, **When** the score is saved, **Then** the leaderboard screen is shown immediately with the new entry highlighted in gold.
10. **Given** the session was stopped early at 0 questions answered, **When** the results screen appears, **Then** no name picker is shown (score is ineligible).
11. **Given** a Practice Mode session ends, **When** the results screen appears, **Then** no name picker is shown (practice scores are ineligible).
12. **Given** pressing Enter in the text input, **When** Save Score is enabled, **Then** the score is saved (Enter triggers Save Score).

---

### User Story 2 — Leaderboard Screen (Priority: P2)

A child can view the top 10 all-time scores in a ranked table, see summary stats, spot their latest score highlighted in gold, and celebrate a new personal best with a banner.

**Why this priority**: Viewing the leaderboard is the primary motivation for saving scores. It is the "reward" half of the save-and-compare loop.

**Independent Test**: Can be fully tested by navigating to the leaderboard screen (via the start screen button or after saving) and verifying the ranked list renders correctly with all required columns, the gold highlight on the latest entry, the stats summary, and (when applicable) the personal best banner.

**Acceptance Scenarios**:

1. **Given** the leaderboard has entries, **When** the leaderboard screen is opened, **Then** up to 10 entries are shown sorted by score descending; ties broken by date descending.
2. **Given** ranks 1–3, **When** displayed, **Then** medals 🥇🥈🥉 are shown; ranks 4–10 use plain numbers.
3. **Given** a session was stopped early, **When** its entry is displayed, **Then** 🛑 appears after the score.
4. **Given** the most recently saved score, **When** visible on the leaderboard, **Then** its row is highlighted in soft gold.
5. **Given** the latest saved score is rank 1 overall, **When** the leaderboard is shown, **Then** a banner reads "🎉 New Personal Best! You're #1!".
6. **Given** the leaderboard is opened, **When** the stats section is rendered, **Then** it shows: total games played, best score ever, best accuracy ever, and favourite difficulty (most-played difficulty).
7. **Given** the leaderboard is empty, **When** it is opened, **Then** the message "No scores yet — play a game and be the first on the board! 🎮" is displayed.
8. **Given** the leaderboard screen, **When** rendered, **Then** a "🏠 Back to Menu" button is visible and returns the user to the start screen.
9. **Given** the leaderboard screen, **When** rendered, **Then** a "▶ Play Again" button is visible and starts a new game session immediately (skipping the start screen).

---

### User Story 3 — Access Leaderboard from Start Screen (Priority: P2)

A child can open the leaderboard at any time from the start screen before or after playing, so they can check top scores or plan their next attempt.

**Why this priority**: Without entry from the start screen the leaderboard is only reachable after saving — which blocks casual browsing and limits motivational impact.

**Independent Test**: Can be fully tested by verifying the "🏆 Leaderboard" button exists on the start screen and navigates to the leaderboard screen.

**Acceptance Scenarios**:

1. **Given** the start screen, **When** rendered, **Then** a "🏆 Leaderboard" button is visible.
2. **Given** the "🏆 Leaderboard" button, **When** tapped, **Then** the leaderboard screen is shown.

---

### User Story 4 — Skip Saving (Priority: P2)

A child can choose not to save their score without being forced to interact with the name picker. The Skip button is always visible and exits the save flow immediately.

**Why this priority**: A forced interaction would frustrate children who just want to play again. Skip is the safety valve that keeps the feature optional.

**Independent Test**: Can be fully tested by completing a game and pressing Skip — verifying no entry is stored and the user returns to the start screen (or wherever Skip navigates).

**Acceptance Scenarios**:

1. **Given** the results screen with the name picker, **When** it is rendered, **Then** a Skip button is always visible.
2. **Given** the Skip button is pressed, **When** no name has been entered or selected, **Then** no entry is saved and the player is returned to the start screen.

---

### User Story 5 — 10-Entry Cap & "Didn't Make the Board" Message (Priority: P3)

When the leaderboard is full (10 entries), a new score that does not beat the current lowest entry is not saved, and the player sees an encouraging message instead of the name picker.

**Why this priority**: The cap keeps the screen clean and readable. The message keeps the experience positive.

**Independent Test**: Can be fully tested by filling the leaderboard with 10 entries and then completing a game with a score equal to or lower than the 10th entry — verifying the message appears and no name picker is shown.

**Acceptance Scenarios**:

1. **Given** the leaderboard has 10 entries and the new score is lower than or equal to the lowest entry, **When** the results screen appears, **Then** no name picker is shown and the message "Great effort! Keep playing to make the top 10! 💪" is displayed.
2. **Given** the leaderboard has 10 entries and the new score beats the lowest entry, **When** the results screen appears, **Then** the name picker is shown as normal; after saving, the lowest entry is replaced.

---

### User Story 6 — Clear Leaderboard (Priority: P3)

A child (or parent) can clear all leaderboard entries from the leaderboard screen, with a confirmation step to prevent accidental deletion. Clearing does not affect badges or Practice Mode stats.

**Why this priority**: Data hygiene for shared devices and for children who want a fresh start.

**Independent Test**: Can be fully tested by opening the leaderboard screen, pressing Clear Leaderboard, confirming, and verifying localStorage is cleared while badge and practice stats data remain intact.

**Acceptance Scenarios**:

1. **Given** the leaderboard screen, **When** rendered, **Then** a "🗑️ Clear Leaderboard" button is visible at the bottom.
2. **Given** "🗑️ Clear Leaderboard" is pressed, **When** the confirmation prompt appears, **Then** it reads "Are you sure? This will delete all saved scores. 🗑️" with "Yes, clear" and "Cancel" options.
3. **Given** "Yes, clear" is pressed, **When** the leaderboard is cleared, **Then** all leaderboard entries and cumulative stats are removed; badge data and Practice Mode stats are unaffected.
4. **Given** "Cancel" is pressed, **When** the prompt closes, **Then** leaderboard data is unchanged.
5. **Given** the leaderboard is cleared, **When** the next game session ends, **Then** the last-used name is still stored — the name picker shows the Scenario C fallback path: "+ Add new name" expands automatically with the last-used name pre-filled.

---

### Edge Cases

- What happens when two entries have the same score and the same calendar day? → Full ISO timestamp (sub-day precision) is used as the tiebreaker; the later save ranks higher. Two entries with truly identical timestamps are astronomically unlikely but would be implementation-stable (insertion order).
- What happens when localStorage is unavailable or full? → Save fails gracefully with no crash; the player is not blocked from continuing.
- What happens when a name is exactly 12 characters? → Accepted normally.
- What happens when a name input exceeds 12 characters? → Input is capped at 12 characters; excess characters cannot be typed.
- What happens when the leaderboard has fewer than 10 entries and a new score is submitted? → Entry is always added (no cap logic triggered).
- What happens when the leaderboard has exactly 10 entries and the new score equals the 10th place score but with a later date? → The new score does NOT replace the existing entry (equal score ≤ lowest, so no name picker shown).
- What happens when all 10 entries belong to the same player? → Name picker still shows that one name button; personal best is their highest score.
- What happens if the player taps Save Score twice quickly? → Second tap is ignored; only one entry is stored per session.

---

## Requirements *(mandatory)*

### Functional Requirements

**Name Picker — General**

- **FR-001**: The system MUST display a name picker section on the results screen after any eligible game session ends (normal completion or early stop with ≥1 question answered, non-practice mode).
- **FR-002**: The name picker MUST NOT appear when the session was stopped early at 0 questions answered.
- **FR-003**: The name picker MUST NOT appear for Practice Mode sessions.
- **FR-004**: The name picker MUST NOT appear when the leaderboard has 10 entries and the new score does not exceed the current lowest entry; instead an encouraging message MUST be shown.
- **FR-004a**: The three suppressions in FR-002, FR-003, and FR-004 are exhaustive — no other session state suppresses the name picker. A session where ≥1 question was answered in normal mode is eligible even if the score is 0.
- **FR-005**: A Skip button MUST always be visible on the name picker and MUST allow the player to exit without saving.

**Name Picker — Existing Players (Scenario A)**

- **FR-006**: When the leaderboard contains at least one entry, the name picker MUST display one button per unique player name, sorted alphabetically (A→Z), each showing the player's personal best score.
- **FR-007**: A "+ Add new name" button MUST always be the last item in the name picker button list.
- **FR-008**: Tapping a name button MUST select it (gold highlight) and immediately enable the Save Score button.
- **FR-009**: Tapping "+ Add new name" MUST expand a text input below the buttons and auto-focus it; any selected name button MUST be deselected.
- **FR-010**: Typing in the text input MUST deselect any currently selected name button.

**Name Picker — Empty State (Scenario B)**

- **FR-011**: When the leaderboard is empty, the name picker MUST show only a text input (no name buttons), with the prompt "You're the first player! Enter your name:".

**Name Picker — Returning Player (Scenario C)**

- **FR-012**: Before the results screen renders, the system MUST read the last-used player name from storage and, if it matches a leaderboard entry (case-insensitive), pre-select that name button so Save Score is enabled without user action.
- **FR-013**: If the last-used name is not on the leaderboard, "+ Add new name" MUST expand automatically with that name pre-filled in the text input.

**Name Picker — Input Rules**

- **FR-014**: The text input MUST enforce a maximum of 12 characters.
- **FR-015**: The Save Score button MUST remain disabled until a name button is selected OR at least 1 character is typed in the text input.
- **FR-016**: Pressing Enter while the text input is focused and Save Score is enabled MUST trigger saving.
- **FR-017**: Name matching MUST be case-insensitive; when a submitted name matches an existing player's name, the entry MUST be stored under the existing capitalisation.

**Save & Storage**

- **FR-018**: Pressing Save Score MUST create a score entry containing: name, score, stars (1–3), difficulty (Easy/Medium/Hard), timer setting (e.g. "15s"), stoppedEarly (boolean), date (ISO string), accuracy (percentage), bestStreak.
- **FR-019**: Saved entries MUST be stored in localStorage under the key `mathblaster_leaderboard` as a JSON array capped at 10 entries.
- **FR-020**: When adding a new entry to a full leaderboard, the entry with the lowest score (earliest date for equal scores) MUST be removed to make room.
- **FR-021**: Cumulative stats (totalGamesPlayed, bestScoreEver, bestAccuracyEver, difficultyCounts) MUST be updated at the end of every eligible game session — regardless of whether the resulting score qualifies for a top-10 leaderboard entry — and stored under `mathblaster_leaderboard_stats`.
- **FR-022**: The last-used player name MUST be stored under `mathblaster_last_player_name` after each successful save.
- **FR-023**: After saving, the leaderboard screen MUST open automatically with the new entry highlighted in gold.

**Leaderboard Screen — Table**

- **FR-024**: The leaderboard screen MUST display up to 10 entries sorted by: (1) score descending, (2) full ISO timestamp descending for equal scores. The human-readable date column ("Apr 30") is display-only and does not affect sort order.
- **FR-025**: Ranks 1–3 MUST use medal emojis (🥇🥈🥉); ranks 4–10 MUST use plain numbers.
- **FR-026**: Each row MUST show: rank, name, score, star rating, difficulty, timer setting, date (human-readable: "Apr 30").
- **FR-027**: Entries from early-stopped sessions MUST show 🛑 after the score.
- **FR-028**: The most recently saved entry MUST be highlighted in a soft gold row.

**Leaderboard Screen — Stats & Banner**

- **FR-029**: A stats summary MUST be displayed above the table showing: total games played, best score ever, best accuracy ever, favourite difficulty (mode of difficultyCounts).
- **FR-030**: If the latest saved score is rank 1, a personal best banner reading "🎉 New Personal Best! You're #1!" MUST be displayed at the top of the leaderboard screen.
- **FR-031**: When the leaderboard is empty, the message "No scores yet — play a game and be the first on the board! 🎮" MUST be displayed instead of the table.

**Leaderboard Screen — Actions**

- **FR-032**: A "🏠 Back to Menu" button MUST be present on the leaderboard screen and return the user to the start screen.
- **FR-032a**: A "▶ Play Again" button MUST be present on the leaderboard screen at all times (not only after saving) and MUST start a new game session immediately, bypassing the start screen.
- **FR-033**: A "🗑️ Clear Leaderboard" button MUST be present at the bottom of the leaderboard screen.
- **FR-034**: Pressing Clear Leaderboard MUST show a confirmation prompt before deleting any data.
- **FR-035**: Confirming the clear MUST remove all entries from `mathblaster_leaderboard` and reset `mathblaster_leaderboard_stats`; badge data and Practice Mode stats MUST be unaffected. `mathblaster_last_player_name` MUST NOT be cleared — the stored name is kept so the next game pre-fills it via the Scenario C fallback path (+ Add new name expanded with name pre-filled).

**Start Screen**

- **FR-036**: The start screen MUST display a "🏆 Leaderboard" button that navigates to the leaderboard screen.

**Responsiveness & Accessibility**

- **FR-037**: Name picker buttons MUST have a minimum width of 120px and MUST wrap cleanly on tablet and desktop viewports.
- **FR-038**: All features MUST function entirely offline — no network requests.

### Key Entities

- **LeaderboardEntry**: Represents a single saved game session. Attributes: name (string, max 12 chars), score (integer), stars (1–3), difficulty (Easy/Medium/Hard), timerSetting (string, e.g. "15s"), stoppedEarly (boolean), date (ISO 8601 string), accuracy (0–100 number), bestStreak (integer).
- **LeaderboardStats**: Cumulative statistics that persist independently of the capped entry list. Attributes: totalGamesPlayed (integer), bestScoreEver (integer), bestAccuracyEver (number), difficultyCounts ({ Easy, Medium, Hard } — integer counts).
- **NameButton**: UI element representing a unique player on the leaderboard. Derived at render time from current leaderboard entries. Displays: player name, personal best score for that player.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A returning player can save their score in 1 tap (pre-selected name) — zero additional interactions required after the results screen appears.
- **SC-002**: A first-time player can enter their name and save in under 15 seconds from the moment the results screen appears.
- **SC-003**: The leaderboard screen loads and renders the full ranked table in under 1 second on any modern device with data stored locally.
- **SC-004**: Clearing the leaderboard takes at most 2 user actions (press button + confirm) and completes without page reload.
- **SC-005**: All leaderboard operations work with zero network connectivity — 100% offline capable.
- **SC-006**: Stats remain accurate after 50+ save/clear cycles (no data corruption or cumulative drift).
- **SC-007**: Name picker buttons render without horizontal overflow on viewports ≥ 320px wide, wrapping to new rows as needed.

---

## Assumptions

- The game currently uses vanilla HTML/CSS/JavaScript with localStorage for all persistence (consistent with existing features such as badges and adjustable timer).
- The results screen already exists; the name picker will be added to it as a new section.
- "Stars" (1–3) are already computed by the game engine at session end and are available on the results screen.
- "Accuracy" and "bestStreak" are already tracked during a quiz session and available at results time.
- "stoppedEarly" flag is already set by the Stop Session feature and available at results time.
- "timerSetting" is already stored in localStorage (from the Adjustable Timer feature) and readable at results time.
- The start screen already exists and has space for an additional button.
- Practice Mode is a distinct mode that the game already distinguishes from the normal quiz mode.
- Sorting is applied at read time (not stored), so entries in localStorage may be in insertion/replacement order.
- "Favourite difficulty" in stats is derived from the difficulty with the highest count in `difficultyCounts`; if two difficulties tie, the one that appears first alphabetically is used.
- The leaderboard does not need to support multiple simultaneous users; it is a single-device, single-session feature.
- No accessibility requirements beyond basic tap/click interaction and keyboard Enter support are specified for this version.
