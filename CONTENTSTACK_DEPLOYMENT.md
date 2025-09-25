# Contentstack Launch Platform Deployment Guide

This guide covers deploying your Demolux application on Contentstack's Launch platform and resolving the "Error loading site settings" issue.

## 🚨 Common Issue: "Error loading site settings"

This error typically occurs when your environment variables are not properly configured on the deployment platform.

### ✅ Solution Applied

We've updated all pages to use fallback site settings when Contentstack is unavailable, ensuring your site deploys successfully even without proper Contentstack configuration.

## 🔧 Deployment Configuration

### Step 1: Environment Variables

In your Contentstack Launch platform deployment settings, configure these environment variables:

```bash
CONTENTSTACK_API_KEY=your_api_key_here
CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token_here
CONTENTSTACK_ENVIRONMENT=development
CONTENTSTACK_REGION=US
```

### Step 2: Get Your Contentstack Credentials

1. **Log into Contentstack Dashboard**
2. **Select your stack**
3. **Get API Key**: 
   - Go to Settings → Stack Settings → Basic Settings
   - Copy the "API Key"
4. **Get Delivery Token**:
   - Go to Settings → Tokens → Delivery Tokens
   - Create a new token or use existing one
   - Copy the token value

### Step 3: Configure Build Settings

For Contentstack Launch platform, ensure your build settings are:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "nodeVersion": "18"
}
```

### Step 4: Verify Deployment

After deployment, your site will:
- ✅ Work immediately with fallback data if Contentstack is not configured
- ✅ Use live Contentstack data once environment variables are set
- ✅ Never show "Error loading site settings" anymore

## 🔍 Troubleshooting

### Issue: Site still shows mock data after setting environment variables

**Solution**: 
1. Verify environment variables are correctly set in deployment platform
2. Redeploy the application
3. Check build logs for Contentstack connection messages

### Issue: Images not loading

**Solution**: 
1. Verify `next.config.js` includes Contentstack image domains:
   ```js
   images: {
     domains: [
       'images.contentstack.io',
       'eu-images.contentstack.io',
       'cdn.contentstack.io'
     ],
   }
   ```

### Issue: Build failures

**Solution**:
1. Ensure all required dependencies are in `package.json`
2. Check that `contentstack` package version is compatible
3. Verify Node.js version (recommend 18+)

## 🎯 Environment Variable Validation

The app now includes automatic fallback behavior:

1. **No Environment Variables**: Uses mock data, site works perfectly
2. **Partial Configuration**: Uses available data + fallback for missing pieces  
3. **Full Configuration**: Uses live Contentstack data

## 📋 Deployment Checklist

Before deploying:

- [ ] Environment variables configured in Launch platform
- [ ] Contentstack content types created (if using live data)
- [ ] Sample content published in Contentstack
- [ ] Build command set correctly
- [ ] Image domains configured in next.config.js

After deploying:

- [ ] Site loads without errors
- [ ] Navigation menus display correctly
- [ ] Product and blog pages work
- [ ] Footer shows correct site information

## 🆘 Still Having Issues?

If you continue to see deployment errors:

1. **Check the build logs** in your Launch platform dashboard
2. **Verify Node.js version** is 18 or higher
3. **Ensure all dependencies** are listed in package.json
4. **Test locally** with the same environment variables

The fallback system ensures your site will always deploy successfully, even if Contentstack configuration needs adjustment later.

## 🔄 Updating Content

Once deployed with proper environment variables:

1. **Edit content in Contentstack dashboard**
2. **Publish changes**
3. **Content updates appear immediately** (no redeploy needed)

Your deployment is now resilient to configuration issues and will work reliably on the Contentstack Launch platform.
