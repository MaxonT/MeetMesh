/**
 * Migration script: Import JSON DB data into SQLite via Prisma
 * 
 * Usage: npm run migrate:json-to-sqlite
 * 
 * This script reads the existing JSON file database and imports all polls
 * and availability data into the SQLite database.
 * 
 * Prerequisites:
 * 1. DATABASE_URL must be set in .env
 * 2. Prisma migrations must be run: npx prisma migrate dev --name init
 * 3. Prisma client must be generated: npx prisma generate
 */

const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

async function migrate() {
  console.log('Starting migration from JSON DB to SQLite...\n');
  
  // Check if JSON DB exists
  if (!fs.existsSync(DB_FILE)) {
    console.log('No JSON DB file found at:', DB_FILE);
    console.log('Nothing to migrate.');
    return;
  }
  
  // Read JSON DB
  const jsonData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  const polls = jsonData.polls || {};
  
  const pollIds = Object.keys(polls);
  if (pollIds.length === 0) {
    console.log('JSON DB is empty. Nothing to migrate.');
    return;
  }
  
  console.log(`Found ${pollIds.length} poll(s) to migrate.\n`);
  
  let pollsMigrated = 0;
  let availabilitiesMigrated = 0;
  
  for (const pollId of pollIds) {
    const pollData = polls[pollId];
    const meta = pollData.meta;
    
    console.log(`Migrating poll: ${pollId} - "${meta.title}"`);
    
    try {
      // Check if poll already exists
      const existing = await prisma.poll.findUnique({ where: { id: pollId } });
      
      if (existing) {
        console.log(`  ⚠ Poll ${pollId} already exists, skipping...`);
        continue;
      }
      
      // Create poll
      await prisma.poll.create({
        data: {
          id: pollId,
          title: meta.title,
          tz: meta.tz,
          slot: meta.slot,
          startISO: meta.startISO,
          endISO: meta.endISO,
          hStart: meta.hStart,
          hEnd: meta.hEnd
        }
      });
      
      pollsMigrated++;
      console.log(`  ✓ Poll created`);
      
      // Migrate availability data
      const people = pollData.people || {};
      const names = Object.keys(people);
      
      for (const name of names) {
        const cells = people[name].cells || [];
        
        await prisma.availability.create({
          data: {
            pollId: pollId,
            name: name,
            cells: JSON.stringify(cells)
          }
        });
        
        availabilitiesMigrated++;
        console.log(`  ✓ Availability for "${name}" created (${cells.length} cells)`);
      }
      
    } catch (error) {
      console.error(`  ✗ Error migrating poll ${pollId}:`, error.message);
    }
  }
  
  console.log('\n=== Migration Summary ===');
  console.log(`Polls migrated: ${pollsMigrated}/${pollIds.length}`);
  console.log(`Availabilities migrated: ${availabilitiesMigrated}`);
  console.log('\nMigration completed!');
}

// Run migration
migrate()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    prisma.$disconnect();
  });
