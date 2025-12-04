太好啦，MeetMesh 要上架了 🎯
我先给你一份 English-only 的 README.md，然后在后面再送你几段可以用在 GitHub description / 作品集的短描述。

⸻

✅ README.md（直接整份贴到仓库根目录）

# MeetMesh v0.2 – Cloud Minimal MVP

MeetMesh is a lightweight, When2Meet-style scheduling mesh.  
Create a time grid, share a link, let everyone paint their availability, and MeetMesh will surface the best slots for the group.

> v0.2 (Cloud) – minimal full-stack version with a JSON file backend and a static Vite frontend.

---

## Features

- 🧩 **Simple poll creation**  
  Define title, time zone, date range, slot length, and working hours.

- 🎨 **Drag-to-paint availability**  
  Click and drag across the grid to mark your own available times.

- ☁️ **Cloud persistence**  
  Availability is saved to a tiny JSON-based backend via REST APIs.

- 📊 **Auto-aggregated suggestions**  
  MeetMesh aggregates all participants and suggests the best time blocks.

- 🔗 **Shareable poll links**  
  Copy a URL and let others join the same poll instantly.

---

## Tech Stack

- **Backend:** Node.js, Express, CORS, JSON file storage
- **Frontend:** Vite, vanilla JavaScript, HTML, CSS
- **Storage:** `data/db.json` (file-based, swap to SQL later)
- **Deployment targets:**  
  - Backend → Render (Node)  
  - Frontend → Vercel (static site)

---

## Project Structure

```text
backend/           # Node + Express API (JSON file DB)
  server.js
  src/polls.js
  data/db.json
  .env.example

frontend/          # Vite SPA that talks to the backend
  index.html
  style.css
  src/core.js
  .env.example

others/
  README.md        # Internal notes
  .env.example


⸻

Getting Started (Local)

1) Backend

cd backend
npm install

# Optional: configure env
cp .env.example .env
# PORT=8080
# DATA_DIR=./data

npm start
# → API on http://localhost:8080

You should see:

MeetMesh backend on :8080

Health check:

curl http://localhost:8080/health
# { "ok": true }


⸻

2) Frontend

In a second terminal:

cd frontend
npm install

cp .env.example .env
# VITE_API_BASE=http://localhost:8080

npm run dev
# → Vite dev server on http://localhost:5173

Open http://localhost:5173 in your browser.

⸻

Basic Flow
	1.	Create a poll
	•	Fill in title, time zone, date range, slot length, and working hours.
	•	Click Create Poll.
	•	A poll ID and grid appear.
	2.	Mark your availability
	•	Type your name.
	•	Drag across cells on the grid to mark available slots.
	•	Click Save to Cloud.
	3.	Share with others
	•	Use Copy Share Link to copy the poll URL.
	•	Others open the link, paint their availability, and save.
	4.	Read suggestions
	•	The Suggestions area lists the top time blocks (date + time range + number of people).

⸻

API Overview

Backend endpoints (all JSON):

POST /api/polls
Body: {
  "title": string,
  "tz": string,
  "slot": number,         // minutes per cell
  "startISO": string,     // YYYY-MM-DD
  "endISO": string,       // YYYY-MM-DD (inclusive)
  "hStart": number,       // minutes from 00:00, e.g. 9*60
  "hEnd": number          // minutes from 00:00, e.g. 17*60
}

GET /api/polls/:id

POST /api/polls/:id/availability
Body: {
  "name": string,
  "cells": string[]       // ["0-0", "0-1", ...]
}

GET /api/polls/:id/aggregate
# → { id, counts: { "0-0": 3, "1-5": 2, ... } }

Storage is a simple db.json file under backend/data/.

⸻

Deployment

Backend (Render):
	•	Environment:
	•	PORT=8080 (Render will expose it)
	•	DATA_DIR=./data (or any persistent mount)
	•	Start command:

npm start



Frontend (Vercel or any static host):
	•	Build:

cd frontend
npm install
npm run build


	•	Set env var:
	•	VITE_API_BASE=https://<your-backend-domain>
	•	Deploy the dist/ folder as a static site.

⸻

Roadmap / Next Ideas
	•	Authentication and private polls
	•	Named teams / groups and reusable rosters
	•	Better conflict visualisation and heatmaps
	•	Migration from JSON file DB to SQL / hosted DB
	•	Calendar exports (ICS) and integration with Google Calendar

⸻

License

MIT (or choose your preferred license here).

---

## 🎯 额外送你几个「描述模板」

你可以用在 GitHub description、个人网站、作品集上。

### 1）GitHub repo short description（80 字左右）

> Real-time When2Meet-style scheduling mesh. Create a poll, drag to paint availability, and let the cloud backend surface the best group time.

### 2）长一点的项目介绍（作品集用）

> MeetMesh is a lightweight, full-stack scheduling mesh inspired by When2Meet. The app lets users create a time grid, share a link, and have everyone “paint” their availability directly on the calendar. A tiny Express backend stores availability in a JSON file and aggregates the data into ranked time suggestions, while a Vite + vanilla JS frontend focuses on a fast, low-friction interaction flow. It’s designed as a minimal, deployable MVP that can later grow into a full scheduling platform with richer analytics and integrations.

### 3）一句话 tagline

> “Paint your availability, let MeetMesh pick the time.”

---

如果你想要 **“面向投资人 / 招聘官”的版本**，我也可以帮你改成更偏 product / impact 角度的描述，让它直接变成你作品集里的旗舰项目之一 💪
