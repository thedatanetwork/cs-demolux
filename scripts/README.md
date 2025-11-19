# DemoLux Contentstack Scripts

This directory contains scripts for managing content in Contentstack CMS.

## Setup

1. **Install dependencies:**
   ```bash
   cd scripts
   npm install
   ```

2. **Configure environment variables:**

   Edit the `.env` file and add your Contentstack Management Token:
   ```bash
   CONTENTSTACK_API_KEY=bltc8d398936f6a33c7
   CONTENTSTACK_MANAGEMENT_TOKEN=<YOUR_MANAGEMENT_TOKEN_HERE>
   CONTENTSTACK_DELIVERY_TOKEN=cs1afa4bdab29f485166431ac8
   CONTENTSTACK_ENVIRONMENT=dev
   CONTENTSTACK_REGION=US
   ```

   **Getting your Management Token:**
   - Log into your Contentstack account
   - Go to Settings → Tokens
   - Create a new Management Token with appropriate permissions
   - Copy the token and paste it in the `.env` file

## Available Scripts

### Test Connection
Verify your Contentstack credentials and connection:

```bash
npm run test-connection
```

This will:
- Test your API key and management token
- List all content types in your stack
- Verify required content types exist

### Create About Page
Create and publish the About page with comprehensive DemoLux content:

```bash
npm run create-about-page
```

This will:
- Check if the 'page' content type exists
- Create or update the About page entry
- Publish the page to the configured environment
- Make it immediately visible at `/about`

## Workflow

1. First, test your connection:
   ```bash
   npm run test-connection
   ```

2. If the connection is successful, create the About page:
   ```bash
   npm run create-about-page
   ```

3. Visit `http://localhost:3000/about` to see your new About page!

## Troubleshooting

### "Invalid token" error
- Verify your `CONTENTSTACK_MANAGEMENT_TOKEN` is correct
- Ensure the token has write permissions for the stack
- Check that you're using a Management Token, not a Delivery Token

### "page content type not found" error
- The 'page' content type needs to exist in your Contentstack stack
- Check your Contentstack dashboard to verify it's been created
- You may need to create it manually or through another setup script

### Content not appearing on the site
- Ensure the page was published (the script does this automatically)
- Check that you're viewing the site at `http://localhost:3000/about`
- Try refreshing the page or restarting your development server

## Security Notes

⚠️ **IMPORTANT:** The `.env` file contains sensitive credentials:
- Never commit `.env` to git
- The `.gitignore` is configured to exclude it
- Management tokens have full write access to your CMS

## About the Content

The About page includes:
- **Hero Section:** Brand positioning and story
- **7 Content Sections:**
  1. The Birth of a Vision (founding story)
  2. The DemoLux Difference (philosophy and approach)
  3. Building Tomorrow, Responsibly (innovation & sustainability)
  4. Where Art Meets Intelligence (product categories)
  5. A Global Standard (awards and recognition)
  6. The Minds Behind the Vision (team and values)
  7. Be Part of Something Rare (closing message)

All content is written to match DemoLux's luxury tech brand voice and integrates seamlessly with the existing site design.
