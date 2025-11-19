# Setup About Page in Contentstack

Follow these steps to create the DemoLux About page in Contentstack CMS.

## Prerequisites

- Node.js 16+ installed
- Access to your Contentstack account
- DemoLux stack already configured

## Step 1: Get Your Management Token

1. **Log into Contentstack:**
   - Go to https://app.contentstack.com
   - Select your DemoLux stack

2. **Navigate to Tokens:**
   - Click on **Settings** in the left sidebar
   - Click on **Tokens**

3. **Create a New Management Token:**
   - Click **+ New Token** button
   - Select **Management Token** (not Delivery Token)
   - Give it a name (e.g., "DemoLux Setup Script")
   - Set permissions:
     - **Content:** Read & Write
     - **Environments:** Select your `dev` environment
   - Click **Save**

4. **Copy the Token:**
   - Copy the generated management token
   - **Important:** Save it somewhere safe - you can only see it once!

## Step 2: Configure the Script

1. **Navigate to scripts folder:**
   ```bash
   cd scripts
   ```

2. **Edit the .env file:**
   ```bash
   # Open scripts/.env in your editor
   # Replace <YOUR_MANAGEMENT_TOKEN_HERE> with your actual token
   ```

   The file should look like this:
   ```bash
   CONTENTSTACK_API_KEY=bltc8d398936f6a33c7
   CONTENTSTACK_MANAGEMENT_TOKEN=cs5feb93af74b7eecfe41d0450  # Your actual token
   CONTENTSTACK_DELIVERY_TOKEN=cs1afa4bdab29f485166431ac8
   CONTENTSTACK_ENVIRONMENT=dev
   CONTENTSTACK_REGION=US
   ```

## Step 3: Test Your Connection

```bash
npm run test-connection
```

You should see:
- ✅ Successfully connected to Contentstack!
- List of your content types
- Confirmation that required content types exist

## Step 4: Create the About Page

```bash
npm run create-about-page
```

This script will:
1. Check if the 'page' content type exists
2. Create a new About page entry (or update if it exists)
3. Fill it with comprehensive DemoLux content
4. Publish it to your `dev` environment

You should see:
- ✅ About page created successfully!
- ✅ About page published successfully!
- 🎉 Done! Visit http://localhost:3000/about to see your About page.

## Step 5: View Your About Page

1. **Make sure your dev server is running:**
   ```bash
   # In the root directory (not scripts/)
   npm run dev
   ```

2. **Open your browser:**
   - Go to http://localhost:3000/about

3. **You should see:**
   - A beautifully designed About page
   - Hero section: "Redefining the Future of Luxury"
   - 7 content sections telling the DemoLux story
   - Brand history, philosophy, sustainability commitment
   - Product categories, awards, team info
   - All styled to match the DemoLux luxury brand

## What Gets Created

The script creates an About page with:

### Hero Section
- **Title:** Redefining the Future of Luxury
- **Subtitle:** Brand positioning statement

### Content Sections
1. **The Birth of a Vision** - Founding story (2018 Copenhagen warehouse)
2. **The DemoLux Difference** - Philosophy and craftsmanship approach
3. **Building Tomorrow, Responsibly** - Innovation & sustainability commitment
4. **Where Art Meets Intelligence** - Product categories overview
5. **A Global Standard** - Awards and global presence
6. **The Minds Behind the Vision** - Team and company values
7. **Be Part of Something Rare** - Closing message and invitation

All content is written in DemoLux's sophisticated, luxury tech brand voice.

## Troubleshooting

### Script fails with "Invalid token"
- Double-check you copied the full management token
- Ensure you created a **Management Token**, not a Delivery Token
- Verify the token has write permissions for your stack

### "page content type not found"
- The 'page' content type must exist in your Contentstack stack
- Check your Contentstack dashboard to verify
- You may need to create it manually if it doesn't exist

### About page shows 404
- Ensure the script completed successfully
- Check that the entry was published (script does this automatically)
- Try restarting your dev server: `npm run dev`
- Clear your browser cache

### Changes not appearing
- The script publishes to the `dev` environment by default
- Check that your .env.local has `CONTENTSTACK_ENVIRONMENT=dev`
- Restart your Next.js dev server to clear the cache

## Security Notes

⚠️ **IMPORTANT:**
- Management tokens have full write access to your CMS
- Never commit the `.env` file to git (already in .gitignore)
- Never share your management token publicly
- Rotate tokens regularly
- Use different tokens for different environments

## Next Steps

After creating the About page, you might want to:
- Customize the content in Contentstack dashboard
- Add images to the hero section
- Create other pages (Contact, Terms, etc.)
- Set up additional content entries

The About page is now live and demonstrating Contentstack's CMS capabilities!
