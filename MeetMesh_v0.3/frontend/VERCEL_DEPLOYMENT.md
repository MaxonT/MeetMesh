# MeetMesh Frontend Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Environment Variables Setup
In your Vercel dashboard, set these environment variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

**Important**: Make sure your backend API is:
- ✅ Accessible from the internet
- ✅ Has CORS enabled for your Vercel domain
- ✅ Using HTTPS (recommended for production)

### 2. Build Configuration
The project includes a `vercel.json` file with proper configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### 3. TypeScript Configuration Fix
**⚠️ CRITICAL**: The `tsconfig.json` has been updated to be self-contained and no longer depends on the monorepo packages structure. This fixes the Vercel build error.

### 4. Common Issues & Solutions

#### ❌ Build Fails with TypeScript Errors
**Solution**: 
- Check that all imports are correct
- Ensure no unused variables
- Fix any `any` type usage

#### ❌ Cannot read file '/vercel/path0/MeetMesh_v0.3/packages/tsconfig/base.json'
**Solution**: ✅ FIXED - Updated `tsconfig.json` to be self-contained

**Root Cause**: The `tsconfig.json` was extending from a monorepo package structure (`packages/tsconfig/base.json`) that doesn't exist in the Vercel build environment.

**Fix Applied**:
1. Updated `frontend/tsconfig.json` to extend from `./tsconfig.base.json` instead of the monorepo path
2. Created a local `tsconfig.base.json` in the frontend directory
3. This makes the TypeScript configuration self-contained and independent of the monorepo structure

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