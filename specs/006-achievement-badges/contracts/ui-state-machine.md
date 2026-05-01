# Contract: UI State Machine — Achievement Badges

**Feature**: `006-achievement-badges` | **Date**: 2026-05-01

---

## New Screens and Overlays

This feature adds one new full screen and one new overlay to the existing 8-screen application.

---

## `#screen-badges` — Badges Screen

### Entry / Exit

| From | Trigger | To |
|------|---------|-----|
| `#screen-start` | Tap "🏅 Badges" button | `#screen-badges` |
| `#screen-badges` | Tap "← Back" button | `#screen-start` |

No other screens can navigate to or from `#screen-badges`.

### On Entry

1. `clearBadgesNew()` — resets the unviewed counter.
2. `updateBadgesButton()` — refreshes the Start screen button label (side effect for next visit).
3. `renderBadgesScreen()` — populates the badge grid from `getBadgeStore()`.
4. `showScreen('screen-badges')`.

### Screen Layout

```
┌─────────────────────────────────┐
│  ← Back          🏅 Badges       │
│                                  │
│  You've earned X out of 18       │
│  badges! 🏅                      │
│                                  │
│  🎯 Accuracy          3 / 5 earned│
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│  │ 🎯 │ │ 🎩 │ │ 🔥 │ │ ⚡ │ │ 💪 ││
│  │ On │ │ -- │ │ -- │ │ -- │ │ -- ││
│  └────┘ └────┘ └────┘ └────┘ └────┘│
│                                  │
│  ⏱️ Speed            1 / 3 earned  │
│  [badge grid row]                │
│  ...                             │
└─────────────────────────────────┘
```

**Badge card — earned state**: full colour, emoji prominent, name below, "Unlocked May 1" in small text.

**Badge card — unearned state**: greyed out (opacity 0.35), emoji greyed, name below, short hint in small italic text.

### Accessibility

- `#screen-badges` has `role="main"` and `<h1>` reading "🏅 Badges".
- Each badge section has a `<h2>` heading.
- Each badge card is a `<div role="img">` with `aria-label="[Badge name] — [earned: Unlocked May 1 / unearned: hint]"`.
- "← Back" button has `aria-label="Back to start screen"`.
- First focused element on entry: "← Back" button.

---

## `#badge-unlock-popup` — Badge Unlock Popup Overlay

### Visibility States

| State | Condition |
|-------|-----------|
| Hidden | No badges in popup queue (`badgePopupQueue.length === 0`) |
| Visible | Queue non-empty; showing `badgePopupQueue[0]` |

### Positioning

- `position: fixed` overlay above all game content.
- `z-index`: above game UI and feedback, but BELOW the stop-confirm overlay.
- Appears centred at top-centre of the viewport (does not block the answer area).
- Does NOT block pointer events on choice buttons (appears only when choice buttons are disabled — i.e. in feedback phase).

### Popup Content

```
┌──────────────────────────────┐
│  🎉 New Badge Unlocked!       │
│                               │
│     🏎️                        │
│  Speed Demon                  │
│  You answered in under 3      │
│  seconds!                     │
└──────────────────────────────┘
```

### Lifecycle

```
Badge earned
    │
    ▼
badgePopupQueue.push(badgeId)
    │
    ▼
showNextBadgePopup()
    │
    ├── Populate #badge-unlock-popup with badge data
    ├── Set aria-live="assertive" announcement
    ├── Show popup (remove hidden attribute)
    ├── badgePopupTimer = setTimeout(dismissCurrentPopup, 3000)
    │
    ├── [User taps popup] → dismissCurrentPopup()
    │
    └── [3 seconds elapse] → dismissCurrentPopup()
                                    │
                                    ▼
                          badgePopupQueue.shift()
                                    │
                          ┌─────────┴──────────┐
                          │ queue empty?        │ queue has more?
                          ▼                     ▼
                  badgePopupCallback()   showNextBadgePopup()
                  (advanceRound or
                   screen transition)
```

### Interruption Rules

- The popup NEVER appears while choice buttons are active (question phase).
- The popup NEVER pauses or resets an already-running countdown timer.
- Dismissing the popup does NOT trigger `stopTimer()` or `resumeTimer()`.
- The popup CAN appear during the feedback phase of a game (timer is already stopped).
- The popup CAN appear during the transition between `stopPractising()` and `showScreen('screen-practice-summary')`.

### Accessibility

- `#badge-unlock-popup` has `role="status"` and `aria-live="polite"` when queue is building (first in sequence); `aria-live="assertive"` on each popup show.
- Focus is NOT moved to the popup (it should not interrupt keyboard users mid-game).
- Keyboard: Escape key dismisses the current popup early (consistent with stop-confirm overlay pattern).
- `aria-label` on the popup: "New badge unlocked: [badge name]. [description]."

---

## Start Screen Button States

| State | Button Label | Condition |
|-------|-------------|-----------|
| No new badges | `🏅 Badges` | `getBadgesNew() === 0` |
| New badges | `🏅 Badges (N new!)` | `getBadgesNew() > 0` |

Updated by `updateBadgesButton()`, called:
- On `showScreen('screen-start')` (every Start screen load).
- Immediately after `clearBadgesNew()` (when Badges screen is opened).

---

## Screen Navigation Map (updated)

```
#screen-start ──────────────────────── Play! ──────────────► #screen-game
     │                                                              │
     │◄─────── 🏠 Main Menu (results/stop/practice) ───────────────┤
     │                                                              │
     ├──── 🏅 Badges ──────────────► #screen-badges                │
     │                    ◄── Back ┘                               │
     │                                                    [10 Qs done or lives=0]
     ├──── Practice ──────────────► #screen-practice-op             │
                                         │                          ▼
                                         ▼                    #screen-results
                                  #screen-practice-diff              │
                                         │                          ▼
                                         ▼                   [Play Again] → #screen-game
                                  #screen-practice-session
                                         │
                                  [Stop Practising]
                                         │
                                         ▼
                                  #screen-practice-summary
                                         │
                                  [Back to Start] → #screen-start
```

`#screen-stop-summary` (from feature 005) is omitted for brevity but follows the same pattern as `#screen-results`.
