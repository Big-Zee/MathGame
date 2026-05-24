# Quickstart: Game Audit Log

**Branch**: `010-game-audit-log` | **Date**: 2026-05-24

## Prerequisites

- Open `index.html` directly in a browser (no server needed — all localStorage)
- Clear site data before each scenario group: DevTools → Application → Storage → Clear site data

## Running Tests

```bash
node --test tests/audit-log-engine.test.js
# or all tests:
node --test tests/*.test.js
```

---

## Scenario 1 — Empty audit log (first use)

1. Clear site data. Open `index.html`.
2. On the start screen, press "📋 Audit Log".
3. **Expected**: Audit Log screen opens showing the message "No games recorded yet — play a game to see your history! 🎮". No table visible.
4. Press "🏠 Back to Menu". **Expected**: Start screen shown.

---

## Scenario 2 — Audit entry recorded on normal completion (all 10 questions)

1. Clear site data. Start a game on Medium difficulty with 15s timer.
2. Answer all 10 questions (any mix of correct and wrong). Note the session score and wrong answer count.
3. On the results screen, press "Skip" (do not save to leaderboard).
4. Press "🏠 Back to Menu". Open "📋 Audit Log".
5. **Expected**: Table shows 1 row with:
   - Date & Start Time: today's date + time when first question appeared
   - End Time: today's date + time when results screen appeared
   - Duration: calculated time difference in correct format
   - Errors: number of wrong answers + timer timeouts
   - End Reason: ✅ Completed
   - Player: —
   - Score: matches results screen score
   - Difficulty: Medium

---

## Scenario 3 — Audit entry recorded with player name (Save Score path)

1. Clear site data. Complete a game. On results screen, save to leaderboard as "Zbig".
2. Open "📋 Audit Log".
3. **Expected**: Row shows Player = "Zbig".

---

## Scenario 4 — Audit entry recorded via "Play Again" without Skip

1. Clear site data. Complete a game. Do NOT press Skip or Save Score.
2. Press "▶ Play Again" directly from the results screen.
3. Complete the second game. Press "🏠 Back to Menu". Open "📋 Audit Log".
4. **Expected**: Table shows 2 rows. The first (older) game has Player = "—". The second game also has Player = "—" (or name if saved).

---

## Scenario 5 — Audit entry recorded on lives exhausted (💀 No lives)

1. Clear site data. Start a game. Deliberately answer all 3 lives wrong.
2. Results screen should appear. Press "🏠 Back to Menu". Open "📋 Audit Log".
3. **Expected**: Row shows End Reason = 💀 No lives.

---

## Scenario 6 — Audit entry recorded on confirmed Stop

1. Clear site data. Start a game. Answer 3 questions. Press Stop Session → confirm stopping.
2. On stop-summary screen, press "Skip". Press "🏠 Back to Menu". Open "📋 Audit Log".
3. **Expected**: Row shows End Reason = 🛑 Stopped; Errors reflects wrong answers from those 3 questions only (skipped questions do not count).

---

## Scenario 7 — Stop → Keep Playing does NOT record entry

1. Clear site data. Start a game. Press Stop Session → press "Keep Playing" → finish all 10 questions normally.
2. Open "📋 Audit Log".
3. **Expected**: Only 1 entry (the completed game), NOT 2 entries.

---

## Scenario 8 — Practice Mode does NOT record entry

1. Clear site data. Play a full Practice Mode session to the summary screen.
2. Open "📋 Audit Log".
3. **Expected**: Empty state message (no entries).

---

## Scenario 9 — Summary statistics are correct

1. Play 3 games: "Maja" completes 2 games, "Kuba" completes 1 game. Note each game's errors.
2. Open "📋 Audit Log".
3. **Expected**:
   - Total sessions = 3
   - Total play time = sum of all 3 durations
   - Average errors = (total errors across 3 games) / 3, rounded to 1 decimal
   - Most active player = "Maja" (2 sessions vs Kuba's 1)

---

## Scenario 10 — Newest-first sort order

1. Play 3 games at different times (use DevTools to seed entries with different timestamps if needed).
2. Open "📋 Audit Log".
3. **Expected**: Rows sorted newest-first. The most recently completed game is in row 1.

---

## Scenario 11 — Clear audit log

1. (Some entries exist.) Open "📋 Audit Log".
2. Press "🗑️ Clear Audit Log". **Expected**: Confirmation dialog with text "Are you sure? This will delete all audit log entries." and buttons "Yes, clear" and "Cancel".
3. Press "Cancel". **Expected**: Dialog closes; entries unchanged.
4. Press "🗑️ Clear Audit Log" again. Press "Yes, clear".
5. **Expected**: Empty state message shown; `mathblaster_audit_log` key removed from localStorage.
6. Check DevTools: `mathblaster_leaderboard`, `mathblaster_badges`, practice stats keys all **unchanged**.

---

## Scenario 12 — FIFO cap at 100 entries

1. Use DevTools to set `mathblaster_audit_log` to a JSON array of exactly 100 entries (seed with valid objects, oldest at index 0).
2. Note the `startTime` of the entry at index 0 (oldest).
3. Complete one more game.
4. Open DevTools, inspect `mathblaster_audit_log`.
5. **Expected**: Array length = 100. The entry from step 2 is gone. The new entry is at the end (index 99).

---

## Scenario 13 — Horizontal scroll on narrow screen

1. Open `index.html`. Open browser DevTools → device simulation → iPhone SE (375px wide).
2. Navigate to "📋 Audit Log" (with entries populated).
3. **Expected**: The table scrolls horizontally; no columns are truncated or overflow the viewport; the page layout does not break.

---

## Scenario 14 — Tie-breaking for most active player

1. Seed 4 entries: "Ana" × 2, "Zbig" × 2.
2. Open "📋 Audit Log".
3. **Expected**: Summary row shows Most Active Player = "Ana" (alphabetically first among tied names).

---

## Accessibility Checks

- "📋 Audit Log" button on start screen must be keyboard-focusable with visible focus ring.
- Audit log table must have `<th scope="col">` headers for each column.
- Table rows must be readable by screen reader (no orphaned `<td>` without a header).
- Confirmation dialog must trap focus while open; Escape or "Cancel" closes it.
- All buttons must meet 44×44 px minimum touch target.
- Empty state message must be announced by screen reader (use `role="status"` or `aria-live="polite"`).
- Horizontal-scroll wrapper must not hide focusable elements from keyboard navigation.
