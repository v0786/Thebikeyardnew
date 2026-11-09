import { prisma } from '@/lib/prisma';
import { generateAssistantReply, type AiTurn } from './ai';
import { sendWhatsappText } from './cloud-api';
import { markWebhookEvent } from './dedup';
import {
  boundReply,
  detectLanguageHint,
  fallbackReply,
  handoverReply,
  isOptOut,
  optOutReply,
  wantsHuman,
} from './policy';
import { safeLogError, safeLogMeta } from './security';
import type { ParsedInboundText } from './types';

export interface ProcessResult {
  handled: boolean;
  replied: boolean;
  mode?: 'AI' | 'HUMAN';
  reason?: string;
}

export async function processInboundText(
  inbound: ParsedInboundText,
  providerEventId: string,
): Promise<ProcessResult> {
  try {
    const text = (inbound.text || '').trim().slice(0, 2000);
    if (!text) {
      await markWebhookEvent(providerEventId, 'ignored', 'empty_text');
      return { handled: true, replied: false, reason: 'empty' };
    }

    const lang = detectLanguageHint(text);
    const convo = await getOrCreateConversation(inbound.waId, inbound.profileName, lang);

    await storeInboundMessage(convo?.id, inbound.messageId, text);

    if (isOptOut(text)) {
      await setOptOut(convo?.id);
      const reply = optOutReply();
      await sendAndStoreReply(convo?.id, inbound.waId, reply, providerEventId);
      await markWebhookEvent(providerEventId, 'processed');
      return { handled: true, replied: true, mode: 'AI', reason: 'opt_out' };
    }

    if (convo?.status === 'OPTED_OUT') {
      await markWebhookEvent(providerEventId, 'ignored', 'opted_out');
      return { handled: true, replied: false, mode: 'HUMAN', reason: 'opted_out' };
    }

    if (convo?.mode === 'HUMAN' || convo?.status === 'HUMAN_TAKEOVER') {
      await captureLeadIntent(convo?.id, inbound.waId, inbound.profileName, text);
      await markWebhookEvent(providerEventId, 'processed');
      safeLogMeta({ event: 'human_takeover_suppressed_reply' });
      return { handled: true, replied: false, mode: 'HUMAN', reason: 'human_takeover' };
    }

    if (wantsHuman(text)) {
      await setPendingStaff(convo?.id, 'customer_requested_human');
      await captureLeadIntent(convo?.id, inbound.waId, inbound.profileName, text);
      const reply = handoverReply();
      await sendAndStoreReply(convo?.id, inbound.waId, reply, providerEventId);
      await markWebhookEvent(providerEventId, 'processed');
      return { handled: true, replied: true, mode: 'AI', reason: 'handover_requested' };
    }

    await captureLeadIntent(convo?.id, inbound.waId, inbound.profileName, text);

    const history = await loadHistory(convo?.id);
    const reply = boundReply(
      (await generateAssistantReply({ userText: text, history, languageHint: lang })) || fallbackReply(),
    );
    await sendAndStoreReply(convo?.id, inbound.waId, reply, providerEventId);
    await markWebhookEvent(providerEventId, 'processed');
    return { handled: true, replied: true, mode: 'AI' };
  } catch (err) {
    safeLogError({ event: 'process_inbound_failed', name: err instanceof Error ? err.name : 'Error' });
    await markWebhookEvent(providerEventId, 'failed', 'processing_error');
    // Best-effort: do not crash webhook ack path; caller already deduped.
    return { handled: false, replied: false, reason: 'error' };
  }
}

async function getOrCreateConversation(waId: string, profileName?: string, languageHint?: string) {
  try {
    return await prisma.whatsappConversation.upsert({
      where: { waId },
      create: { waId, profileName, languageHint, lastMessageAt: new Date() },
      update: {
        profileName: profileName ?? undefined,
        languageHint: languageHint ?? undefined,
        lastMessageAt: new Date(),
      },
    });
  } catch (err) {
    safeLogError({ event: 'conversation_upsert_failed' });
    return null;
  }
}

async function storeInboundMessage(conversationId: string | undefined, providerMessageId: string, text: string) {
  if (!conversationId) return;
  try {
    await prisma.whatsappMessage.create({
      data: {
        conversationId,
        providerMessageId,
        direction: 'INBOUND',
        messageType: 'text',
        bodyText: text.slice(0, 4000),
        status: 'received',
      },
    });
  } catch (err) {
    // providerMessageId unique - duplicate store is safe to ignore
    if ((err as { code?: string })?.code !== 'P2002') safeLogError({ event: 'store_inbound_failed' });
  }
}

