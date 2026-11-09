import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

/**
 * Sale completion is deliberately disabled until verified payment reconciliation,
 * GST configuration, inventory locking, and audit trails are implemented.
 *
 * The legacy sales service must not be called from a public API: it marks
 * payments SUCCESS and deliveries DELIVERED without payment confirmation.
 */
export async function POST() {
  try {
    await requireRole(['Manager', 'Super Admin', 'Owner']);
  } catch (error: unknown) {
    const e = error as { statusCode?: number; code?: string; message?: string };
    return NextResponse.json(
      { error: { code: e.statusCode ? e.code ?? 'AUTH_ERROR' : 'AUTH_ERROR', message: 'Not authorized to complete sales.' } },
      { status: e.statusCode ?? 401 },
    );
  }

  return NextResponse.json(
    {
      error: {
        code: 'SALE_COMPLETION_DISABLED',
        message: 'Sale completion is unavailable until verified payments, tax configuration and inventory concurrency controls are deployed.',
      },
    },
    { status: 503 },
  );
}
