import { afterEach, describe, expect, it } from 'vitest';
import { getWhatsappConfig, isTestModeSafe, isWhatsappSendConfigured } from '@/lib/integrations/whatsapp/config';

const saved = { ...process.env };

afterEach(() => {
  process.env = { ...saved };
});

describe('WhatsApp config safety', () => {
  it('defaults to test mode and is safe', () => {
    process.env.WHATSAPP_MODE = 'test';
    process.env.WHATSAPP_PRODUCTION_APPROVED = 'false';
    const cfg = getWhatsappConfig();
    expect(cfg.mode).toBe('test');
    expect(isTestModeSafe(cfg)).toBe(true);
  });

  it('blocks production mode unless explicitly approved (M8 guard)', () => {
    process.env.WHATSAPP_MODE = 'production';
    process.env.WHATSAPP_PRODUCTION_APPROVED = 'false';
    expect(isTestModeSafe(getWhatsappConfig())).toBe(false);

    process.env.WHATSAPP_PRODUCTION_APPROVED = 'true';
    expect(isTestModeSafe(getWhatsappConfig())).toBe(true);
  });

  it('requires token, phone id, and safe mode for sending', () => {
    process.env.WHATSAPP_MODE = 'test';
    process.env.WHATSAPP_ACCESS_TOKEN = 'token';
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123';
    expect(isWhatsappSendConfigured(getWhatsappConfig())).toBe(true);

    delete process.env.WHATSAPP_ACCESS_TOKEN;
    expect(isWhatsappSendConfigured(getWhatsappConfig())).toBe(false);
  });
});
