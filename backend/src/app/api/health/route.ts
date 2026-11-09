import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsPreflight, withCors } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}

// GET /api/health — liveness + database connectivity check.
export async function GET(request: Request) {
  let database: 'up' | 'down' | 'unknown' = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'up';
  } catch {
    database = 'down';
  }

  return withCors(
    request,
    NextResponse.json(
      { data: { status: 'ok', service: 'the-bike-yard-backend', database } },
      { status: 200 },
    ),
  );
}

