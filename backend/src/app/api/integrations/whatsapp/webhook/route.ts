import { NextResponse } from 'next/server';
import {
  claimWebhookEvent,
  getWhatsappConfig,
  isTestModeSafe,
  isWebhookVerifyConfigured,
  markWebhookEvent,
  parseInboundTextMessages,
  hasStatusEvents,
  processInboundText,
  safeLogError,
  safeLogMeta,
  verifyMetaSignature,
  verifyWebhookChallenge,
  checkSenderRateLimit,
} from '@/lib/integrations/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/integrations/whatsapp/webhook — Meta webhook verification challenge (M2)
export async function GET(request: Request) {
  const cfg = getWhatsappConfig();
  if (!isWebhookVerifyConfigured(cfg)) {
    return new NextResponse('Webhook verify token not configured', { status: 503 });
  }
  if (!isTestModeSafe(cfg)) {
    return new NextResponse('WhatsApp production mode is not approved', { status: 503 });
  }

  const url = new URL(request.url);
  const result = verifyWebhookChallenge({
    mode: url.searchParams.get('hub.mode'),
    token: url.searchParams.get('hub.verify_token'),
    challenge: url.searchParams.get('hub.challenge'),
    expectedToken: cfg.verifyToken,
  });

  if (!result.ok) return new NextResponse('Forbidden', { status: result.status });
  safeLogMeta({ event: 'webhook_verified' });
  return new NextResponse(result.challenge, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

// POST /api/integrations/whatsapp/webhook — receive Meta webhook events (M2/M3)
export async function POST(request: Request) {
  const cfg = getWhatsappConfig();
  if (!isTestModeSafe(cfg)) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');
  if (!verifyMetaSignature({ rawBody, signatureHeader: signature, appSecret: cfg.appSecret })) {
    safeLogError({ event: 'invalid_signature' });
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const data = payload as Record<string, unknown>;
  const messages = parseInboundTextMessages(data as any);
  const statusOnly = messages.length === 0 && hasStatusEvents(data as any);

  if (statusOnly) {
    // Delivery/status callbacks: acknowledge; dedup not critical here without id extraction in this minimal path.
    safeLogMeta({ event: 'status_event_ignored' });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (messages.length === 0) {
    safeLogMeta({ event: 'no_supported_messages' });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  for (const msg of messages) {
    if (!checkSenderRateLimit(msg.waId).allowed) {
      safeLogMeta({ event: 'rate_limited' });
      continue; // ack webhook; do not reply
    }
    const providerEventId = msg.messageId;
    const claimed = await claimWebhookEvent(providerEventId, 'whatsapp.message');
    if (!claimed) {
      safeLogMeta({ event: 'duplicate_ignored' });
      await markWebhookEvent(providerEventId, 'ignored', 'duplicate');
      continue;
    }
    await processInboundText(msg, providerEventId);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
