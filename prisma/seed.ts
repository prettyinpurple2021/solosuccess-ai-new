import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Seed data is minimal as per requirements
  // Agent definitions are stored in application code, not database
  // Subscription tiers are stored in application code, not database
  
  console.log('Seed completed successfully!');
  console.log('Note: Agent definitions and subscription tiers are managed in application code.');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
