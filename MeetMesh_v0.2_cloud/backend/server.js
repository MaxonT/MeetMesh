/**
 * MeetMesh v0.2 Cloud - Backend (Express)
 */
const express = require('express');
const cors = require('cors');
const polls = require('./src/polls');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/polls', (req, res) => {
  try {
    const poll = polls.createPoll(req.body || {});
    res.status(201).json(poll);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Bad Request' });
  }
});

app.get('/api/polls/:id', (req, res) => {
  const poll = polls.getPoll(req.params.id);
  if (!poll) return res.status(404).json({ error: 'Not Found' });
  res.json(poll);
});

app.post('/api/polls/:id/availability', (req, res) => {
  try {
    const { name, cells } = req.body || {};
    if (!name || !Array.isArray(cells)) throw new Error('name and cells[] required');
    const updated = polls.mergeAvailability(req.params.id, name, new Set(cells));
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Bad Request' });
  }
});

app.get('/api/polls/:id/aggregate', (req, res) => {
  const agg = polls.aggregate(req.params.id);
  if (!agg) return res.status(404).json({ error: 'Not Found' });
  res.json(agg);
});

app.listen(PORT, () => console.log('MeetMesh backend on :'+PORT));
