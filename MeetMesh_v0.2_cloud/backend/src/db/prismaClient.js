/**
 * Prisma Client initialization
 * 
 * Exports a Prisma client instance if DATABASE_URL is configured.
 * Returns null if Prisma is not configured or initialization fails.
 */

let prisma = null;

try {
  // Only initialize if DATABASE_URL is set
  if (process.env.DATABASE_URL) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    
    // Test connection
    prisma.$connect().catch(err => {
      console.warn('Prisma connection failed, falling back to JSON DB:', err.message);
      prisma = null;
    });
  }
} catch (error) {
  console.warn('Prisma client initialization failed, falling back to JSON DB:', error.message);
  prisma = null;
}

module.exports = prisma;
