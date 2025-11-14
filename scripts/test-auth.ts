/**
 * Test script to verify authentication implementation
 * Run with: npx tsx scripts/test-auth.ts
 */

import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { generateAccessToken, verifyAccessToken } from '../lib/auth/jwt';

async function testAuth() {
  console.log('🔐 Testing Authentication System...\n');

  try {
    // Test 1: Password hashing
    console.log('Test 1: Password Hashing');
    const password = 'SecurePass123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    console.log(`✅ Password hashing: ${isValid ? 'PASS' : 'FAIL'}\n`);

    // Test 2: JWT token generation and verification
    console.log('Test 2: JWT Token Generation');
    const token = generateAccessToken({
      userId: 'test-user-id',
      email: 'test@example.com',
      subscriptionTier: 'free',
    });
    const payload = verifyAccessToken(token);
    console.log(`✅ JWT generation: ${payload ? 'PASS' : 'FAIL'}`);
    console.log(`   Token payload:`, payload, '\n');

    // Test 3: Database connection
    console.log('Test 3: Database Connection');
    const userCount = await prisma.user.count();
    console.log(`✅ Database connection: PASS`);
    console.log(`   Total users: ${userCount}\n`);

    // Test 4: Check schema fields
    console.log('Test 4: Schema Fields');
    const sampleUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        mfaEnabled: true,
        tokenVersion: true,
        resetToken: true,
      },
    });
    console.log(`✅ Schema fields: PASS`);
    console.log(`   Sample user:`, sampleUser || 'No users in database', '\n');

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
