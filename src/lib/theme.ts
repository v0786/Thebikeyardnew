export type ThemeId = 'obsidian-gold' | 'racing-redline' | 'heritage-green' | 'electric-volt' | 'showroom-daylight';

export interface ThemeDef {
  id: ThemeId;
  name: string;
  description: string;
  accent: string; // swatch
  surface: string; // swatch
}

export const THEMES: ThemeDef[] = [
  { id: 'obsidian-gold', name: 'Obsidian Gold', description: 'Premium charcoal & champagne (default)', accent: '#D9A441', surface: '#0C0C0E' },
  { id: 'racing-redline', name: 'Racing Redline', description: 'Sport black & signal red', accent: '#EF4444', surface: '#09090B' },
  { id: 'heritage-green', name: 'Heritage British Green', description: 'Forest green & antique brass', accent: '#C8A24A', surface: '#0B110D' },
  { id: 'electric-volt', name: 'Electric Volt', description: 'Ink navy & acid lime', accent: '#A3E635', surface: '#070B14' },
  { id: 'showroom-daylight', name: 'Showroom Daylight', description: 'Light, clean & high-trust', accent: '#2563EB', surface: '#FFFFFF' },
];

export const THEME_STORAGE_KEY = 'tby-theme';

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === 'string' && THEMES.some((t) => t.id === v);
}

export function getStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return 'obsidian-gold';
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(v) ? v : 'obsidian-gold';
  } catch {
    return 'obsidian-gold';
  }
}

export function applyTheme(id: ThemeId) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = id;
  document.documentElement.style.colorScheme = id === 'showroom-daylight' ? 'light' : 'dark';
}

export function setTheme(id: ThemeId) {
  applyTheme(id);
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function initTheme() {
  applyTheme(getStoredTheme());
}
