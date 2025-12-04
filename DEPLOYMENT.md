# Deployment Guide

## Vercel Deployment for v0.2 Frontend

The v0.2 frontend is organized in `MeetMesh_v0.2_cloud/frontend/`.

### Configuration

The repository includes both monorepo configuration (Turborepo) and standalone v0.2 applications. To ensure Vercel builds only the frontend without attempting to use the monorepo setup:

1. **`.vercelignore`**: Excludes monorepo configuration from Vercel builds
2. **`MeetMesh_v0.2_cloud/frontend/vercel.json`**: Explicitly configures npm-based build (not pnpm/turbo)

### Vercel Project Settings

Your existing Vercel project settings should work:

1. **Root Directory**: `MeetMesh_v0.2_cloud/frontend`
2. **Framework Preset**: `Other` or `Vite` 
3. Build Command: Uses vercel.json configuration (`npm install && npm run build`)
4. Output Directory: `dist` (default)
5. Install Command: Uses vercel.json configuration (`npm install`)

The `vercel.json` file in the frontend directory handles:
- Explicit npm-based installation (avoiding pnpm/turbo detection)
- SPA routing rewrites

### Future: New Monorepo Apps

When ready to deploy the new monorepo applications:

- **Frontend (`apps/web`)**: Configure as Next.js app with root directory `apps/web`
- **Backend (`apps/api`)**: Configure as Node.js app with root directory `apps/api`

Use Turborepo remote caching for optimal build performance across the monorepo.
