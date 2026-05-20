# Data Model: Theme Picker

**Feature**: Theme Picker | **Branch**: `009-theme-picker` | **Date**: 2026-05-19

## Entity 1: Theme

A named visual style for the game. Six instances exist; their definitions are immutable constants shipped in `js/theme-engine.js`.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Unique identifier; must match localStorage value (e.g., `"space"`) |
| `name` | string | Yes | Human-readable display name shown on preview card (e.g., `"Space"`) |
| `emoji` | string | Yes | Single emoji representing the theme (e.g., `"🚀"`); shown on preview card |
| `vars` | object | Yes | Map of 13 CSS custom property names to their values for this theme |
| `decorations` | string[] | Yes | Exactly 3 emoji strings used for the background decoration layer |

### `vars` object schema

Each `vars` object MUST contain exactly these 13 keys:

```
--color-bg-start       string   CSS colour value (gradient top)
--color-bg-end         string   CSS colour value (gradient bottom)
--color-primary        string   CSS colour value (main accent)
--color-accent         string   CSS colour value (secondary highlight)
--color-card-bg        string   CSS colour value (card background)
--color-card-border    string   CSS colour value (card border / glow)
--color-button-bg      string   CSS colour value (primary button fill)
--color-button-text    string   CSS colour value (primary button label)
--border-radius-btn    string   CSS length value (e.g., "12px", "24px")
--color-text           string   CSS colour value (body text)
--color-text-muted     string   CSS colour value (secondary text)
--color-surface        string   CSS colour value (secondary backgrounds, hover)
--color-border         string   CSS colour value (dividers, input outlines)
```

Validation rules:
- All 13 keys must be present; extra keys are not permitted
- Values must be valid CSS colour tokens (hex, rgb, rgba, hsl, named) or CSS length for `--border-radius-btn`
- `--color-text` on `--color-card-bg` MUST meet WCAG AA 4.5:1 contrast ratio

### The 6 Theme Instances

#### Space (default)

```json
{
  "id": "space",
  "name": "Space",
  "emoji": "🚀",
  "vars": {
    "--color-bg-start":     "#0D0D2B",
    "--color-bg-end":       "#1A0533",
    "--color-primary":      "#4FC3F7",
    "--color-accent":       "#CE93D8",
    "--color-card-bg":      "#1E2A3A",
    "--color-card-border":  "#4FC3F7",
    "--color-button-bg":    "#4FC3F7",
    "--color-button-text":  "#0D0D2B",
    "--border-radius-btn":  "12px",
    "--color-text":         "#E2E8F0",
    "--color-text-muted":   "#94A3B8",
    "--color-surface":      "#253548",
    "--color-border":       "rgba(79,195,247,0.25)"
  },
  "decorations": ["⭐", "🌙", "🚀"]
}
```

#### Ocean

```json
{
  "id": "ocean",
  "name": "Ocean",
  "emoji": "🌊",
  "vars": {
    "--color-bg-start":     "#0D2233",
    "--color-bg-end":       "#0A1628",
    "--color-primary":      "#26C6DA",
    "--color-accent":       "#FF8A65",
    "--color-card-bg":      "#0D2B2E",
    "--color-card-border":  "#26C6DA",
    "--color-button-bg":    "#26C6DA",
    "--color-button-text":  "#0D2233",
    "--border-radius-btn":  "24px",
    "--color-text":         "#E0F7FA",
    "--color-text-muted":   "#80DEEA",
    "--color-surface":      "#133844",
    "--color-border":       "rgba(38,198,218,0.25)"
  },
  "decorations": ["🌊", "🐠", "🐙"]
}
```

#### Jungle

```json
{
  "id": "jungle",
  "name": "Jungle",
  "emoji": "🌿",
  "vars": {
    "--color-bg-start":     "#0D2010",
    "--color-bg-end":       "#0A1A0E",
    "--color-primary":      "#AED581",
    "--color-accent":       "#FFD54F",
    "--color-card-bg":      "#132B12",
    "--color-card-border":  "#AED581",
    "--color-button-bg":    "#AED581",
    "--color-button-text":  "#0D2010",
    "--border-radius-btn":  "18px",
    "--color-text":         "#F1F8E9",
    "--color-text-muted":   "#C5E1A5",
    "--color-surface":      "#1A3A18",
    "--color-border":       "rgba(174,213,129,0.25)"
  },
  "decorations": ["🌿", "🦋", "🌺"]
}
```

