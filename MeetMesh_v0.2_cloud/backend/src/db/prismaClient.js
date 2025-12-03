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
    console.log('Prisma client initialized successfully');
  } else {
    console.log('DATABASE_URL not set, using JSON DB fallback');
  }
} catch (error) {
  console.warn('Prisma client initialization failed, falling back to JSON DB:', error.message);
  prisma = null;
}

module.exports = prisma;