async function sendAndStoreReply(
  conversationId: string | undefined,
  waId: string,
  reply: string,
  eventId: string,
) {
  const result = await sendWhatsappText(waId, reply);
  if (!conversationId) return;
  try {
    await prisma.whatsappMessage.create({
      data: {
        conversationId,
        providerMessageId: result.providerMessageId ?? `local:${eventId}:reply`,
        direction: 'OUTBOUND',
        messageType: 'text',
        bodyText: reply.slice(0, 4000),
        status: result.ok ? 'sent' : 'failed',
        errorMessage: result.ok ? null : (result.error ?? 'send_failed').slice(0, 500),
      },
    });
    await prisma.whatsappConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
  } catch (err) {
    if ((err as { code?: string })?.code !== 'P2002') safeLogError({ event: 'store_outbound_failed' });
  }
}

async function loadHistory(conversationId: string | undefined): Promise<AiTurn[]> {
  if (!conversationId) return [];
  try {
    const msgs = await prisma.whatsappMessage.findMany({
      where: { conversationId, messageType: 'text' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { direction: true, bodyText: true },
    });
    return msgs
      .reverse()
      .filter((m) => m.bodyText)
      .map((m) => ({ role: m.direction === 'INBOUND' ? 'user' : 'assistant', text: m.bodyText as string }));
  } catch {
    return [];
  }
}

async function setOptOut(conversationId: string | undefined) {
  if (!conversationId) return;
  try {
    await prisma.whatsappConversation.update({
      where: { id: conversationId },
      data: { status: 'OPTED_OUT', mode: 'HUMAN', optedOutAt: new Date() },
    });
  } catch {}
}

async function setPendingStaff(conversationId: string | undefined, reason: string) {
  if (!conversationId) return;
  try {
    await prisma.whatsappConversation.update({
      where: { id: conversationId },
      data: { status: 'PENDING_STAFF', metadata: { handoverReason: reason } },
    });
  } catch {}
}

function detectIntent(text: string): string | null {
  const t = text.toLowerCase();
  if (/\b(test\s*ride|test-ride|testride)\b|टेस्ट\s*राइड/i.test(t)) return 'test_ride';
  if (/\b(call\s*back|callback|call me|phone)\b|कॉल\s*बैक/i.test(t)) return 'callback';
  if (/\b(price|on[- ]?road|ex[- ]?showroom|quote|kitna|keemat)\b|कीमत|दाम/i.test(t)) return 'price';
  if (/\b(emi|finance|loan|down\s*payment)\b|फाइनेंस|लोन/i.test(t)) return 'finance';
  if (/\b(buy|book|available|stock|delivery)\b|खरीद|बुक|स्टॉक/i.test(t)) return 'enquiry';
  return null;
}

async function captureLeadIntent(
  conversationId: string | undefined,
  waId: string,
  profileName: string | undefined,
  text: string,
) {
  const intent = detectIntent(text);
  if (!intent || !conversationId) return;
  try {
    await prisma.whatsappLeadLink.create({
      data: {
        conversationId,
        intent,
        customerName: profileName,
        phone: waId,
        notes: `Auto-captured from WhatsApp (${intent}). Staff must confirm details.`,
      },
    });
    // Best-effort link to existing Lead table (source=WHATSAPP)
    await prisma.lead.create({
      data: {
        customerName: profileName || 'WhatsApp Customer',
        phone: waId,
        bikeOfInterest: intent === 'test_ride' ? 'Test ride request' : 'WhatsApp enquiry',
        source: 'WHATSAPP',
        stage: 'NEW',
        notes: `Intent: ${intent}. Auto-captured by virtual assistant; confirm with customer.`,
      },
    });
  } catch (err) {
    safeLogError({ event: 'lead_capture_failed' });
  }
}

// Admin helpers (protected routes use these)
export async function setConversationMode(
  conversationId: string,
  mode: 'AI' | 'HUMAN',
  actorUserId?: string,
) {
  const status = mode === 'HUMAN' ? 'HUMAN_TAKEOVER' : 'OPEN';
  const convo = await prisma.whatsappConversation.update({
    where: { id: conversationId },
    data: { mode, status, assignedStaffId: mode === 'HUMAN' ? actorUserId : null },
  });
  await prisma.whatsappAuditLog.create({
    data: { conversationId, actorUserId, action: mode === 'HUMAN' ? 'TAKEOVER' : 'RELEASE_TO_AI', details: { status } },
  });
  return convo;
}
