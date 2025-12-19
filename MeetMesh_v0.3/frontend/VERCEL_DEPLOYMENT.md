# MeetMesh Frontend Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Vercel Project Settings

**CRITICAL**: Configure your Vercel project with these settings:

1. **Root Directory**: `MeetMesh_v0.3/frontend`
2. **Framework Preset**: Next.js
3. **Build Command**: Uses `vercel.json` configuration (`npm run build`)
4. **Install Command**: Uses `vercel.json` configuration (`npm install`)
5. **Output Directory**: `.next`
6. **Node.js Version**: 20.x (recommended)

### 2. Environment Variables Setup
In your Vercel dashboard, set these environment variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

**Important**: Make sure your backend API is:
- ✅ Accessible from the internet
- ✅ Has CORS enabled for your Vercel domain
- ✅ Using HTTPS (recommended for production)

### 3. Build Configuration
The project includes a `vercel.json` file with proper configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

**Why explicit `installCommand`?**: This prevents Vercel from detecting the parent monorepo structure and attempting to use pnpm/turbo.

### 4. Monorepo Configuration Fix
**⚠️ CRITICAL**: The `.vercelignore` file at the repository root excludes the monorepo configuration to prevent Vercel from detecting pnpm workspace:

```
MeetMesh_v0.3/pnpm-workspace.yaml
MeetMesh_v0.3/turbo.json
MeetMesh_v0.3/packages/
```

This ensures Vercel uses npm (as specified in `vercel.json`) instead of trying to use pnpm.

### 5. Package Dependencies Fix
**⚠️ CRITICAL**: The `package.json` no longer references the local `@meetmesh/tsconfig` package. This dependency was removed because:
- It referenced a local file path (`file:../../packages/tsconfig`)
- This path doesn't exist in the Vercel build environment
- The `tsconfig.json` is already self-contained and doesn't need it

### 6. Common Issues & Solutions

#### ❌ Build Fails: "ERR_PNPM_LINKING_FAILED" or pnpm-related errors
**Solution**: ✅ FIXED
- Removed monorepo workspace detection by excluding `pnpm-workspace.yaml` via `.vercelignore`
- Added explicit `installCommand: "npm install"` in `vercel.json`
- This forces Vercel to use npm instead of detecting and trying to use pnpm

#### ❌ Build Fails: Cannot find module '@meetmesh/tsconfig'
**Solution**: ✅ FIXED
- Removed the `@meetmesh/tsconfig` dependency from `package.json`
- This dependency referenced a local file that doesn't exist in Vercel's build environment

#### ❌ Build Fails with TypeScript Errors
**Solution**: 
- Check that all imports are correct
- Ensure no unused variables
- Fix any `any` type usage

#### ❌ Cannot read file '/vercel/path0/MeetMesh_v0.3/packages/tsconfig/base.json'
**Solution**: ✅ FIXED - The `tsconfig.json` is self-contained

**Root Cause**: The `tsconfig.json` was extending from a monorepo package structure (`packages/tsconfig/base.json`) that doesn't exist in the Vercel build environment.

**Fix Applied**:
1. The `frontend/tsconfig.json` is now self-contained and doesn't extend from external files
2. This makes the TypeScript configuration independent of the monorepo structure

**Prevention**: Always ensure your `tsconfig.json` doesn't depend on external monorepo packages when deploying to Vercel.

#### ❌ API Connection Issues
**Solution**:
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend CORS settings
- Test API endpoint accessibility

#### ❌ Missing Dependencies
**Solution**:
- Run `npm install` locally first
- Check `package.json` for all required packages
- Ensure no private packages without access

### 5. Deployment Checklist

- [ ] Backend API is deployed and accessible
- [ ] `NEXT_PUBLIC_API_URL` environment variable set in Vercel
- [ ] Backend has proper CORS configuration
- [ ] All TypeScript errors resolved
- [ ] Build succeeds locally (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] TypeScript configuration is self-contained (no monorepo dependencies)

### 6. Post-Deployment Verification

After deployment, test these features:
- [ ] Homepage loads correctly
- [ ] Can create new events
- [ ] Event pages load with proper data
- [ ] Availability selection works
- [ ] Participant joining works
- [ ] Timezone switching works

## 🔧 Technical Details

### Project Structure
```
frontend/
├── app/                    # Next.js App Router
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and API
├── types/                  # TypeScript types
├── public/                 # Static assets
├── tsconfig.json           # Self-contained TypeScript config
└── vercel.json            # Vercel configuration
```

### Key Dependencies
- Next.js 14 (App Router)
- TypeScript 5
- Tailwind CSS
- Zustand (state management)
- Luxon (date/time handling)
- Axios (HTTP client)

### Build Process
1. TypeScript compilation
2. ESLint checking
3. Next.js optimization
4. Static page generation
5. Asset optimization

## 🆘 Still Having Issues?

1. **Check Vercel Logs**: Look at the build logs in Vercel dashboard
2. **Test Locally**: Run `npm run build` locally to reproduce issues
3. **Environment Variables**: Double-check all env vars are set correctly
4. **API Connectivity**: Ensure your backend API is accessible
5. **TypeScript Config**: Ensure `tsconfig.json` doesn't reference external monorepo packages

If problems persist, check the specific error messages in Vercel build logs and compare with the solutions above.