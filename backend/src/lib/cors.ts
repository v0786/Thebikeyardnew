import { NextResponse } from 'next/server';

/**
 * Minimal CORS for safe, read-only API routes called by the SPA.
 * Configure CORS_ORIGINS as a comma-separated allowlist (e.g.
 * "https://the-bike-yard.vercel.app,http://localhost:3000"). If unset,
 * no CORS headers are added (same-origin/server-only access).
 */
function allowedOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) return null;
  const raw = process.env.CORS_ORIGINS ?? '';
  const allow = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allow.length === 0) return null;
  if (allow.includes('*')) return requestOrigin;
  return allow.includes(requestOrigin) ? requestOrigin : null;
}

export function withCors(request: Request, response: NextResponse): NextResponse {
  const origin = allowedOrigin(request.headers.get('origin'));
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Accept,Content-Type');
  }
  return response;
}

export function corsPreflight(request: Request): NextResponse {
  return withCors(request, new NextResponse(null, { status: 204 }));
}
