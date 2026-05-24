const AUDIT_LOG_KEY = 'mathblaster_audit_log';
const AUDIT_LOG_MAX = 100;

export function loadAuditLog() {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendAuditEntry(entry) {
  const log = loadAuditLog();
  while (log.length >= AUDIT_LOG_MAX) {
    log.shift();
  }
  log.push(entry);
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(log));
}

export function clearAuditLog() {
  localStorage.removeItem(AUDIT_LOG_KEY);
}

export function formatDuration(startIso, endIso) {
  const ms = new Date(endIso) - new Date(startIso);
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function computeAuditSummary(log) {
  if (log.length === 0) {
    return { totalSessions: 0, totalPlayTimeMs: 0, avgErrors: 0, mostActivePlayer: null };
  }

  let totalPlayTimeMs = 0;
  let totalErrors = 0;
  const playerCounts = {};

  for (const entry of log) {
    totalPlayTimeMs += new Date(entry.endTime) - new Date(entry.startTime);
    totalErrors += entry.errors;
    if (entry.playerName) {
      const key = entry.playerName.toLowerCase();
      if (!playerCounts[key]) playerCounts[key] = { name: entry.playerName, count: 0 };
      playerCounts[key].count++;
    }
  }

  const avgErrors = Math.round((totalErrors / log.length) * 10) / 10;

  let mostActivePlayer = null;
  const players = Object.values(playerCounts);
  if (players.length > 0) {
    players.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
    mostActivePlayer = players[0].name;
  }

  return { totalSessions: log.length, totalPlayTimeMs, avgErrors, mostActivePlayer };
}

export function timerToDifficulty(seconds) {
  if (seconds <= 10) return 'Hard';
  if (seconds <= 20) return 'Medium';
  return 'Easy';
}
