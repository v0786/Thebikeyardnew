import type { MetaInboundMessage, MetaWebhookPayload, ParsedInboundText } from './types';
import { normalizeWaId } from './cloud-api';

export function parseInboundTextMessages(payload: MetaWebhookPayload): ParsedInboundText[] {
  if (payload.object !== 'whatsapp_page' && payload.object !== 'whatsapp_business_account') {
    // Meta uses 'whatsapp_business_account' for Cloud API webhooks
  }
  const out: ParsedInboundText[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field && change.field !== 'messages') continue;
      const value = change.value;
      const contacts = value?.contacts ?? [];
      for (const msg of value?.messages ?? []) {
        const parsed = toParsedText(msg, contacts);
        if (parsed) out.push(parsed);
      }
    }
  }
  return out;
}

function toParsedText(
  msg: MetaInboundMessage,
  contacts: Array<{ profile?: { name?: string }; wa_id?: string }>,
): ParsedInboundText | null {
  if (!msg.id || !msg.from) return null;
  if (msg.type !== 'text') return null; // M1-M3: text only; ignore others safely
  const text = msg.text?.body?.toString() ?? '';
  if (!text.trim()) return null;
  const waId = normalizeWaId(msg.from);
  if (!waId) return null;
  const contact = contacts.find((c) => normalizeWaId(c.wa_id ?? '') === waId) ?? contacts[0];
  return {
    waId,
    profileName: contact?.profile?.name?.slice(0, 120),
    messageId: msg.id,
    timestamp: msg.timestamp,
    text,
  };
}

export function hasStatusEvents(payload: MetaWebhookPayload): boolean {
  return (payload.entry ?? []).some((e) => (e.changes ?? []).some((c) => (c.value?.statuses?.length ?? 0) > 0));
}
