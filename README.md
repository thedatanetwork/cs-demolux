# Demolux - Premium Wearable Tech & Technofurniture

Demolux is a sophisticated ecommerce website built with Next.js for a high-end accessories brand specializing in wearable technology and technofurniture. The site features seamless Contentstack CMS integration with JSON fallbacks for development.

## Features

- **🏪 Full Ecommerce Experience**: Product catalogs, categories, detailed product pages
- **📝 Dynamic Content Management**: Contentstack CMS integration with fallback mock data
- **📱 Responsive Design**: Mobile-first, luxury-focused UI/UX
- **⚡ Modern Stack**: Next.js 14, TypeScript, Tailwind CSS
- **🎨 Luxury Branding**: Premium design with gold accents and sophisticated typography
- **📊 Category Management**: Wearable Tech and Technofurniture product categories
- **📝 Blog System**: Content marketing with blog posts and insights
- **🔍 SEO Optimized**: Built-in metadata and structured data

## Product Categories

### Wearable Tech
- Quantum Smartwatch Pro - $2,499
- Neural Fitness Band Elite - $899

### Technofurniture
- Adaptive Smart Desk X1 - $3,999
- Holographic Display Chair - $7,499

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom luxury theme
- **CMS**: Contentstack (with JSON mock fallbacks)
- **Icons**: Lucide React
- **Fonts**: Inter, Playfair Display
- **Deployment**: Optimized for modern hosting platforms

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Contentstack account (optional - app works with mock data)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd demolux
   npm install
   ```

2. **Option A: Quick Start (Mock Data)**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the site with sample data.

3. **Option B: Full Contentstack Integration**
   
   **Set up Contentstack CMS**:
   ```bash
   # Set up content types and sample content in Contentstack
   cd scripts
   npm install
   
   # Add your API credentials to scripts/.env
   cp ../.env.example .env
   # Edit .env with your Contentstack credentials
   
   # Run complete setup
   npm run complete-setup
   ```
   
   **Configure your app**:
   ```bash
   # Back to root directory
   cd ..
   
   # Copy environment file
   cp .env.example .env.local
   # Edit .env.local with your Contentstack credentials
   ```
   
   **Start development server**:
   ```bash
   npm run dev
   ```

   See [CONTENTSTACK_SETUP.md](./CONTENTSTACK_SETUP.md) for detailed setup instructions.

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Homepage
│   ├── categories/        # Category pages
│   ├── products/          # Product detail pages
│   ├── blog/             # Blog pages
│   └── layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── product/          # Product-specific components
│   ├── blog/             # Blog components
│   └── home/             # Homepage components
├── lib/                  # Core utilities
│   ├── contentstack.ts   # Contentstack SDK setup
│   ├── data-service.ts   # Data abstraction layer
│   └── utils.ts          # Helper functions
└── data/                 # Mock data
    └── mock-data.ts      # JSON fallback data
```

## Contentstack Integration

The app is designed to work seamlessly with Contentstack CMS:

### Content Types Required

1. **Product**: Product catalog items
2. **Blog Post**: Blog content and insights  
3. **Navigation Menu**: Dynamic navigation
4. **Site Settings**: Global site configuration

### Development Without Contentstack

The app includes comprehensive mock data, so you can develop and demo the full experience without configuring Contentstack. The data layer automatically falls back to JSON when CMS credentials aren't provided.

## Key Features Implemented

### ✅ Homepage
- Hero section with brand messaging
- Featured products showcase
- Brand values section
- Recent blog posts
- Call-to-action sections

### ✅ Product Catalog
- Category pages (Wearable Tech, Technofurniture)
- Product detail pages with image galleries
- Pricing and product information
- Add to cart functionality (UI ready)

### ✅ Blog System
- Blog listing page
- Individual blog post pages
- Author and publish date metadata
- Tag system

### ✅ Navigation & Layout
- Responsive header with mobile menu
- Dynamic navigation from CMS
- Comprehensive footer
- Breadcrumb navigation

### ✅ Design System
- Luxury-focused color palette
- Custom typography (Inter + Playfair Display)
- Consistent component library
- Mobile-first responsive design

## Deployment

The app is optimized for deployment on:
- Vercel (recommended for Next.js)
- Netlify
- Any modern hosting platform supporting Node.js

### Build Commands

```bash
npm run build    # Production build
npm run start    # Production server
```

## Customization

### Branding
- Colors: Edit `tailwind.config.js` for brand colors
- Typography: Modify font imports in `layout.tsx`
- Logo: Replace logo references in components

### Content
- Mock Data: Edit `src/data/mock-data.ts`
- Site Settings: Configure in Contentstack or mock data
- Navigation: Managed through CMS or mock data

## Future Enhancements

- **🛒 Shopping Cart**: Complete ecommerce functionality
- **💳 Payments**: Stripe/PayPal integration
- **👤 User Accounts**: Authentication and profiles
- **🔍 Search**: Product and content search
- **📧 Newsletter**: Email capture and marketing
- **📊 Analytics**: Conversion tracking
- **🎨 Product Customization**: Color/size variants
- **📱 PWA Features**: Offline support

## Contributing

This is a client project. For feature requests or issues, please contact the development team.

## License

Proprietary - © 2024 Demolux. All rights reserved.
