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

### 3. Common Issues & Solutions

#### ❌ Build Fails with TypeScript Errors
**Solution**: 
- Check that all imports are correct
- Ensure no unused variables
- Fix any `any` type usage

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

### 4. Deployment Checklist

- [ ] Backend API is deployed and accessible
- [ ] `NEXT_PUBLIC_API_URL` environment variable set in Vercel
- [ ] Backend has proper CORS configuration
- [ ] All TypeScript errors resolved
- [ ] Build succeeds locally (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)

### 5. Post-Deployment Verification

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

If problems persist, check the specific error messages in Vercel build logs and compare with the solutions above.