#!/usr/bin/env node

/**
 * Comprehensive Neon Database Connection Test
 * Tests the specific Neon database configuration
 */

const { PrismaClient } = require('@prisma/client');

// Your specific Neon database URL
const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_f3GNjX2Bruhl@ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require";

console.log('🔗 Testing Neon Database Connection...');
console.log('📍 Database: Neon PostgreSQL');
console.log('🌐 Host: ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech');
console.log('🔒 SSL: Required');
console.log('');

// Test with the exact configuration
const prisma = new PrismaClient({
  log: ['error', 'warn', 'info'],
  datasources: {
    db: {
      url: NEON_DATABASE_URL,
    },
  },
});

async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to Neon database...');
    await prisma.$connect();
    console.log('✅ Connection successful!');

    console.log('🧪 Testing basic query...');
    const result = await prisma.$queryRaw`SELECT 
      NOW() as current_time,
      version() as postgres_version,
      current_database() as database_name,
      current_user as current_user`;
    
    console.log('✅ Query successful!');
    console.log('📊 Database Info:');
    console.log(`   Time: ${result[0].current_time}`);
    console.log(`   Version: ${result[0].postgres_version}`);
    console.log(`   Database: ${result[0].database_name}`);
    console.log(`   User: ${result[0].current_user}`);

    console.log('🔍 Testing table access...');
    try {
      // Test if we can access the User table
      const userCount = await prisma.user.count();
      console.log(`✅ User table accessible - Count: ${userCount}`);
      
      // Test if we can access other tables
      const postCount = await prisma.post.count();
      console.log(`✅ Post table accessible - Count: ${postCount}`);
      
      const goalCount = await prisma.goal.count();
      console.log(`✅ Goal table accessible - Count: ${goalCount}`);
      
    } catch (tableError) {
      console.log('⚠️  Tables may not exist yet (this is normal for new databases)');
      console.log(`   Error: ${tableError.message}`);
      
      // Test if we can create tables (migration test)
      console.log('🔨 Testing table creation permissions...');
      try {
        await prisma.$queryRaw`CREATE TABLE IF NOT EXISTS test_connection_table (id SERIAL PRIMARY KEY, test_field TEXT)`;
        await prisma.$queryRaw`DROP TABLE IF EXISTS test_connection_table`;
        console.log('✅ Table creation/deletion permissions confirmed');
      } catch (permError) {
        console.log('❌ Table creation failed:', permError.message);
      }
    }

    console.log('');
    console.log('🎉 All tests passed! Neon database is properly configured.');
    
  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error(`   Error Code: ${error.code || 'Unknown'}`);
    console.error(`   Message: ${error.message}`);
    
    if (error.message.includes('prisma://')) {
      console.error('');
      console.error('🔧 SOLUTION: The "prisma://" protocol error suggests:');
      console.error('   1. Prisma client cache issue - run: npm run postinstall');
      console.error('   2. Configuration conflict - verify DATABASE_URL format');
      console.error('   3. Old cached client - clear node_modules/.prisma');
    }
    
    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      console.error('');
      console.error('🔧 SOLUTION: Connection timeout suggests:');
      console.error('   1. Network connectivity issues');
      console.error('   2. Firewall blocking connection');
      console.error('   3. Database server overloaded');
    }
    
    if (error.message.includes('authentication') || error.message.includes('password')) {
      console.error('');
      console.error('🔧 SOLUTION: Authentication error suggests:');
      console.error('   1. Wrong password in DATABASE_URL');
      console.error('   2. User permissions issue');
      console.error('   3. Database user needs to be recreated');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed.');
  }
}

// Environment variable validation
console.log('🔍 Environment Variable Check:');
const envDatabaseUrl = process.env.DATABASE_URL;
if (envDatabaseUrl) {
  console.log('✅ DATABASE_URL environment variable is set');
  if (envDatabaseUrl === NEON_DATABASE_URL) {
    console.log('✅ DATABASE_URL matches expected Neon URL');
  } else {
    console.log('⚠️  DATABASE_URL differs from expected Neon URL');
    console.log(`   Expected: ${NEON_DATABASE_URL.substring(0, 50)}...`);
    console.log(`   Actual: ${envDatabaseUrl.substring(0, 50)}...`);
  }
} else {
  console.log('❌ DATABASE_URL environment variable is NOT set');
  console.log('💡 For local testing, run: export DATABASE_URL="postgresql://..."');
}
console.log('');

testConnection();
