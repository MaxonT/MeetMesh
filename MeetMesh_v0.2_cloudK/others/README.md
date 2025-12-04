# MeetMesh v0.2 (Cloud Minimal MVP)

A minimal full‑stack version of your When2Meet‑style app.

## Structure
backend/  # Node + Express + JSON file DB
frontend/ # Vite static site + vanilla JS (reads VITE_API_BASE)
others/

## Quick Start (Local)
### 1) Backend
cd backend
npm i
cp .env.example .env   # optional
npm start              # :8080

Health: GET http://localhost:8080/health

### 2) Frontend
cd ../frontend
npm i
cp .env.example .env   # edit VITE_API_BASE if needed
npm run dev            # :5173

Open http://localhost:5173

## API
POST /api/polls  { title, tz, slot, startISO, endISO, hStart, hEnd }
GET  /api/polls/:id
POST /api/polls/:id/availability  { name, cells: string[] }
GET  /api/polls/:id/aggregate

## Deploy
Backend: Render (Node), start `npm start`
Frontend: Vercel (Vite), env `VITE_API_BASE=https://<backend>`

Notes: Uses JSON file DB for simplicity; swap to SQL later.
