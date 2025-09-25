# Demolux Contentstack Setup Scripts

These scripts help you set up your Contentstack CMS with all the required content types and sample content for the Demolux ecommerce site.

## Prerequisites

1. **Contentstack Account**: You need a Contentstack account and a stack
2. **API Credentials**: You need both API Key and Management Token
3. **Node.js**: Version 18 or higher

## Environment Variables

Create a `.env` file in the `scripts/` directory (or set environment variables):

```bash
CONTENTSTACK_API_KEY=your_api_key_here
CONTENTSTACK_MANAGEMENT_TOKEN=your_management_token_here
CONTENTSTACK_ENVIRONMENT=development
CONTENTSTACK_REGION=US
```

### Getting Your Credentials

1. **API Key**: Found in your Stack Settings → Basic Settings
2. **Management Token**: Created in Stack Settings → Tokens → Management Tokens

## Usage

### Install Dependencies

```bash
cd scripts
npm install
```

### Option 1: Full Automatic Setup

```bash
npm run full-setup
```

This will:
1. Create all content types
2. Create all sample content
3. Publish the content

### Option 2: Step by Step

```bash
# Create content types only
npm run setup

# Create sample content only
npm run create-content
```

### Manual Execution

```bash
# Create content types
node contentstack-setup.js

# Create sample content
node create-sample-content.js
```

## What Gets Created

### Content Types

1. **Product** - For wearable tech and technofurniture items
   - Title, Description, Price, Category, Images, CTA
   - URL pattern: `/products/:title`

2. **Blog Post** - For articles and insights
   - Title, Content (Rich Text), Author, Publish Date, Tags
   - URL pattern: `/blog/:title`

3. **Navigation Menu** - For header/footer navigation
   - Menu items with labels, URLs, sort order
   - Support for different menu locations

4. **Site Settings** - Global site configuration
   - Site name, tagline, contact info, social links
   - Singleton content type

### Sample Content

- **4 Products**: 2 wearable tech, 2 technofurniture items
- **2 Blog Posts**: Technology insights and articles
- **2 Navigation Menus**: Header and footer navigation
- **1 Site Settings**: Global site configuration

## Content Type Schemas

All content types are defined in `contentstack-setup.js` with proper field types, validations, and URL patterns that match your Next.js routing structure.

## Troubleshooting

### Common Issues

1. **"Content type already exists"**
   - This is normal on subsequent runs
   - The script will skip existing content types

2. **"Entry already exists"**
   - Sample content uses unique titles
   - Delete existing entries or modify titles in the script

3. **Authentication errors**
   - Verify your API key and management token
   - Check that the management token has proper permissions

4. **Rate limiting**
   - The scripts include delays between API calls
   - If you hit rate limits, the scripts will fail gracefully

### Checking Your Setup

1. **Content Types**: Check Contentstack dashboard → Content Models
2. **Sample Content**: Check Contentstack dashboard → Entries
3. **Published Content**: Ensure entries are published to your environment

## Next Steps

After running the scripts:

1. **Add Product Images**: Upload images to your products in Contentstack
2. **Configure Your App**: Update `.env.local` in your Next.js app:
   ```bash
   CONTENTSTACK_API_KEY=your_api_key
   CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
   CONTENTSTACK_ENVIRONMENT=development
   CONTENTSTACK_REGION=US
   ```
3. **Test Integration**: Run `npm run dev` and verify content loads
4. **Customize Content**: Edit the sample content in Contentstack dashboard

## Script Details

### contentstack-setup.js
- Creates all content type schemas
- Validates API connection
- Handles existing content type scenarios
- Includes proper field types and validations

### create-sample-content.js  
- Creates sample entries for all content types
- Publishes entries to the specified environment
- Handles duplicate entry scenarios
- Includes realistic demo content

Both scripts include comprehensive error handling and provide clear feedback on the setup process.
