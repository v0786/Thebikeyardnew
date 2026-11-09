import crypto from 'node:crypto';

export function verifyWebhookChallenge(params: {
  mode?: string | null;
  token?: string | null;
  challenge?: string | null;
  expectedToken: string;
}): { ok: true; challenge: string } | { ok: false; status: number } {
  const { mode, token, challenge, expectedToken } = params;
  if (!expectedToken) return { ok: false, status: 503 }; // not configured
  if (mode !== 'subscribe' || !token || !challenge) return { ok: false, status: 400 };
  if (!timingSafeEqualString(token, expectedToken)) return { ok: false, status: 403 };
  // Challenge should be a simple string/number from Meta; return as-is.
  if (!/^[A-Za-z0-9_-]{1,256}$/.test(challenge)) return { ok: false, status: 400 };
  return { ok: true, challenge };
}

/**
 * Validate X-Hub-Signature-256 when app secret is configured.
 * If no app secret is configured, returns ok (development convenience) but callers
 * should still enforce HTTPS and verify-token checks; production SHOULD set WHATSAPP_APP_SECRET.
 */
export function verifyMetaSignature(params: {
  rawBody: string;
  signatureHeader: string | null;
  appSecret: string;
}): boolean {
  const { rawBody, signatureHeader, appSecret } = params;
  if (!appSecret) return true; // not configured; rely on other controls
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;
  const received = signatureHeader.slice('sha256='.length);
  const expected = crypto.createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex');
  return timingSafeEqualHex(received, expected);
}

function timingSafeEqualString(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (!/^[0-9a-fA-F]+$/.test(a) || a.length !== b.length) return false;
  try {
    const aBuf = Buffer.from(a, 'hex');
    const bBuf = Buffer.from(b, 'hex');
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

export function safeLogMeta(summary: Record<string, unknown>) {
  // Never log tokens, secrets, raw bodies, or full message text.
  console.info('[whatsapp]', JSON.stringify(summary));
}

export function safeLogError(summary: Record<string, unknown>) {
  console.error('[whatsapp]', JSON.stringify(summary));
}
