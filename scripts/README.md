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

### Create New Products
Create and publish 8 new luxury products to the catalog:

```bash
npm run create-new-products
```

This will:
- Create 8 new product entries (2 wearable-tech, 6 technofurniture)
- Automatically publish all products to the configured environment
- Skip any products that already exist (safe to re-run)
- Show a summary of created vs skipped products

**Products Created:**
- LuminFrame™ Ambient Display Mirror ($4,299)
- HaloVibe™ Resonance Table ($3,599)
- FluxBand™ Kinetic Wearable Display ($899)
- EtherSphere™ Floating Light Orb ($599)
- AeroSlate™ Smart Wall Panel ($399)
- VeloChair™ Motion-Adaptive Lounge Seat ($5,499)
- PrismFold™ Pocket Hologram Projector ($1,299)
- PulseLine™ Interactive Floor Strip ($799)

**After running:**
1. Log into Contentstack
2. Navigate to Entries → Product
3. Upload featured images for each new product
4. Re-publish after adding images

Products will automatically appear on the homepage, category pages, and in search results.

### Add Product Images Field
Update the Product content type schema to support multiple images:

```bash
npm run add-product-images
```

This will:
- Add an `additional_images` field to the Product content type
- Configure it as a multiple file field (optional)
- Enable product galleries and image cycling on hover
- Safe to re-run (checks if field already exists)

**After running:**
1. Log into Contentstack
2. Navigate to Content Models → Product to verify the new field
3. Edit existing products to upload additional images
4. Save and publish products
5. View products on the site to see the new image gallery and hover effects

### Update URL Fields to URL Field Type
Convert text fields to URL field type for proper URL handling:

```bash
npm run update-url-fields
```

This will:
- Convert `url` field in Product content type from text to URL field
- Convert `url` field in Blog Post content type from text to URL field
- Convert `slug` field in Page content type from text to URL field
- Add helpful placeholder text and instructions for each field
- Safe to re-run (checks if field is already URL type)

**Benefits:**
- URL-specific validation and constraints
- Better content creator experience with guidance
- Support for unique URL enforcement
- Designed specifically for webpage routing

**After running:**
1. Log into Contentstack to verify the changes
2. Existing content will continue to work (data format unchanged)
3. New content will benefit from URL field validation and guidance

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
