# Deployment Guide

## Vercel Deployment for v0.2 Frontend

The v0.2 frontend is organized in `MeetMesh_v0.2_cloud/frontend/`.

### Vercel Project Settings

Your existing Vercel project settings should work without changes:

1. **Root Directory**: `MeetMesh_v0.2_cloud/frontend` (existing setting)
2. **Framework Preset**: `Vite`
3. Build Command: `npm run build` (default)
4. Output Directory: `dist` (default)
5. Install Command: `npm install` (default)

The `vercel.json` file in the frontend directory handles SPA routing rewrites.

### Future: New Monorepo Apps

When ready to deploy the new monorepo applications:

- **Frontend (`apps/web`)**: Configure as Next.js app with root directory `apps/web`
- **Backend (`apps/api`)**: Configure as Node.js app with root directory `apps/api`

Use Turborepo remote caching for optimal build performance across the monorepo.
