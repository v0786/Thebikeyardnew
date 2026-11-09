import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    throw new AuthError('Unauthorized: Active dealership session required.', 401);
  }

  // A signed session alone is insufficient: staff may be disabled or removed
  // before the token expires. Always resolve current account state and role.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!user || !user.isActive || user.deletedAt) {
    throw new AuthError('Unauthorized: Staff account is inactive or unavailable.', 401);
  }
  return { ...session!.user, id: user.id, role: user.role.name, dealershipId: user.dealershipId };
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError('Forbidden: Insufficient privileges.', 403);
  }
  return user;
}
