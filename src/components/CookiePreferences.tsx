import { createContext, useContext, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'tby-cookie-preferences-v1';
const CookieContext = createContext({ maps: false, open: () => {} });
export const useCookiePreferences = () => useContext(CookieContext);

export function CookiePreferences({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<'allow' | 'reject' | null>(() => {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'allow' || value === 'reject' ? value : null;
    } catch { return null; }
  });
  const [editing, setEditing] = useState(false);
  const [mapsDraft, setMapsDraft] = useState(false);
  const save = (allow: boolean) => {
    const value = allow ? 'allow' : 'reject';
    setChoice(value);
    setEditing(false);
    try { localStorage.setItem(STORAGE_KEY, value); } catch { /* Keep the choice for this visit. */ }
  };
  const open = () => { setMapsDraft(choice === 'allow'); setEditing(true); };
  const button = 'rounded-lg border border-slate-700 px-3 py-2 font-semibold text-slate-200 hover:border-amber-500';
  return (
    <CookieContext.Provider value={{ maps: choice === 'allow', open }}>
      {children}
      {(choice === null || editing) && (
        <aside aria-label="Cookie preferences" className="fixed inset-x-3 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-[70] mx-auto max-h-[calc(100dvh-5rem-env(safe-area-inset-bottom))] max-w-xl space-y-2 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-4 text-xs text-slate-300 shadow-xl md:bottom-24 md:max-h-[calc(100dvh-7rem)]">
          <h2 className="text-sm font-bold text-white">Cookie and site preferences</h2>
          <p>Essential browser storage supports the showroom and cart. The optional Google Maps embed can set third-party cookies. See our <a className="text-amber-400 underline" href="/privacy-policy">Privacy Policy</a>.</p>
          {editing && <label className="flex items-center gap-2"><input type="checkbox" checked={mapsDraft} onChange={(event) => setMapsDraft(event.target.checked)} /> Allow Google Maps embed</label>}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={button} onClick={() => save(true)}>Accept optional</button>
            <button type="button" className={button} onClick={() => save(false)}>Reject optional</button>
            {editing
              ? <button type="button" className={button} onClick={() => save(mapsDraft)}>Save preferences</button>
              : <button type="button" className={button} onClick={open}>Manage preferences</button>}
          </div>
        </aside>
      )}
    </CookieContext.Provider>
  );
}
