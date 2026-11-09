import { useState, type FC } from 'react';
import { Palette, Check } from 'lucide-react';
import { THEMES, getStoredTheme, setTheme, type ThemeId } from '../lib/theme';

interface ThemePickerProps {
  /** Compact = inline swatch row (e.g. navbar); default = full settings cards */
  compact?: boolean;
  className?: string;
}

export const ThemePicker: FC<ThemePickerProps> = ({ compact = false, className = '' }) => {
  const [active, setActive] = useState<ThemeId>(getStoredTheme);

  const choose = (id: ThemeId) => {
    setActive(id);
    setTheme(id);
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`} role="radiogroup" aria-label="Choose theme">
        <Palette className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
        {THEMES.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              title={`${t.name} — ${t.description}`}
              onClick={() => choose(t.id)}
              className={`relative h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isActive ? 'border-white ring-2 ring-amber-500/70 scale-110' : 'border-slate-600'
              }`}
              style={{ background: `linear-gradient(135deg, ${t.surface} 45%, ${t.accent} 45%)` }}
            >
              <span className="sr-only">{t.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4 text-amber-400" aria-hidden="true" />
        <h3 className="text-sm font-bold text-white">Appearance / Theme</h3>
      </div>
      <p className="text-[11px] text-slate-500 mb-4">
        Choose a showroom theme. Your preference is saved on this device.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" role="radiogroup" aria-label="Choose theme">
        {THEMES.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => choose(t.id)}
              className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                isActive
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
              }`}
            >
              <span
                className="h-10 w-10 shrink-0 rounded-lg border border-slate-700 shadow-inner"
                style={{ background: `linear-gradient(135deg, ${t.surface} 48%, ${t.accent} 48%)` }}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block text-xs font-bold text-white leading-tight">{t.name}</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">{t.description}</span>
              </span>
              {isActive && (
                <Check className="absolute top-2 right-2 w-4 h-4 text-amber-400" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
