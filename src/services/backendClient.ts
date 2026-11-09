/**
 * Optional SPA ↔ backend (Next.js + Prisma) API client.
 *
 * The live showroom SPA works fully without a backend (in-browser store).
 * When VITE_API_BASE_URL is set, safe backend endpoints can be used for
 * health checks and the BikeWale catalog adapter.
 *
 * Authenticated/sale operations require the backend to be deployed with a
 * database, correct CORS/cookie configuration, and must respect backend
 * security rules (e.g. POST /api/sales is intentionally disabled until
 * verified payments/tax/concurrency controls are deployed).
 */

export interface BackendHealth {
  status: string;
  service?: string;
  database?: 'up' | 'down' | 'unknown';
}

export interface BackendBikewaleBike {
  sourceId?: string;
  brand: string;
  model: string;
  variant?: string;
  engineCc?: number;
  imageUrl?: string;
  photos?: string[];
  colors?: { name: string; photos?: string[] }[];
  specifications?: { label: string; value: string }[];
  sourceUrl?: string;
  retrievedAt?: string;
}

export interface BackendBikewaleFeed {
  bikes: BackendBikewaleBike[];
  configured: boolean;
  source?: string;
  message?: string;
}

const REQUEST_TIMEOUT_MS = 8000;

export function getBackendBaseUrl(): string | null {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, '');
}

export function isBackendConfigured(): boolean {
  return getBackendBaseUrl() !== null;
}

async function backendFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getBackendBaseUrl();
  if (!base) throw new Error('Backend API is not configured (set VITE_API_BASE_URL).');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}${path.startsWith('/') ? path : `/${path}`}`, {
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    const text = await res.text();
    const json = text ? (JSON.parse(text) as unknown) : null;
    if (!res.ok) {
      const message =
        (json as { error?: { message?: string }; message?: string } | null)?.error?.message ??
        (json as { message?: string } | null)?.message ??
        `Backend request failed (${res.status})`;
      throw new Error(message);
    }
    return json as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getBackendHealth(): Promise<BackendHealth> {
  const json = await backendFetch<{ data?: BackendHealth } | BackendHealth>('/api/health');
  return ((json as { data?: BackendHealth }).data ?? (json as BackendHealth));
}

export async function getBackendBikewaleCatalog(): Promise<BackendBikewaleFeed> {
  return backendFetch<BackendBikewaleFeed>('/api/catalog/bikewale');
}
