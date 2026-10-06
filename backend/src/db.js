const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  datasourceUrl: process.env.DATABASE_URL || 'file:./dev.db',
});

module.exports = prisma;

