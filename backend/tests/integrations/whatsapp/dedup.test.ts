import { beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetMemoryDedup, claimWebhookEvent } from '@/lib/integrations/whatsapp/dedup';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    whatsappWebhookEvent: {
      create: vi.fn(async () => {
        const err = new Error('db unavailable') as Error & { code?: string };
        err.code = 'P1001';
        throw err;
      }),
    },
  },
}));

describe('WhatsApp webhook dedup', () => {
  beforeEach(() => {
    _resetMemoryDedup();
  });

  it('claims a new event once when DB is unavailable (memory fallback)', async () => {
    await expect(claimWebhookEvent('wamid.123', 'whatsapp.message')).resolves.toBe(true);
    await expect(claimWebhookEvent('wamid.123', 'whatsapp.message')).resolves.toBe(false);
  });

  it('rejects missing event ids', async () => {
    await expect(claimWebhookEvent('', 'whatsapp.message')).resolves.toBe(false);
  });
});
