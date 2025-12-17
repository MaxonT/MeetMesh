
z
# MeetMesh v0.3 – Cloud Minimal MVP

MeetMesh is a lightweight, When2Meet-style scheduling mesh.  
Create a time grid, share a link, let everyone paint their availability, and MeetMesh will surface the best slots for the group.

> v0.3 (Cloud) – minimal full-stack version with a JSON file backend and a static Vite frontend.

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
```
⸻

🪪 License

© 2025 Tiger — MIT License
Attribution appreciated, not required.

⸻
