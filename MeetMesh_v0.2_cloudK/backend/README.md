# MeetMesh Backend

Backend API for MeetMesh - a When2Meet-style scheduling application.

## Features

- RESTful API for poll creation and availability management
- Dual database support: SQLite (via Prisma) or JSON file (fallback)
- Automatic fallback to JSON DB when DATABASE_URL is not configured

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup (Optional - uses JSON DB by default)

To use SQLite database via Prisma:

```bash
# Copy environment file
cp .env.example .env

# Edit .env and ensure DATABASE_URL is set:
# DATABASE_URL=file:./dev.db

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npm run seed

# (Optional) Import existing JSON data
npm run migrate:json-to-sqlite
```

### 3. Start Server

```bash
npm start
```

Server runs on port 8080 by default (configurable via PORT env variable).

## API Endpoints

### Health Check
```
GET /health
Response: { "ok": true }
```

### Create Poll
```
POST /api/polls
Body: {
  "title": "Team Meeting",
  "tz": "America/New_York",
  "slot": 30,
  "startISO": "2025-12-15T00:00:00.000Z",
  "endISO": "2025-12-16T00:00:00.000Z",
  "hStart": 9,
  "hEnd": 17
}
Response: Poll object with generated ID
```

### Get Poll
```
GET /api/polls/:id
Response: Poll object with metadata and availability data
```

### Submit Availability
```
POST /api/polls/:id/availability
Body: {
  "name": "Alice",
  "cells": ["2025-12-15T14:00", "2025-12-15T14:30"]
}
Response: Updated poll object
```

### Get Aggregated Availability
```
GET /api/polls/:id/aggregate
Response: {
  "id": "poll_id",
  "counts": {
    "2025-12-15T14:00": 2,
    "2025-12-15T14:30": 3
  }
}
```

## Database Configuration

### JSON File Database (Default)
By default, the backend uses a simple JSON file for data storage at `data/db.json`. No setup required.

### SQLite via Prisma (Optional)
For better performance and scalability, you can enable SQLite:

1. Set `DATABASE_URL=file:./dev.db` in `.env`
2. Run `npx prisma generate`
3. Run `npx prisma migrate dev --name init`
4. (Optional) Import existing data: `npm run migrate:json-to-sqlite`

The backend will automatically use Prisma when `DATABASE_URL` is configured, and fallback to JSON DB otherwise.

## Available Scripts

- `npm start` - Start the server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations (interactive)
- `npm run seed` - Seed database with sample data
- `npm run migrate:json-to-sqlite` - Import JSON DB data into SQLite

## Environment Variables

Create a `.env` file based on `.env.example`:

```
PORT=8080                    # Server port (default: 8080)
DATA_DIR=./data             # JSON DB directory (default: ./data)
DATABASE_URL=file:./dev.db  # SQLite database URL (optional)
```

## Database Schema

The Prisma schema includes:

- **Poll**: Stores poll metadata (title, timezone, time slots, etc.)
- **Availability**: Stores user availability selections linked to polls
- **User**: Optional user management (for future features)

See `prisma/schema.prisma` for the full schema definition.

## Migration from JSON to SQLite

If you have existing data in the JSON file database and want to migrate to SQLite:

1. Ensure your current data is in `data/db.json`
2. Set up Prisma as described above
3. Run: `npm run migrate:json-to-sqlite`

This will import all existing polls and availability data into the SQLite database.

## Development

The backend is built with:
- Node.js + Express
- Prisma ORM (optional)
- SQLite database (optional)
- JSON file storage (fallback)

The codebase maintains backward compatibility - the JSON DB code is preserved and used as a fallback when Prisma is not configured.
