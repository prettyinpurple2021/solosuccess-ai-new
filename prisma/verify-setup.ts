import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient();

async function verifySetup() {
  console.log('🔍 Verifying database setup...\n');

  try {
    // Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connection successful\n');

    // Check if tables exist by querying each model
    console.log('2. Verifying database schema...');
    
    const checks = [
      { name: 'User', query: () => prisma.user.count() },
      { name: 'UserProfile', query: () => prisma.userProfile.count() },
      { name: 'Conversation', query: () => prisma.conversation.count() },
      { name: 'MissionControlSession', query: () => prisma.missionControlSession.count() },
      { name: 'GeneratedContent', query: () => prisma.generatedContent.count() },
      { name: 'BusinessPlan', query: () => prisma.businessPlan.count() },
      { name: 'Goal', query: () => prisma.goal.count() },
      { name: 'CompetitorProfile', query: () => prisma.competitorProfile.count() },
      { name: 'CompetitorActivity', query: () => prisma.competitorActivity.count() },
      { name: 'Subscription', query: () => prisma.subscription.count() },
    ];

    for (const check of checks) {
      try {
        await check.query();
        console.log(`   ✅ ${check.name} table exists`);
      } catch (error) {
        console.log(`   ❌ ${check.name} table missing or inaccessible`);
        throw error;
      }
    }

    console.log('\n✨ Database setup verification complete!');
    console.log('\nYour database is ready to use. You can now:');
    console.log('  - Run the development server: npm run dev');
    console.log('  - Open Prisma Studio: npm run prisma:studio');
    console.log('  - Seed initial data: npm run prisma:seed');

  } catch (error) {
    console.error('\n❌ Database setup verification failed!');
    console.error('\nError details:', error);
    console.error('\nPlease ensure:');
    console.error('  1. PostgreSQL is running');
    console.error('  2. DATABASE_URL in .env is correct');
    console.error('  3. You have run: npm run prisma:migrate');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySetup();
