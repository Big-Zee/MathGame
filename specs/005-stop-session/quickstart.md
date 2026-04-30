# Quickstart: Stop Session

**Branch**: `005-stop-session` | **Date**: 2026-04-30

Integration scenarios for manual smoke testing and acceptance validation.

---

## Scenario 1 — Stop Button Visible on Game Screen, Absent Elsewhere (US1)

**Steps**:
1. Load page → verify `#screen-start`: no `#btn-stop-game` visible
2. Click ▶ Play! → `#screen-game` appears
3. Verify `#btn-stop-game` (⛔ Stop) is visible in the top-right corner of the card
4. Answer question 1 (feedback phase) → verify `#btn-stop-game` still visible
5. Click 📚 Practice Mode → navigate through operation + difficulty selectors into `#screen-practice-session`
6. Verify `#btn-stop-game` is NOT visible anywhere in the practice flow
7. Return to Start screen → verify `#btn-stop-game` is NOT visible

**Expected result**: `#btn-stop-game` present only within `#screen-game`.

---

## Scenario 2 — Confirmation Overlay and Keep Playing (US2)

**Steps**:
1. Start a game, answer question 1 (any answer)
2. While in question 2 (question phase), click ⛔ Stop
3. Verify overlay appears with:
   - Text: "Are you sure you want to stop? 🤔"
   - Subtitle: "Your progress so far will be shown."
   - Buttons: "Yes, stop 🛑" and "Keep playing ▶️"
4. Verify focus is on "Keep playing ▶️"
5. Note current score and lives
6. Click "Keep playing ▶️"
7. Verify overlay is gone; game is on same question with same score and lives
8. Verify focus returns to `#btn-stop-game`

**Expected result**: Overlay dismisses cleanly; game state unchanged.

---

## Scenario 3 — Escape Key Dismisses Overlay (US2 edge case)

**Steps**:
1. Start a game, click ⛔ Stop
2. Press Escape key
3. Verify overlay dismisses; game resumes

**Expected result**: Same as "Keep playing ▶️".

---

## Scenario 4 — Timer Pauses and Resumes (US3)

**Steps**:
1. Start a game; note the countdown bar
2. Wait until approximately 5 seconds remain (bar at ~33% for 15s timer)
3. Click ⛔ Stop → verify bar freezes immediately
4. Wait 3 full seconds (count "one thousand one…")
5. Click "Keep playing ▶️"
6. Verify bar width is the same as when Stop was clicked (±1 CSS pixel)
7. Verify countdown resumes from that position (does not reset to full)

**Expected result**: SC-002 — bar width identical before and after overlay.

---

## Scenario 5 — Timer Already Paused (Feedback Phase Stop + Resume) (US3 edge case)

**Steps**:
1. Start a game, answer question 1 (timer stops during feedback)
2. While in feedback phase (before next question), click ⛔ Stop
3. Wait 2 seconds
4. Click "Keep playing ▶️"
5. Verify game advances to question 2 normally; countdown starts fresh for question 2

**Expected result**: No double-start; game flow unaffected.

---

## Scenario 6 — Early-Stop Summary Stats (US4)

**Steps**:
1. Start a game with 15s timer
2. Answer exactly 6 questions: 4 correct, 2 wrong (do NOT let timer expire)
   - Correct: select the right answer
   - Wrong: select a wrong answer
3. On question 7, click ⛔ Stop → "Yes, stop 🛑"
4. Verify `#screen-stop-summary` shows:
   - Header: "Session stopped early 🛑"
   - "6 of 10 questions answered"
   - "4 correct ✅"
   - "2 incorrect ❌"
   - "67% accuracy" (4/6 = 66.67% → rounds to 67%)
   - Score total (40 pts base + streak bonuses + speed bonuses if applicable)
   - Hearts remaining (depends on wrongs: 2 wrong → 1 life lost → 2 hearts if no game-over)
   - Star rating: ⭐⭐☆ (67% → 2 stars, 50-79% band)
   - Message: "Great session, keep building on this! 💪"

**Expected result**: SC-003 — all stats arithmetically correct.

---

## Scenario 7 — Zero Questions Answered (US4 edge case)

**Steps**:
1. Start a game; immediately click ⛔ Stop → "Yes, stop 🛑"
2. Verify stop summary shows:
   - "0 of 10 questions answered"
   - "0 correct ✅", "0 incorrect ❌", "0% accuracy"
   - Score: 0
   - No stars (or 0 stars)
   - Message: "You didn't answer any questions yet — give it a go! 😊"
   - Only "🏠 Main Menu" button visible; "🔄 Play Again" is hidden

**Expected result**: FR-010 — zero edge case handled correctly; no score saved.

---

## Scenario 8 — Navigation Buttons (US5)

**Steps**:
1. Stop after answering at least 1 question
2. Verify both buttons visible: "🏠 Main Menu" and "🔄 Play Again"
3. Click "🏠 Main Menu" → verify `#screen-start` is shown
4. Repeat: stop after 1+ question → click "🔄 Play Again"
5. Verify a new 10-question game begins with the same timer setting

**Expected result**: FR-011, FR-012, FR-013.

---

## Scenario 9 — Early-Stop High Score with 🛑 Indicator (US6)

**Pre-condition**: Clear localStorage (open DevTools → Application → Clear site data).

**Steps**:
1. Start a game; answer 5 questions, all correct; stop early
2. Note score on stop summary
3. Click "🏠 Main Menu"
4. Verify `#screen-start` high score shows "Best: Xpts 🛑"
5. Play a full 10-question game that does NOT beat the early-stop score
6. Return to Start screen → verify "🛑" is still present
7. Play a full 10-question game that DOES beat the early-stop score
8. Return to Start screen → verify "🛑" is gone; high score shows "Best: Ypts" (no 🛑)

**Expected result**: FR-014, FR-015, SC-005.

---

## Scenario 10 — Double-Tap Prevention

**Steps**:
1. Start a game; click ⛔ Stop (overlay appears)
2. Click ⛔ Stop again while overlay is still showing
3. Verify no second overlay appears; no errors in console

**Expected result**: `#btn-stop-game` click is ignored while `stopOverlayActive` is `true`.

---

## Regression Checks

After implementing Stop Session, verify existing features are unaffected:

| Check | Expected |
|-------|---------|
| Full 10-question game → normal results screen | `#screen-results` with "Round Complete! 🎉", score-based stars |
| Play Again from results screen | New game starts with same timer setting |
| Timer selector on Start screen | ◀/▶ still cycle; preference saved/restored |
| Practice Mode (all 4 screens) | No Stop button visible; practice flow unchanged |
| High score from completed game | No 🛑 indicator |
| Keyboard navigation (Tab/Enter/Space) | All buttons accessible |
