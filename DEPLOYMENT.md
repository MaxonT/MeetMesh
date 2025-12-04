# Deployment Guide

## Vercel Deployment for Legacy Frontend

The legacy frontend (`MeetMesh_v0.2_cloud/frontend`) has been moved to `legacy/MeetMesh_v0.2_cloud/frontend`.

### Vercel Project Settings

To deploy the legacy frontend on Vercel, update your project settings:

1. Go to your Vercel project settings
2. Navigate to **General** → **Build & Development Settings**
3. Set **Root Directory** to: `legacy/MeetMesh_v0.2_cloud/frontend`
4. Set **Framework Preset** to: `Vite`
5. Build Command: `npm run build` (default)
6. Output Directory: `dist` (default)
7. Install Command: `npm install` (default)

The `vercel.json` file in the frontend directory handles SPA routing rewrites.

### Future: New Monorepo Apps

When ready to deploy the new monorepo applications:

- **Frontend (`apps/web`)**: Configure as Next.js app with root directory `apps/web`
- **Backend (`apps/api`)**: Configure as Node.js app with root directory `apps/api`

Use Turborepo remote caching for optimal build performance across the monorepo.
