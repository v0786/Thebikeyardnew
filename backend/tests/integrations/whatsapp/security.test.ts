import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyMetaSignature, verifyWebhookChallenge } from '@/lib/integrations/whatsapp/security';

describe('WhatsApp webhook security', () => {
  it('verifies a valid webhook challenge', () => {
    const r = verifyWebhookChallenge({
      mode: 'subscribe',
      token: 'secret-token',
      challenge: '1234567890',
      expectedToken: 'secret-token',
    });
    expect(r).toEqual({ ok: true, challenge: '1234567890' });
  });

  it('rejects an invalid verify token', () => {
    const r = verifyWebhookChallenge({ mode: 'subscribe', token: 'wrong', challenge: 'abc', expectedToken: 'secret-token' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(403);
  });

  it('rejects missing verify configuration', () => {
    const r = verifyWebhookChallenge({ mode: 'subscribe', token: 'x', challenge: 'abc', expectedToken: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(503);
  });

  it('validates a correct X-Hub-Signature-256', () => {
    const body = '{"object":"whatsapp_business_account"}';
    const secret = 'app-secret';
    const sig = `sha256=${crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex')}`;
    expect(verifyMetaSignature({ rawBody: body, signatureHeader: sig, appSecret: secret })).toBe(true);
  });

  it('rejects an incorrect signature', () => {
    expect(
      verifyMetaSignature({ rawBody: '{"a":1}', signatureHeader: 'sha256=deadbeef', appSecret: 'app-secret' }),
    ).toBe(false);
  });

  it('allows when app secret is not configured (dev convenience)', () => {
    expect(verifyMetaSignature({ rawBody: '{}', signatureHeader: null, appSecret: '' })).toBe(true);
  });
});
