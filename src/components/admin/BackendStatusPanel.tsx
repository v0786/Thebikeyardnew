import { useCallback, useEffect, useState, type FC } from 'react';
import { Server, RefreshCw, CheckCircle2, AlertCircle, Unplug } from 'lucide-react';
import {
  getBackendBaseUrl,
  getBackendHealth,
  isBackendConfigured,
  type BackendHealth,
} from '../../services/backendClient';

export const BackendStatusPanel: FC = () => {
  const configured = isBackendConfigured();
  const baseUrl = getBackendBaseUrl();
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    setError(null);
    try {
      setHealth(await getBackendHealth());
    } catch (e) {
      setHealth(null);
      setError(e instanceof Error ? e.message : 'Failed to reach backend');
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!configured) {
    return (
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <Unplug className="w-4 h-4 text-slate-500" aria-hidden="true" />
          Backend API (not connected)
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          The showroom runs in standalone mode (in-browser data). To connect the SPA to the Next.js + Prisma backend,
          set <code className="text-amber-400">VITE_API_BASE_URL</code> (e.g. your deployed backend origin) and rebuild.
          Backend CORS must allow this site’s origin (<code className="text-slate-400">CORS_ORIGINS</code>).
        </p>
      </div>
    );
  }

  const dbUp = health?.database === 'up';
  const ok = !!health && !error;

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <Server className="w-4 h-4 text-amber-400" aria-hidden="true" />
          Backend API Connection
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
          <div className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">Base URL</div>
          <div className="font-mono text-slate-200 break-all">{baseUrl}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
          <div className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">Health</div>
          <div className={`flex items-center gap-1.5 font-semibold ${ok ? 'text-emerald-400' : 'text-rose-400'}`}>
            {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {loading ? 'Checking…' : error ?? health?.status ?? 'Unknown'}
          </div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
          <div className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">Service</div>
          <div className="text-slate-200">{health?.service ?? '—'}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
          <div className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">Database</div>
          <div className={dbUp ? 'text-emerald-400 font-semibold' : health?.database === 'down' ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
            {health?.database ?? '—'}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-600 leading-relaxed">
        Connected endpoints (safe): <code>GET /api/health</code>, <code>GET /api/catalog/bikewale</code>. Authenticated
        operations (NextAuth, sales, stock) require the backend to be deployed with a database and proper session/CORS
        config. <code>POST /api/sales</code> is intentionally disabled (503) until verified payments, tax config, and
        inventory concurrency controls are deployed.
      </p>
    </div>
  );
};
