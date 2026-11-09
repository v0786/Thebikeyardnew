/**
 * WhatsApp Cloud API integration config (Meta test number first).
 * All secrets come from env; never commit or log secret values.
 */

export type WhatsappMode = 'test' | 'production';

export interface WhatsappConfig {
  mode: WhatsappMode;
  verifyToken: string;
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  appSecret: string;
  apiVersion: string;
  productionApproved: boolean;
  aiProvider: 'none' | 'gemini';
  aiModel: string;
  aiTimeoutMs: number;
  geminiApiKey: string;
}

function env(name: string): string {
  return (process.env[name] ?? '').trim();
}

export function getWhatsappConfig(): WhatsappConfig {
  const mode = env('WHATSAPP_MODE') === 'production' ? 'production' : 'test';
  return {
    mode,
    verifyToken: env('WHATSAPP_VERIFY_TOKEN'),
    accessToken: env('WHATSAPP_ACCESS_TOKEN'),
    phoneNumberId: env('WHATSAPP_PHONE_NUMBER_ID'),
    businessAccountId: env('WHATSAPP_BUSINESS_ACCOUNT_ID'),
    appSecret: env('WHATSAPP_APP_SECRET'),
    apiVersion: env('WHATSAPP_API_VERSION') || 'v21.0',
    productionApproved: env('WHATSAPP_PRODUCTION_APPROVED') === 'true',
    aiProvider: env('AI_PROVIDER') === 'gemini' ? 'gemini' : 'none',
    aiModel: env('AI_MODEL') || 'gemini-2.0-flash',
    aiTimeoutMs: Math.max(2000, Math.min(30000, Number(env('AI_TIMEOUT_MS') || '12000') || 12000)),
    geminiApiKey: env('GEMINI_API_KEY'),
  };
}

export function isTestModeSafe(cfg: WhatsappConfig): boolean {
  // M8 guard: do not allow production behavior without explicit approval flag.
  if (cfg.mode === 'production' && !cfg.productionApproved) return false;
  return true;
}

export function isWhatsappSendConfigured(cfg: WhatsappConfig): boolean {
  return Boolean(cfg.accessToken && cfg.phoneNumberId && isTestModeSafe(cfg));
}

export function isWebhookVerifyConfigured(cfg: WhatsappConfig): boolean {
  return Boolean(cfg.verifyToken);
}
