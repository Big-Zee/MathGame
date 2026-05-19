const VALID_IDS = ['space', 'ocean', 'jungle', 'volcano', 'candy', 'midnight'];

export const THEMES = {
  space: {
    id: 'space',
    name: 'Space',
    emoji: '🚀',
    vars: {
      '--color-bg-start':    '#0D0D2B',
      '--color-bg-end':      '#1A0533',
      '--color-primary':     '#4FC3F7',
      '--color-accent':      '#CE93D8',
      '--color-card-bg':     '#1E2A3A',
      '--color-card-border': '#4FC3F7',
      '--color-button-bg':   '#4FC3F7',
      '--color-button-text': '#0D0D2B',
      '--border-radius-btn': '12px',
      '--color-text':        '#E2E8F0',
      '--color-text-muted':  '#94A3B8',
      '--color-surface':     '#253548',
      '--color-border':      'rgba(79,195,247,0.25)',
    },
    decorations: ['⭐', '🌙', '🚀'],
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    vars: {
      '--color-bg-start':    '#0D2233',
      '--color-bg-end':      '#0A1628',
      '--color-primary':     '#26C6DA',
      '--color-accent':      '#FF8A65',
      '--color-card-bg':     '#0D2B2E',
      '--color-card-border': '#26C6DA',
      '--color-button-bg':   '#26C6DA',
      '--color-button-text': '#0D2233',
      '--border-radius-btn': '24px',
      '--color-text':        '#E0F7FA',
      '--color-text-muted':  '#80DEEA',
      '--color-surface':     '#133844',
      '--color-border':      'rgba(38,198,218,0.25)',
    },
    decorations: ['🌊', '🐠', '🐙'],
  },
  jungle: {
    id: 'jungle',
    name: 'Jungle',
    emoji: '🌿',
    vars: {
      '--color-bg-start':    '#0D2010',
      '--color-bg-end':      '#0A1A0E',
      '--color-primary':     '#AED581',
      '--color-accent':      '#FFD54F',
      '--color-card-bg':     '#132B12',
      '--color-card-border': '#AED581',
      '--color-button-bg':   '#AED581',
      '--color-button-text': '#0D2010',
      '--border-radius-btn': '18px',
      '--color-text':        '#F1F8E9',
      '--color-text-muted':  '#C5E1A5',
      '--color-surface':     '#1A3A18',
      '--color-border':      'rgba(174,213,129,0.25)',
    },
    decorations: ['🌿', '🦋', '🌺'],
  },
  volcano: {
    id: 'volcano',
    name: 'Volcano',
    emoji: '🔥',
    vars: {
      '--color-bg-start':    '#1A1A1A',
      '--color-bg-end':      '#2D0A00',
      '--color-primary':     '#FF7043',
      '--color-accent':      '#FFCA28',
      '--color-card-bg':     '#1F1F1F',
      '--color-card-border': '#FF7043',
      '--color-button-bg':   '#FF7043',
      '--color-button-text': '#1A1A1A',
      '--border-radius-btn': '4px',
      '--color-text':        '#FBE9E7',
      '--color-text-muted':  '#FFAB91',
      '--color-surface':     '#2A2020',
      '--color-border':      'rgba(255,112,67,0.25)',
    },
    decorations: ['🔥', '⚡', '💥'],
  },
  candy: {
    id: 'candy',
    name: 'Candy',
    emoji: '🍬',
    vars: {
      '--color-bg-start':    '#2D0A1A',
      '--color-bg-end':      '#1A0026',
      '--color-primary':     '#F06292',
      '--color-accent':      '#80CBC4',
      '--color-card-bg':     '#2A0F1F',
      '--color-card-border': '#F06292',
      '--color-button-bg':   '#F06292',
      '--color-button-text': '#2D0A1A',
      '--border-radius-btn': '30px',
      '--color-text':        '#FCE4EC',
      '--color-text-muted':  '#F48FB1',
      '--color-surface':     '#3A1528',
      '--color-border':      'rgba(240,98,146,0.25)',
    },
    decorations: ['🍬', '🌈', '⭐'],
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    vars: {
      '--color-bg-start':    '#000000',
      '--color-bg-end':      '#1A1A1A',
      '--color-primary':     '#B0BEC5',
      '--color-accent':      '#FFD700',
      '--color-card-bg':     '#0A0A0A',
      '--color-card-border': '#FFD700',
      '--color-button-bg':   '#1A1A1A',
      '--color-button-text': '#B0BEC5',
      '--border-radius-btn': '6px',
      '--color-text':        '#ECEFF1',
      '--color-text-muted':  '#78909C',
      '--color-surface':     '#222222',
      '--color-border':      'rgba(255,215,0,0.25)',
    },
    decorations: ['🌙', '✨', '🌟'],
  },
};

export function getTheme(id) {
  const theme = THEMES[id];
  if (!theme) throw new Error(`Unknown theme: "${id}"`);
  return theme;
}

export function getAllThemes() {
  return VALID_IDS.map(id => THEMES[id]);
}

export function getActiveThemeId() {
  try {
    const saved = globalThis.localStorage?.getItem('mathblaster_theme');
    if (saved && VALID_IDS.includes(saved)) return saved;
  } catch (_) { /* private browsing or storage error */ }
  return 'space';
}

export function saveActiveThemeId(id) {
  try {
    globalThis.localStorage?.setItem('mathblaster_theme', id);
  } catch (_) { /* silently ignore storage errors */ }
}
