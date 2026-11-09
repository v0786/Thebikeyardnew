import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seed only application roles. Real dealership details and administrator
// credentials must be provisioned through an approved setup process.
// Never create demo users, passwords, or fictional GST details in production.
const ROLES = [
  'Super Admin',
  'Owner',
  'Manager',
  'Sales Exec',
  'Accountant',
  'Insurance Staff',
  'RTO Staff',
];

async function main() {
  for (const name of ROLES) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Seed complete (roles only; no demo accounts or dealership).');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
