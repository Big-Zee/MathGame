// Leaderboard engine — pure logic module, no DOM

const KEY_LEADERBOARD    = 'mathblaster_leaderboard';
const KEY_STATS          = 'mathblaster_leaderboard_stats';
const KEY_LAST_NAME      = 'mathblaster_last_player_name';
const MAX_ENTRIES        = 10;

// ── Defaults ───────────────────────────────────────────────────────────────

function defaultStats() {
  return {
    totalGamesPlayed: 0,
    bestScoreEver: 0,
    bestAccuracyEver: 0,
    difficultyCounts: { Easy: 0, Medium: 0, Hard: 0, Standard: 0 },
  };
}

// ── Leaderboard read / write ───────────────────────────────────────────────

export function loadLeaderboard() {
  try {
    const raw = globalThis.localStorage?.getItem(KEY_LEADERBOARD);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveEntry(entry) {
  try {
    let entries = loadLeaderboard();
    entries.push(entry);
    if (entries.length > MAX_ENTRIES) {
      // Drop entry with lowest score; break ties by earliest date
      const sorted = sortLeaderboard(entries);
      sorted.pop(); // remove the last (lowest score, earliest date)
      entries = sorted;
    }
    globalThis.localStorage?.setItem(KEY_LEADERBOARD, JSON.stringify(entries));
    return entry;
  } catch {
    return entry;
  }
}

// ── Stats read / write ─────────────────────────────────────────────────────

export function loadStats() {
  try {
    const raw = globalThis.localStorage?.getItem(KEY_STATS);
    if (!raw) return defaultStats();
    const parsed = JSON.parse(raw);
    if (typeof parsed.totalGamesPlayed !== 'number') return defaultStats();
    const counts = parsed.difficultyCounts || {};
    return {
      totalGamesPlayed: parsed.totalGamesPlayed,
      bestScoreEver: typeof parsed.bestScoreEver === 'number' ? parsed.bestScoreEver : 0,
      bestAccuracyEver: typeof parsed.bestAccuracyEver === 'number' ? parsed.bestAccuracyEver : 0,
      difficultyCounts: {
        Easy:     typeof counts.Easy     === 'number' ? counts.Easy     : 0,
        Medium:   typeof counts.Medium   === 'number' ? counts.Medium   : 0,
        Hard:     typeof counts.Hard     === 'number' ? counts.Hard     : 0,
        Standard: typeof counts.Standard === 'number' ? counts.Standard : 0,
      },
    };
  } catch {
    return defaultStats();
  }
}

export function updateStats(gameData) {
  // gameData: { score, accuracy, difficulty, questionsAnswered, isPractice }
  try {
    const stats = loadStats();
    stats.totalGamesPlayed++;
    if (gameData.score > stats.bestScoreEver) stats.bestScoreEver = gameData.score;
    if (gameData.accuracy > stats.bestAccuracyEver) stats.bestAccuracyEver = gameData.accuracy;
    const diff = gameData.difficulty;
    if (diff in stats.difficultyCounts) {
      stats.difficultyCounts[diff]++;
    } else {
      stats.difficultyCounts[diff] = 1;
    }
    globalThis.localStorage?.setItem(KEY_STATS, JSON.stringify(stats));
  } catch { /* silent */ }
}

// ── Clear ──────────────────────────────────────────────────────────────────

export function clearLeaderboard() {
  try {
    globalThis.localStorage?.removeItem(KEY_LEADERBOARD);
    globalThis.localStorage?.setItem(KEY_STATS, JSON.stringify(defaultStats()));
    // mathblaster_last_player_name is intentionally kept
  } catch { /* silent */ }
}

// ── Eligibility ────────────────────────────────────────────────────────────

export function isEligibleForNamePicker(gameData) {
  // gameData: { questionsAnswered, isPractice }
  if (gameData.isPractice) return false;
  if (gameData.questionsAnswered === 0) return false;
  return true;
}

export function qualifiesForTop10(score) {
  try {
    const entries = loadLeaderboard();
    if (entries.length < MAX_ENTRIES) return true;
    const sorted = sortLeaderboard(entries);
    return score > sorted[sorted.length - 1].score;
  } catch {
    return true;
  }
}

// ── Sorting ────────────────────────────────────────────────────────────────

export function sortLeaderboard(entries) {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.date) - new Date(a.date);
  });
}

// ── Player helpers ─────────────────────────────────────────────────────────

export function getUniquePlayers(entries) {
  const map = new Map();
  for (const e of entries) {
    const existing = map.get(e.name);
    if (!existing || e.score > existing.personalBest) {
      map.set(e.name, { name: e.name, personalBest: e.score });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function resolvePlayerName(inputName, existingNames) {
  const lower = inputName.trim().toLowerCase();
  const match = existingNames.find(n => n.toLowerCase() === lower);
  return match !== undefined ? match : inputName.trim();
}

export function getLastPlayerName() {
  try {
    return globalThis.localStorage?.getItem(KEY_LAST_NAME) || '';
  } catch {
    return '';
  }
}

export function setLastPlayerName(name) {
  try {
    globalThis.localStorage?.setItem(KEY_LAST_NAME, name);
  } catch { /* silent */ }
}

// ── Stats helpers ──────────────────────────────────────────────────────────

export function getFavouriteDifficulty(stats) {
  const counts = stats.difficultyCounts;
  let best = null;
  let bestCount = -1;
  for (const [diff, count] of Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))) {
    if (count > bestCount) {
      bestCount = count;
      best = diff;
    }
  }
  return best || 'Standard';
}

// ── Display helpers ────────────────────────────────────────────────────────

export function formatEntryDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}
