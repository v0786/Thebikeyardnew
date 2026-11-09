import { getWhatsappConfig, isWhatsappSendConfigured } from './config';
import { safeLogError, safeLogMeta } from './security';
import type { SendTextResult } from './types';

const SEND_TIMEOUT_MS = 10000;

export async function sendWhatsappText(toWaId: string, body: string): Promise<SendTextResult> {
  const cfg = getWhatsappConfig();
  if (!isWhatsappSendConfigured(cfg)) {
    safeLogMeta({ event: 'send_skipped', reason: 'not_configured_or_unsafe_mode' });
    return { ok: false, error: 'WhatsApp sending is not configured (test mode/credentials).' };
  }

  const to = normalizeWaId(toWaId);
  if (!to) return { ok: false, error: 'Invalid recipient.' };
  if (!body || body.length > 4096) return { ok: false, error: 'Invalid message body.' };

  const url = `https://graph.facebook.com/${cfg.apiVersion}/${cfg.phoneNumberId}/messages`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body },
      }),
      signal: controller.signal,
    });

    const json = (await res.json().catch(() => null)) as
      | { messages?: Array<{ id?: string }>; error?: { message?: string; code?: number } }
      | null;

    if (!res.ok) {
      safeLogError({
        event: 'send_failed',
        status: res.status,
        code: json?.error?.code,
        // do not log token, full error payload, or message body
      });
      return { ok: false, error: 'WhatsApp API request failed.' };
    }

    const providerMessageId = json?.messages?.[0]?.id;
    safeLogMeta({ event: 'send_ok', hasProviderId: Boolean(providerMessageId) });
    return { ok: true, providerMessageId };
  } catch (err) {
    safeLogError({ event: 'send_exception', name: err instanceof Error ? err.name : 'Error' });
    return { ok: false, error: 'WhatsApp API request failed.' };
  } finally {
    clearTimeout(timeout);
  }
}

export function normalizeWaId(value: string): string | null {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}