#### Volcano

```json
{
  "id": "volcano",
  "name": "Volcano",
  "emoji": "🔥",
  "vars": {
    "--color-bg-start":     "#1A1A1A",
    "--color-bg-end":       "#2D0A00",
    "--color-primary":      "#FF7043",
    "--color-accent":       "#FFCA28",
    "--color-card-bg":      "#1F1F1F",
    "--color-card-border":  "#FF7043",
    "--color-button-bg":    "#FF7043",
    "--color-button-text":  "#1A1A1A",
    "--border-radius-btn":  "4px",
    "--color-text":         "#FBE9E7",
    "--color-text-muted":   "#FFAB91",
    "--color-surface":      "#2A2020",
    "--color-border":       "rgba(255,112,67,0.25)"
  },
  "decorations": ["🔥", "⚡", "💥"]
}
```

#### Candy

```json
{
  "id": "candy",
  "name": "Candy",
  "emoji": "🍬",
  "vars": {
    "--color-bg-start":     "#2D0A1A",
    "--color-bg-end":       "#1A0026",
    "--color-primary":      "#F06292",
    "--color-accent":       "#80CBC4",
    "--color-card-bg":      "#2A0F1F",
    "--color-card-border":  "#F06292",
    "--color-button-bg":    "#F06292",
    "--color-button-text":  "#2D0A1A",
    "--border-radius-btn":  "30px",
    "--color-text":         "#FCE4EC",
    "--color-text-muted":   "#F48FB1",
    "--color-surface":      "#3A1528",
    "--color-border":       "rgba(240,98,146,0.25)"
  },
  "decorations": ["🍬", "🌈", "⭐"]
}
```

#### Midnight

```json
{
  "id": "midnight",
  "name": "Midnight",
  "emoji": "🌙",
  "vars": {
    "--color-bg-start":     "#000000",
    "--color-bg-end":       "#1A1A1A",
    "--color-primary":      "#B0BEC5",
    "--color-accent":       "#FFD700",
    "--color-card-bg":      "#0A0A0A",
    "--color-card-border":  "#FFD700",
    "--color-button-bg":    "#1A1A1A",
    "--color-button-text":  "#B0BEC5",
    "--border-radius-btn":  "6px",
    "--color-text":         "#ECEFF1",
    "--color-text-muted":   "#78909C",
    "--color-surface":      "#222222",
    "--color-border":       "rgba(255,215,0,0.25)"
  },
  "decorations": ["🌙", "✨", "🌟"]
}
```

---

## Entity 2: ThemePreference

The player's persisted theme choice. A single string value in browser localStorage.

| Field | Type | Location | Description |
|---|---|---|---|
| value | string | `localStorage["mathblaster_theme"]` | Active theme id. One of: `"space"`, `"ocean"`, `"jungle"`, `"volcano"`, `"candy"`, `"midnight"` |

**Default behaviour**: When `localStorage["mathblaster_theme"]` is absent, empty, or contains an unrecognised value, the system treats the active theme as `"space"`.

**Write timing**: Written synchronously when the player taps a theme preview card (inside `ThemeManager.apply()`).

**Read timing**: 
1. At page load by the FOUC-prevention inline script (before first paint)
2. By `ThemeManager.init()` inside the DOMContentLoaded handler (to apply decorations)
3. By `renderThemePicker()` to determine which card shows the ✅ checkmark

---

## localStorage Key Registry (full project)

| Key | Owner | Type | Notes |
|---|---|---|---|
| `mathblaster_theme` | ThemeManager (new) | string | Active theme id |
| `mathblaster_leaderboard` | LeaderboardManager | JSON array | Top-10 entries |
| `mathblaster_leaderboard_stats` | LeaderboardManager | JSON object | Cumulative stats |
| `mathblaster_last_player_name` | LeaderboardManager | string | Last used name |
| `mathblaster_badges` | BadgeManager | JSON object | Earned badge state |
| `mathblaster_timer_preference` | TimerManager | string | Saved timer setting |
