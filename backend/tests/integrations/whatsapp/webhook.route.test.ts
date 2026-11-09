import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const claimWebhookEvent = vi.fn();
const processInboundText = vi.fn();
const markWebhookEvent = vi.fn();

vi.mock('@/lib/integrations/whatsapp', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/integrations/whatsapp')>();
  return {
    ...actual,
    claimWebhookEvent: (...args: unknown[]) => claimWebhookEvent(...args),
    processInboundText: (...args: unknown[]) => processInboundText(...args),
    markWebhookEvent: (...args: unknown[]) => markWebhookEvent(...args),
  };
});

import { GET, POST } from '@/app/api/integrations/whatsapp/webhook/route';

const savedEnv = { ...process.env };

describe('WhatsApp webhook route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...savedEnv };
    process.env.WHATSAPP_MODE = 'test';
    process.env.WHATSAPP_VERIFY_TOKEN = 'verify-me';
    process.env.WHATSAPP_APP_SECRET = ''; // skip signature for most tests
    claimWebhookEvent.mockResolvedValue(true);
    processInboundText.mockResolvedValue({ handled: true, replied: true });
    markWebhookEvent.mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = { ...savedEnv };
  });

  it('GET verifies webhook challenge (M2)', async () => {
    const req = new Request('https://example.test/api/integrations/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=CHALLENGE123');
    const res = await GET(req);
    expect(res.status).toBe(200);
    await expect(res.text()).resolves.toBe('CHALLENGE123');
  });

  it('GET rejects invalid verify token', async () => {
    const req = new Request('https://example.test/api/integrations/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=CHALLENGE123');
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('POST rejects invalid signatures when app secret is configured', async () => {
    process.env.WHATSAPP_APP_SECRET = 'topsecret';
    const req = new Request('https://example.test/api/integrations/whatsapp/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-hub-signature-256': 'sha256=badsig' },
      body: JSON.stringify({ object: 'whatsapp_business_account', entry: [] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('POST deduplicates inbound messages (no duplicate processing)', async () => {
    claimWebhookEvent.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const payload = {
      object: 'whatsapp_business_account',
      entry: [{ changes: [{ field: 'messages', value: { messages: [
        { from: '919999888877', id: 'wamid.DUP', type: 'text', text: { body: 'Hi' } },
        { from: '919999888877', id: 'wamid.DUP', type: 'text', text: { body: 'Hi' } },
      ] } }] }],
    };
    const req = new Request('https://example.test/api/integrations/whatsapp/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(processInboundText).toHaveBeenCalledTimes(1);
  });

  it('POST ignores unsupported/non-text events safely', async () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [{ changes: [{ value: { messages: [{ from: '919999888877', id: 'wamid.IMG', type: 'image' }] } }] }],
    };
    const req = new Request('https://example.test/api/integrations/whatsapp/webhook', { method: 'POST', body: JSON.stringify(payload) });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(claimWebhookEvent).not.toHaveBeenCalled();
    expect(processInboundText).not.toHaveBeenCalled();
  });
});
