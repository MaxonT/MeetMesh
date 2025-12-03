/**
 * Database Adapter - handles fallback between Prisma and JSON DB
 * 
 * This module provides a unified interface for database operations.
 * If DATABASE_URL is set and Prisma is available, it uses Prisma.
 * Otherwise, it falls back to the original JSON file database.
 * 
 * Usage: Set DATABASE_URL in .env to enable Prisma (e.g., DATABASE_URL=file:./dev.db)
 */

const prisma = require('./prismaClient');
const jsonDb = require('../polls'); // Original JSON DB module

/**
 * Create a new poll
 */
async function createPoll(meta) {
  if (prisma) {
    // Prisma implementation
    const required = ['title','tz','slot','startISO','endISO','hStart','hEnd'];
    for (const k of required) {
      if (meta[k] === undefined || meta[k] === null || meta[k] === '') {
        throw new Error('Missing field: '+k);
      }
    }
    if (meta.hEnd <= meta.hStart) {
      throw new Error('hEnd must be greater than hStart');
    }
    
    // Generate unique ID
    const hash32 = (str) => {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < str.length; i++) { 
        h ^= str.charCodeAt(i); 
        h = Math.imul(h, 16777619); 
      }
      return (h >>> 0).toString(36);
    };
    const id = 'mm_' + hash32(JSON.stringify(meta) + Date.now());
    
    const poll = await prisma.poll.create({
      data: {
        id,
        title: meta.title,
        tz: meta.tz,
        slot: meta.slot,
        startISO: meta.startISO,
        endISO: meta.endISO,
        hStart: meta.hStart,
        hEnd: meta.hEnd
      },
      include: {
        availabilities: true
      }
    });
    
    // Convert to JSON DB format for API compatibility
    return {
      id: poll.id,
      meta: {
        title: poll.title,
        tz: poll.tz,
        slot: poll.slot,
        startISO: poll.startISO,
        endISO: poll.endISO,
        hStart: poll.hStart,
        hEnd: poll.hEnd
      },
      people: {}
    };
  } else {
    // JSON DB fallback
    return jsonDb.createPoll(meta);
  }
}

/**
 * Get a poll by ID
 */
async function getPoll(id) {
  if (prisma) {
    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        availabilities: true
      }
    });
    
    if (!poll) return null;
    
    // Convert to JSON DB format
    const people = {};
    for (const avail of poll.availabilities) {
      people[avail.name] = {
        cells: JSON.parse(avail.cells)
      };
    }
    
    return {
      id: poll.id,
      meta: {
        title: poll.title,
        tz: poll.tz,
        slot: poll.slot,
        startISO: poll.startISO,
        endISO: poll.endISO,
        hStart: poll.hStart,
        hEnd: poll.hEnd
      },
      people
    };
  } else {
    return jsonDb.getPoll(id);
  }
}

/**
 * Merge availability data for a poll
 */
async function mergeAvailability(id, name, cellsSet) {
  if (prisma) {
    const poll = await prisma.poll.findUnique({ where: { id } });
    if (!poll) throw new Error('Poll not found');
    
    // Get existing availability for this person
    const existing = await prisma.availability.findUnique({
      where: {
        pollId_name: {
          pollId: id,
          name: name
        }
      }
    });
    
    let mergedCells;
    if (existing) {
      // Merge with existing cells
      const existingCells = JSON.parse(existing.cells);
      const st = new Set(existingCells);
      for (const c of cellsSet) st.add(c);
      mergedCells = Array.from(st);
      
      await prisma.availability.update({
        where: {
          pollId_name: {
            pollId: id,
            name: name
          }
        },
        data: {
          cells: JSON.stringify(mergedCells)
        }
      });
    } else {
      // Create new availability
      mergedCells = Array.from(cellsSet);
      await prisma.availability.create({
        data: {
          pollId: id,
          name: name,
          cells: JSON.stringify(mergedCells)
        }
      });
    }
    
    // Return updated poll in JSON DB format
    return await getPoll(id);
  } else {
    return jsonDb.mergeAvailability(id, name, cellsSet);
  }
}

/**
 * Get aggregated availability counts for a poll
 */
async function aggregate(id) {
  if (prisma) {
    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        availabilities: true
      }
    });
    
    if (!poll) return null;
    
    const counts = {};
    for (const avail of poll.availabilities) {
      const cells = JSON.parse(avail.cells);
      for (const k of cells) {
        counts[k] = (counts[k] || 0) + 1;
      }
    }
    
    return { id, counts };
  } else {
    return jsonDb.aggregate(id);
  }
}

module.exports = {
  createPoll,
  getPoll,
  mergeAvailability,
  aggregate
};
