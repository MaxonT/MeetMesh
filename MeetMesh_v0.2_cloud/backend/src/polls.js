const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ polls: {} }, null, 2));
}
function readDb() { ensureDb(); return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')); }
function writeDb(db) { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }

function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}

function createPoll(meta) {
  const required = ['title','tz','slot','startISO','endISO','hStart','hEnd'];
  for (const k of required) if (meta[k] === undefined || meta[k] === null || meta[k] === '') throw new Error('Missing field: '+k);
  if (meta.hEnd <= meta.hStart) throw new Error('hEnd must be greater than hStart');
  const id = 'mm_' + hash32(JSON.stringify(meta) + Date.now());
  const db = readDb();
  db.polls[id] = { id, meta, people: {} };
  writeDb(db);
  return db.polls[id];
}
function getPoll(id) { const db = readDb(); return db.polls[id] || null; }
function mergeAvailability(id, name, cellsSet) {
  const db = readDb(); const poll = db.polls[id]; if (!poll) throw new Error('Poll not found');
  if (!poll.people[name]) poll.people[name] = { cells: [] };
  const st = new Set(poll.people[name].cells);
  for (const c of cellsSet) st.add(c);
  poll.people[name].cells = Array.from(st);
  writeDb(db); return poll;
}
function aggregate(id) {
  const db = readDb(); const poll = db.polls[id]; if (!poll) return null;
  const counts = {};
  for (const name of Object.keys(poll.people)) for (const k of poll.people[name].cells) counts[k]=(counts[k]||0)+1;
  return { id, counts };
}
module.exports = { createPoll, getPoll, mergeAvailability, aggregate };
