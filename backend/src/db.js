const { PrismaClient } = require('@prisma/client');

let dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Sl9rPxNqLIB7@ep-icy-sunset-b7szzbo2-pooler.c-13.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

if (dbUrl.includes('pooler') && !dbUrl.includes('pgbouncer=true')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true&connect_timeout=15';
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  datasourceUrl: dbUrl,
});

module.exports = prisma;

