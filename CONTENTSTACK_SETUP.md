# Contentstack Setup Guide for Demolux

This guide will walk you through setting up Contentstack CMS for your Demolux ecommerce site using the [Contentstack Management API](https://www.contentstack.com/docs/developers/apis/content-management-api).

## 🚀 Quick Start

### Step 1: Get Your API Credentials

1. **Log into Contentstack** and select your stack
2. **Get API Key**: Go to Settings → Stack Settings → Basic Settings
3. **Create Management Token**: Go to Settings → Tokens → Management Tokens → Create Token
4. **Create Delivery Token**: Go to Settings → Tokens → Delivery Tokens → Create Token

### Step 2: Set Environment Variables

Create a `.env` file in the `scripts/` directory:

```bash
cd scripts
cp ../.env.example .env
```

Edit the `.env` file with your credentials:

```bash
CONTENTSTACK_API_KEY=blt1234567890abcdef
CONTENTSTACK_MANAGEMENT_TOKEN=cs1234567890abcdef
CONTENTSTACK_DELIVERY_TOKEN=blt1234567890abcdef
CONTENTSTACK_ENVIRONMENT=development
CONTENTSTACK_REGION=US
```

### Step 3: Run the Setup

```bash
# Install dependencies
cd scripts
npm install

# Test your connection first
npm run test

# Create everything automatically
npm run complete-setup
```

That's it! Your Contentstack is now configured with all content types and sample data.

## 🔧 Detailed Setup Process

### Manual Step-by-Step

If you prefer to run each step manually:

```bash
# 1. Test connection
npm run test

# 2. Create content types
npm run setup

# 3. Create sample content
npm run create-content
```

### What Gets Created

#### Content Types

1. **Product** (`product`)
   - Title, URL, Description, Featured Images, Price, Category, Call to Action
   - Used for both wearable tech and technofurniture
   - URL pattern: `/products/:title`

2. **Blog Post** (`blog_post`)
   - Title, URL, Content (Rich Text), Author, Publish Date, Tags, Featured Image
   - For articles and insights
   - URL pattern: `/blog/:title`

3. **Navigation Menu** (`navigation_menu`)
   - Menu Name, Location, Menu Items (with labels, URLs, sort order)
   - Supports header, footer, sidebar, mobile menus

4. **Site Settings** (`site_settings`)
   - Site Name, Tagline, Logo, Contact Info, Social Links
   - Singleton content type for global settings

#### Sample Content

- **4 Products**:
  - Quantum Smartwatch Pro ($2,499)
  - Neural Fitness Band Elite ($899)
  - Adaptive Smart Desk X1 ($3,999)
  - Holographic Display Chair ($7,499)

- **2 Blog Posts**:
  - "The Future of Wearable Technology: What to Expect in 2024"
  - "Sustainable Luxury: The Future of Technofurniture"

- **2 Navigation Menus**:
  - Main Navigation (Header)
  - Footer Navigation

- **1 Site Settings**:
  - Demolux branding and contact information

## 🔗 Integration with Next.js App

After running the setup scripts, configure your Next.js app:

### Update Environment Variables

Copy your Contentstack credentials to your main `.env.local` file:

```bash
# In the root directory (not scripts/)
cp .env.example .env.local
```

Edit `.env.local` with the same credentials:

```bash
CONTENTSTACK_API_KEY=blt1234567890abcdef
CONTENTSTACK_DELIVERY_TOKEN=blt1234567890abcdef
CONTENTSTACK_ENVIRONMENT=development
CONTENTSTACK_REGION=US
```

### Test the Integration

```bash
# Start your Next.js app
npm run dev
```

Visit `http://localhost:3000` - you should now see:
- ✅ Real product data from Contentstack
- ✅ Blog posts from Contentstack  
- ✅ Dynamic navigation from Contentstack
- ✅ Site settings from Contentstack

## 📸 Adding Product Images

The setup creates products without images. To add images:

1. **Go to Contentstack Dashboard** → Entries → Product
2. **Edit each product** and upload images to the "Featured Images" field
3. **Publish** the updated entries

Recommended image sizes:
- **Product Images**: 800x800px minimum, square ratio
- **Blog Featured Images**: 1200x675px (16:9 ratio)

## 🛠️ Troubleshooting

### Common Issues

**❌ "API Key not found"**
- Double-check your `CONTENTSTACK_API_KEY`
- Ensure you're using the correct stack

**❌ "Management token authentication failed"**
- Verify your `CONTENTSTACK_MANAGEMENT_TOKEN`
- Check token permissions include "Content Management"

**❌ "Content type already exists"**
- This is normal on subsequent runs
- The script will skip existing content types

**❌ "Entry already exists"**
- Delete existing sample entries in Contentstack dashboard
- Or modify titles in the script to avoid conflicts

### Testing Your Setup

Use the test script to verify everything is working:

```bash
cd scripts
npm run test
```

This will:
- ✅ Test Management API connection
- ✅ Test Delivery API connection  
- ✅ List available content types
- ✅ Show sample entry counts

### Regions and URLs

If you're using a different region:

| Region | CONTENTSTACK_REGION | Management API | Delivery API |
|--------|-------------------|----------------|--------------|
| US | `US` | api.contentstack.io | cdn.contentstack.io |
| EU | `EU` | eu-api.contentstack.io | eu-cdn.contentstack.io |
| Azure NA | `AZURE-NA` | azure-na-api.contentstack.io | azure-na-cdn.contentstack.io |
| Azure EU | `AZURE-EU` | azure-eu-api.contentstack.io | azure-eu-cdn.contentstack.io |

## 🎯 Next Steps

After successful setup:

1. **Customize Content**: Edit the sample content in Contentstack dashboard
2. **Add Images**: Upload product and blog images
3. **Configure Publishing**: Set up environments and workflows as needed
4. **Launch**: Deploy your Next.js app with live Contentstack integration

## 📚 Script Reference

### Available Scripts

```bash
npm run test           # Test Contentstack connection
npm run setup          # Create content types only
npm run create-content # Create sample content only  
npm run full-setup     # Create content types + sample content
npm run complete-setup # Test connection + full setup
```

### Script Files

- `contentstack-setup.js` - Creates content type schemas
- `create-sample-content.js` - Creates sample entries
- `test-connection.js` - Tests API connections
- `package.json` - Script definitions
- `README.md` - Detailed documentation

## 🔒 Security Notes

- **Never commit API tokens** to version control
- **Use environment-specific tokens** for development vs. production
- **Limit token permissions** to only what's needed
- **Rotate tokens regularly** for security

## 🆘 Support

If you encounter issues:

1. **Check the Contentstack documentation**: [Management API docs](https://www.contentstack.com/docs/developers/apis/content-management-api)
2. **Run the test script**: `npm run test`
3. **Verify your credentials** in the Contentstack dashboard
4. **Check the script logs** for specific error messages

The setup is designed to be robust and handle common scenarios like existing content types and duplicate entries gracefully.
