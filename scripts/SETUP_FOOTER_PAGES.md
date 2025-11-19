# Setup Footer Pages in Contentstack

This guide covers the creation of all footer pages for the DemoLux website.

## Pages Created

The following pages have been created and published to Contentstack:

1. **Privacy Policy** (`/privacy`)
2. **Terms of Service** (`/terms`)
3. **Shipping & Returns** (`/shipping`)
4. **Support** (`/support`)

All pages follow the DemoLux brand voice: sophisticated, luxury-focused, European refinement with emphasis on innovation and design.

## Prerequisites

- Node.js 16+ installed
- Access to your Contentstack account
- Management token configured in `scripts/.env`
- DemoLux stack already configured

## Running the Scripts

### Create Individual Pages

```bash
cd scripts

# Create Privacy Policy page
npm run create-privacy-page

# Create Terms of Service page
npm run create-terms-page

# Create Shipping & Returns page
npm run create-shipping-page

# Create Support page
npm run create-support-page
```

### Create All Pages at Once

```bash
cd scripts
npm run create-all-pages
```

This command will create all footer pages in sequence.

## Page Details

### Privacy Policy (`/privacy`)

**Sections:**
- Our Commitment to Your Privacy
- Information We Collect
- How We Use Your Information
- Cookies and Tracking Technologies
- Data Security and Retention
- Your Rights and Choices
- International Data Transfers
- Third-Party Links and Services
- Children's Privacy
- Changes to This Policy
- Contact Us

**Brand Alignment:** Emphasizes transparent handling of personal information with the same precision and care as Demolux products.

### Terms of Service (`/terms`)

**Sections:**
- Welcome to Demolux
- Eligibility
- Account Responsibilities
- Product Purchases and Pricing
- Shipping, Delivery, and Risk of Loss
- Returns and Refunds
- Product Warranties and Disclaimers
- Limitation of Liability
- Intellectual Property Rights
- User Conduct and Prohibited Activities
- Privacy and Data Protection
- Modifications to Terms
- Termination
- Governing Law and Dispute Resolution
- Miscellaneous
- Contact Information

**Brand Alignment:** Professional legal language maintaining Demolux's sophisticated tone, governing law in Denmark (Copenhagen headquarters).

### Shipping & Returns (`/shipping`)

**Sections:**
- Shipping Information
- Delivery Regions (EU, UK, North America, Asia-Pacific, Middle East)
- Shipping Methods and Timeframes
  - Standard Shipping
  - Express Shipping
  - White-Glove Delivery (for technofurniture)
- Order Processing
- Customs, Duties, and Taxes
- Returns Policy (30-day return window)
- How to Initiate a Return
- Exchanges
- Damaged or Defective Products
- Lost or Stolen Packages
- Questions?

**Brand Alignment:** Premium service emphasis with white-glove delivery for furniture, global reach reflecting luxury positioning.

### Support (`/support`)

**Sections:**
- How Can We Help You?
- Frequently Asked Questions
  - Product Setup & Use
  - Connectivity & Software
  - Battery & Charging
  - Care & Maintenance
- Product Manuals & Guides
- Warranty Information (1-year limited warranty)
- Technical Support
- Repair & Service
- Software & App Support (Demolux Connect app)
- Community & Resources
- Contact Information

**Brand Alignment:** Comprehensive support reflecting premium customer experience, technical details for all fictional products.

## Viewing the Pages

Once the dev server is running:

```bash
# From root directory
npm run dev
```

Visit the following URLs:
- http://localhost:3000/privacy
- http://localhost:3000/terms
- http://localhost:3000/shipping
- http://localhost:3000/support

## Page Routes

All pages use the existing `/app/[...slug]/page.tsx` dynamic route that fetches page content from Contentstack based on the slug.

No additional routing configuration is needed - the pages are automatically available once published to Contentstack.

## Updating Page Content

You can update page content in two ways:

### 1. Via Contentstack Dashboard

1. Log into https://app.contentstack.com
2. Navigate to **Entries** → **Page**
3. Find the page you want to edit (Privacy Policy, Terms, etc.)
4. Edit the content sections
5. Click **Save & Publish**

### 2. Via Scripts

Re-run any script to update its content:

```bash
npm run create-privacy-page
```

The script will detect the existing entry and update it.

## Content Structure

Each page follows the same structure:

```javascript
{
  title: 'Page Title',
  slug: 'url-slug',
  meta_description: 'SEO description',
  hero_section: {
    title: 'Hero Title',
    subtitle: 'Hero subtitle'
  },
  content_sections: [
    {
      section_title: 'Section Heading',
      layout: 'centered',
      content: '<p>HTML content...</p>'
    }
  ]
}
```

## Brand Voice Guidelines

All content follows these DemoLux brand principles:

- **Sophisticated Language:** "Pinnacle," "curated," "gallery-worthy"
- **European Refinement:** Copenhagen-based, Danish regulations
- **Innovation + Design:** Emphasizes both technology and aesthetics
- **Sustainability Conscious:** Responsible manufacturing, eco-friendly
- **Premium Positioning:** Luxury materials, high-end service
- **Customer-Centric:** White-glove service, comprehensive support

## Contact Page

The Contact page (`/contact`) already exists with:
- Static page data (not in Contentstack)
- Contact form
- Contact information cards (Email, Phone, Location, Hours)
- Copenhagen, Denmark location

No changes needed to the Contact page as it serves as a functional contact point.

## Troubleshooting

### Script fails with "Invalid token"
- Verify `CONTENTSTACK_MANAGEMENT_TOKEN` in `scripts/.env`
- Ensure token has write permissions
- Check token hasn't been revoked

### Page shows 404
- Ensure script completed successfully
- Check entry was published (scripts auto-publish)
- Restart dev server: `npm run dev`
- Clear browser cache

### Changes not appearing
- Script publishes to `dev` environment by default
- Check `.env.local` has `CONTENTSTACK_ENVIRONMENT=dev`
- Restart Next.js dev server

## Next Steps

With all footer pages created, you can now:

1. **Customize Content:** Edit pages in Contentstack dashboard
2. **Add Images:** Upload and add images to hero sections
3. **Localization:** Add translations for international markets
4. **SEO Optimization:** Refine meta descriptions and titles
5. **Legal Review:** Have actual legal team review Terms and Privacy Policy before production

## Security Notes

⚠️ **IMPORTANT:**
- Management tokens have full write access
- Never commit `.env` file to git (already in .gitignore)
- Never share management tokens publicly
- These are demonstration pages with fictional content
- Actual production sites should have legal review of Terms, Privacy, etc.

## Summary

All footer pages are now live in Contentstack, maintaining the DemoLux luxury brand voice throughout. The website demonstrates:

- **Contentstack CMS Integration:** All pages managed via headless CMS
- **Brand Consistency:** Sophisticated tone across all content
- **Premium Experience:** White-glove service, comprehensive support
- **Legal Compliance:** Professional Terms and Privacy Policy
- **Global Reach:** International shipping, multiple regions
- **Customer Support:** FAQs, warranties, technical support

The Demolux demonstration site now has complete footer navigation with all supporting pages!
