import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { setConversationMode } from '@/lib/integrations/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROLES = ['Manager', 'Super Admin', 'Owner', 'Sales Exec'];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(ROLES);
  } catch (error: unknown) {
    const e = error as { statusCode?: number; code?: string };
    return NextResponse.json({ error: { code: e.code ?? 'AUTH_ERROR', message: 'Not authorized.' } }, { status: e.statusCode ?? 401 });
  }
  const { id } = await params;
  try {
    const conversation = await prisma.whatsappConversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' }, take: 200 },
        leadLinks: { orderBy: { createdAt: 'desc' } },
        auditLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!conversation) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Conversation not found.' } }, { status: 404 });
    return NextResponse.json({ data: { conversation } });
  } catch {
    return NextResponse.json({ error: { code: 'DB_UNAVAILABLE', message: 'WhatsApp conversation store unavailable.' } }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let actorId: string | undefined;
  try {
    const user = await requireRole(ROLES);
    actorId = (user as { id?: string }).id;
  } catch (error: unknown) {
    const e = error as { statusCode?: number; code?: string };
    return NextResponse.json({ error: { code: e.code ?? 'AUTH_ERROR', message: 'Not authorized.' } }, { status: e.statusCode ?? 401 });
  }

  const { id } = await params;
  let body: { mode?: string };
  try {
    body = (await request.json()) as { mode?: string };
  } catch {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Invalid JSON.' } }, { status: 400 });
  }

  if (body.mode !== 'AI' && body.mode !== 'HUMAN') {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'mode must be AI or HUMAN.' } }, { status: 400 });
  }

  try {
    const conversation = await setConversationMode(id, body.mode, actorId);
    return NextResponse.json({ data: { conversation } });
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === 'P2025') return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Conversation not found.' } }, { status: 404 });
    return NextResponse.json({ error: { code: 'DB_UNAVAILABLE', message: 'Unable to update conversation.' } }, { status: 503 });
  }
}
