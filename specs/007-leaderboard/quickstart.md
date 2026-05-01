# Quickstart: Leaderboard

**Branch**: `007-leaderboard` | **Date**: 2026-05-01

## Prerequisites

- Open `index.html` directly in a browser (no server needed — all localStorage)
- Clear site data before each scenario group: DevTools → Application → Storage → Clear site data

## Running Tests

```bash
node --test tests/leaderboard-engine.test.js
# or all tests:
node --test tests/*.test.js
```

---

## Scenario 1 — First-ever game (Scenario B name picker)

1. Clear site data. Open `index.html`.
2. Start a game, answer at least 1 question, let it complete normally.
3. **Expected**: Results screen shows prompt "You're the first player! Enter your name:" with a text input, no name buttons, Save Score disabled, Skip visible.
4. Type "Maja" (≥1 char). **Expected**: Save Score enables.
5. Press Save Score. **Expected**: Leaderboard screen opens; one row showing Maja's entry highlighted in gold; stats panel shows "1 game played".
6. Press "🏠 Back to Menu". **Expected**: Start screen shown.

---

## Scenario 2 — Returning player pre-selected (Scenario C match)

1. (Continue from Scenario 1 — "Maja" is saved and `mathblaster_last_player_name = "Maja"`.)
2. Start and complete another game.
3. **Expected**: Results screen shows Maja's button **pre-selected** (gold highlight), Save Score **already enabled** — zero taps required.
4. Press Save Score immediately. **Expected**: Leaderboard screen opens with new entry highlighted.

---

## Scenario 3 — Existing players, new name (Scenario A + "+ Add new name")

1. (Leaderboard has at least one entry.)
2. Complete a game. On the results screen:
   - **Expected**: Name buttons visible (alphabetical), "+ Add new name" last, Save Score disabled.
3. Tap "+ Add new name". **Expected**: Text input expands, auto-focused; any selected button deselects.
4. Type "Kuba". **Expected**: Save Score enables.
5. Press Save Score. **Expected**: Leaderboard shows new "Kuba" entry in gold.

---

## Scenario 4 — Case-insensitive name matching

1. (Leaderboard contains "Zbig".)
2. Complete a game. Tap "+ Add new name". Type "zbig". Press Save Score.
3. **Expected**: Entry is stored as "Zbig" (existing capitalisation), not "zbig".
4. Check leaderboard — no duplicate "zbig" button; only "Zbig" name button shown.

---

## Scenario 5 — Score too low for full leaderboard

1. Fill leaderboard with 10 entries (use DevTools to set `mathblaster_leaderboard` directly if needed; all entries with score ≥ 100).
2. Complete a game scoring 0–99 points (answer mostly wrong with a short timer).
3. **Expected**: Results screen shows "Great effort! Keep playing to make the top 10! 💪"; no name picker shown.

---

## Scenario 6 — Score beats full leaderboard

1. (Leaderboard has 10 entries; lowest score is 50.)
2. Complete a game scoring ≥51.
3. **Expected**: Name picker shown normally. After saving, leaderboard shows 10 entries; the lowest previous entry is gone; new entry highlighted in gold.

---

## Scenario 7 — Early-stop with ≥1 question answered

1. Start a game. Answer 1 question. Press Stop Session.
2. **Expected**: Stop Summary screen shows name picker (not suppressed).
3. Save with a name. **Expected**: Leaderboard entry has 🛑 shown after score.

---

## Scenario 8 — Early-stop at 0 questions

1. Start a game. Immediately press Stop Session (before answering).
2. **Expected**: Stop Summary screen shows NO name picker.

---

## Scenario 9 — Practice Mode (ineligible)

1. Play a practice session to completion.
2. **Expected**: Practice summary screen shows NO name picker.

---

## Scenario 10 — View leaderboard from start screen

1. From the start screen, press "🏆 Leaderboard".
2. **Expected**: Leaderboard screen shown (with existing entries or empty-state message).
3. Press "▶ Play Again". **Expected**: New game starts immediately.

---

## Scenario 11 — Clear leaderboard

1. Open leaderboard (with entries).
2. Press "🗑️ Clear Leaderboard". **Expected**: Confirmation modal appears.
3. Press "Cancel". **Expected**: Entries unchanged; modal closes.
4. Press "🗑️ Clear Leaderboard" again. Press "Yes, clear".
5. **Expected**: Empty-state message shown; `mathblaster_leaderboard` removed; `mathblaster_leaderboard_stats` reset.
6. Check DevTools: `mathblaster_last_player_name` still present (not cleared).
7. Complete a game. **Expected**: Results screen shows "+ Add new name" expanded with the last name pre-filled (Scenario C fallback).

---

## Scenario 12 — Personal best banner

1. (Player "Zbig" has entries; Zbig's highest score is 150.)
2. Play a game as Zbig scoring ≥151 (enough to be rank 1).
3. Save as Zbig.
4. **Expected**: Leaderboard screen shows banner "🎉 New Personal Best! You're #1!" at top; Zbig's new entry highlighted gold in row 1.

---

## Scenario 13 — Returning player after clear (Scenario C fallback)

1. (Last used name is "Zbig"; leaderboard has just been cleared — no entries.)
2. Complete a game.
3. **Expected**: Results screen shows "+ Add new name" expanded with "Zbig" pre-filled (Scenario C fallback path — name stored but not on empty leaderboard).

---

## Scenario 14 — Stats panel accuracy

1. Play 3 games (not necessarily saving all — score may be too low). Note scores and difficulties.
2. Open leaderboard. Check stats panel.
3. **Expected**: "Total games played" = 3 (even if 0 or 1 entries were saved to top-10).
4. **Expected**: "Best score ever" reflects the highest score seen across all 3 games.

---

## Accessibility Checks

- Tab through name picker buttons — each must be focusable with visible focus ring.
- Screen reader: leaderboard table must have `<th scope="col">` headers and each row's rank cell labelled.
- Gold highlight row must have `aria-label` or `aria-current` to announce to screen readers.
- Confirmation modal must trap focus while open; Escape key or Cancel closes it.
- All buttons meet 44×44 px minimum touch target.
- Gold highlight colour must pass 3:1 contrast ratio against text.
