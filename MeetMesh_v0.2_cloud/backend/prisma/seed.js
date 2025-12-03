/**
 * Prisma Seed Script
 * 
 * Creates sample data for testing the database.
 * 
 * Usage: npm run seed
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...\n');
  
  // Create a sample poll
  const poll1 = await prisma.poll.create({
    data: {
      id: 'mm_sample_poll_1',
      title: 'Team Meeting',
      tz: 'America/New_York',
      slot: 30,
      startISO: '2025-12-15T00:00:00.000Z',
      endISO: '2025-12-16T00:00:00.000Z',
      hStart: 9,
      hEnd: 17
    }
  });
  
  console.log('Created poll:', poll1.id);
  
  // Add sample availability data
  const avail1 = await prisma.availability.create({
    data: {
      pollId: poll1.id,
      name: 'Alice',
      cells: JSON.stringify(['2025-12-15T14:00', '2025-12-15T14:30', '2025-12-15T15:00'])
    }
  });
  
  const avail2 = await prisma.availability.create({
    data: {
      pollId: poll1.id,
      name: 'Bob',
      cells: JSON.stringify(['2025-12-15T14:30', '2025-12-15T15:00', '2025-12-15T15:30'])
    }
  });
  
  console.log('Created availability for:', avail1.name);
  console.log('Created availability for:', avail2.name);
  
  // Create another sample poll
  const poll2 = await prisma.poll.create({
    data: {
      id: 'mm_sample_poll_2',
      title: 'Project Review',
      tz: 'UTC',
      slot: 60,
      startISO: '2025-12-20T00:00:00.000Z',
      endISO: '2025-12-21T00:00:00.000Z',
      hStart: 10,
      hEnd: 16
    }
  });
  
  console.log('Created poll:', poll2.id);
  
  // Create sample users (optional)
  const user1 = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com'
    }
  });
  
  const user2 = await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@example.com'
    }
  });
  
  console.log('Created user:', user1.name);
  console.log('Created user:', user2.name);
  
  console.log('\n✓ Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
