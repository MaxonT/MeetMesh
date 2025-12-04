# MeetMesh Web Frontend

A Next.js frontend for MeetMesh - a when2meet-style scheduling application.

## Features

- ✨ Create events with custom date ranges and time slots
- 📅 Interactive time grid with drag-to-select availability
- 🎨 Color-coded heatmap showing overlapping availability
- 👥 Participant management with optional usernames
- 🌍 Timezone support for global teams
- 📊 Availability analytics and best time suggestions
- 🔗 Shareable event links
- 📱 Responsive design (mobile, tablet, desktop)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Date/Time**: Luxon
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ or npm/pnpm
- Backend API running (see `apps/api` or `MeetMesh_v0.2_cloud/backend`)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your backend URL
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
apps/web/
├── app/                    # Next.js app router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── event/[eventId]/   # Event detail page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── CreateEventForm.tsx
│   ├── TimeGrid.tsx      # Core availability grid
│   ├── UserNameModal.tsx
│   └── ...
├── lib/                   # Core utilities
│   ├── api.ts            # API client
│   ├── store.ts          # Zustand store
│   ├── utils.ts          # Utility functions
│   └── constants.ts      # Constants & timezones
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── ...
```

## Key Components

### TimeGrid

The core component for selecting availability. Features:
- Drag-to-select time blocks
- Click-to-deselect
- Color-coded heatmap based on participant overlap
- Tooltips showing who is available
- Responsive grid layout

### CreateEventForm

Form for creating new events with:
- Event name and description
- Date range selection
- Time range selection
- Timezone selector

### AvailabilitySummary

Displays analytics including:
- Best times (most people available)
- Times when everyone is available
- Most available day

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:4000)

## Backend API Requirements

The frontend expects these API endpoints:

```
POST   /events                          - Create event
GET    /events/:eventId                 - Get event details + availability
PATCH  /events/:eventId                 - Update event
DELETE /events/:eventId                 - Delete event
POST   /events/:eventId/users           - Create user
PATCH  /events/:eventId/users/:userId   - Update username
POST   /events/:eventId/availability    - Save availability
DELETE /events/:eventId/availability    - Clear availability
GET    /events/:eventId/availability    - Get availability view
```

## User Flow

1. User visits home page and creates an event
2. Redirected to event page
3. Username modal appears (first visit)
4. User drags to select availability on time grid
5. Availability saves automatically
6. Grid updates with color-coded overlap
7. User shares link with others
8. Others join and add their availability
9. Summary shows best meeting times

## localStorage

User data is persisted in localStorage with key:
```
meetmesh_user_{eventId}
```

Contains:
```json
{
  "userId": "uuid",
  "username": "John Doe"
}
```

## License

MIT
