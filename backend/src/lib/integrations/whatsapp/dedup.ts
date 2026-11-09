import { prisma } from '@/lib/prisma';
import { safeLogError } from './security';

const memorySeen = new Map<string, number>();
const MEMORY_TTL_MS = 24 * 60 * 60 * 1000;
const MEMORY_MAX = 5000;

function pruneMemory(now: number) {
  if (memorySeen.size <= MEMORY_MAX) return;
  for (const [k, ts] of memorySeen) {
    if (now - ts > MEMORY_TTL_MS || memorySeen.size > MEMORY_MAX) memorySeen.delete(k);
    if (memorySeen.size <= MEMORY_MAX) break;
  }
}

function claimMemory(key: string): boolean {
  const now = Date.now();
  const existing = memorySeen.get(key);
  if (existing && now - existing < MEMORY_TTL_MS) return false;
  memorySeen.set(key, now);
  pruneMemory(now);
  return true;
}

/**
 * Claim a provider event/message id for processing. Returns true only for the
 * first claimant (deduplicates webhook retries). Uses DB when available; falls
 * back to bounded in-memory dedup if DB is unavailable.
 */
export async function claimWebhookEvent(providerEventId: string, eventType: string): Promise<boolean> {
  if (!providerEventId || providerEventId.length > 191) return false;
  try {
    await prisma.whatsappWebhookEvent.create({
      data: { providerEventId, eventType, status: 'received', attempts: 1 },
    });
    return true;
  } catch (err: unknown) {
    // Unique constraint => duplicate delivery (expected)
    const code = (err as { code?: string })?.code;
    if (code === 'P2002') return false;
    // DB unavailable/misconfigured => best-effort memory fallback
    safeLogError({ event: 'dedup_db_fallback', code: code ?? 'unknown' });
    return claimMemory(`${eventType}:${providerEventId}`);
  }
}

export async function markWebhookEvent(
  providerEventId: string,
  status: 'processed' | 'ignored' | 'failed',
  safeError?: string,
): Promise<void> {
  try {
    await prisma.whatsappWebhookEvent.update({
      where: { providerEventId },
      data: { status, processedAt: new Date(), safeError: safeError?.slice(0, 500) },
    });
  } catch {
    // non-fatal; dedup claim is the critical path
  }
}

// Exported for tests
export function _resetMemoryDedup() {
  memorySeen.clear();
}
