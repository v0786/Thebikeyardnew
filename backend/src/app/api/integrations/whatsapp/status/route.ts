import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/api-auth';
import {
  getWhatsappConfig,
  isTestModeSafe,
  isWebhookVerifyConfigured,
  isWhatsappSendConfigured,
} from '@/lib/integrations/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole(['Manager', 'Super Admin', 'Owner', 'Sales Exec']);
  } catch (error: unknown) {
    const e = error as { statusCode?: number; code?: string };
    return NextResponse.json({ error: { code: e.code ?? 'AUTH_ERROR', message: 'Not authorized.' } }, { status: e.statusCode ?? 401 });
  }

  const cfg = getWhatsappConfig();
  // Never return secrets/tokens
  return NextResponse.json({
    data: {
      mode: cfg.mode,
      testModeSafe: isTestModeSafe(cfg),
      webhookVerifyConfigured: isWebhookVerifyConfigured(cfg),
      sendConfigured: isWhatsappSendConfigured(cfg),
      signatureVerificationConfigured: Boolean(cfg.appSecret),
      aiProvider: cfg.aiProvider,
      aiConfigured: cfg.aiProvider === 'gemini' ? Boolean(cfg.geminiApiKey) : true,
      phoneNumberIdConfigured: Boolean(cfg.phoneNumberId),
      productionApproved: cfg.productionApproved,
      scope: 'customer-assistant-only',
      salesFinalization: 'disabled-by-backend-design',
    },
  });
}
