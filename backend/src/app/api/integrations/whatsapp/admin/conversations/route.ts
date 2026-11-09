import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { getWhatsappConfig } from '@/lib/integrations/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROLES = ['Manager', 'Super Admin', 'Owner', 'Sales Exec'];

export async function GET(request: Request) {
  try {
    await requireRole(ROLES);
  } catch (error: unknown) {
    const e = error as { statusCode?: number; code?: string };
    return NextResponse.json(
      { error: { code: e.code ?? 'AUTH_ERROR', message: 'Not authorized.' } },
      { status: e.statusCode ?? 401 },
    );
  }

  const url = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || '30')));
  const cfg = getWhatsappConfig();

  try {
    const conversations = await prisma.whatsappConversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { bodyText: true, direction: true, createdAt: true } },
        leadLinks: { take: 3, orderBy: { createdAt: 'desc' } },
      },
    });
    return NextResponse.json({ data: { conversations, whatsappMode: cfg.mode, testModeSafe: cfg.mode !== 'production' || cfg.productionApproved } });
  } catch {
    return NextResponse.json({ error: { code: 'DB_UNAVAILABLE', message: 'WhatsApp conversation store unavailable.' } }, { status: 503 });
  }
}
