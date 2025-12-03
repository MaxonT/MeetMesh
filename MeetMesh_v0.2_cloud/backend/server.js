/**
 * MeetMesh v0.2 Cloud - Backend (Express)
 */
const express = require('express');
const cors = require('cors');
const db = require('./src/db/jsonFallback');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/polls', async (req, res) => {
  try {
    const poll = await db.createPoll(req.body || {});
    res.status(201).json(poll);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Bad Request' });
  }
});

app.get('/api/polls/:id', async (req, res) => {
  try {
    const poll = await db.getPoll(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Not Found' });
    res.json(poll);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Internal Server Error' });
  }
});

app.post('/api/polls/:id/availability', async (req, res) => {
  try {
    const { name, cells } = req.body || {};
    if (!name || !Array.isArray(cells)) throw new Error('name and cells[] required');
    const updated = await db.mergeAvailability(req.params.id, name, new Set(cells));
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Bad Request' });
  }
});

app.get('/api/polls/:id/aggregate', async (req, res) => {
  try {
    const agg = await db.aggregate(req.params.id);
    if (!agg) return res.status(404).json({ error: 'Not Found' });
    res.json(agg);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Internal Server Error' });
  }
});

app.listen(PORT, () => console.log('MeetMesh backend on :'+PORT));
