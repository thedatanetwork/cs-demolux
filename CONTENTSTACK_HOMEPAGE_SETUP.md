# Contentstack Home Page Content Type Setup

This guide will walk you through setting up a `home_page` content type in Contentstack to manage all the content on your homepage dynamically.

## Content Type: `home_page`

### Basic Information
- **Content Type ID**: `home_page`
- **Display Name**: Home Page
- **Description**: Manages all content displayed on the website homepage
- **Singleton**: Yes (only one entry allowed)

### Fields Configuration

#### 1. Title (Single Line Textbox)
- **Field UID**: `title`
- **Display Name**: Title
- **Help Text**: Internal title for identification
- **Required**: Yes

#### 2. Hero Section Fields

##### Hero Badge Text (Single Line Textbox)
- **Field UID**: `hero_badge_text`
- **Display Name**: Hero Badge Text
- **Help Text**: Small badge text displayed above the main headline
- **Required**: Yes

##### Hero Title (Single Line Textbox)
- **Field UID**: `hero_title`
- **Display Name**: Hero Title
- **Help Text**: Main headline text (e.g., "Where Innovation Meets Luxury")
- **Required**: Yes

##### Hero Subtitle (Single Line Textbox)
- **Field UID**: `hero_subtitle`
- **Display Name**: Hero Subtitle
- **Help Text**: First part of the headline (e.g., "Where Innovation")
- **Required**: Yes

##### Hero Description (Multi Line Textbox)
- **Field UID**: `hero_description`
- **Display Name**: Hero Description
- **Help Text**: Descriptive text below the headline
- **Required**: Yes

##### Hero Image (File)
- **Field UID**: `hero_image`
- **Display Name**: Hero Image
- **Help Text**: Main hero section image
- **Multiple**: No
- **Required**: No

##### Hero Primary CTA (Group)
- **Field UID**: `hero_primary_cta`
- **Display Name**: Hero Primary Call-to-Action
- **Fields**:
  - `text` (Single Line Textbox) - Button text
  - `url` (Single Line Textbox) - Button URL

##### Hero Secondary CTA (Group)
- **Field UID**: `hero_secondary_cta`
- **Display Name**: Hero Secondary Call-to-Action
- **Fields**:
  - `text` (Single Line Textbox) - Button text
  - `url` (Single Line Textbox) - Button URL

##### Hero Features (Multiple Value Group)
- **Field UID**: `hero_features`
- **Display Name**: Hero Features
- **Help Text**: Feature list displayed below hero content
- **Fields**:
  - `icon` (Single Line Textbox) - Icon name (Award, Zap, Star, Sparkles, Users, Globe)
  - `title` (Single Line Textbox) - Feature title
  - `description` (Single Line Textbox) - Feature description

#### 3. Featured Products Section Fields

##### Featured Section Title (Single Line Textbox)
- **Field UID**: `featured_section_title`
- **Display Name**: Featured Section Title
- **Required**: Yes

##### Featured Section Description (Multi Line Textbox)
- **Field UID**: `featured_section_description`
- **Display Name**: Featured Section Description
- **Required**: Yes

##### Featured Products Limit (Number)
- **Field UID**: `featured_products_limit`
- **Display Name**: Featured Products Limit
- **Help Text**: Number of featured products to display
- **Default Value**: 4

#### 4. Brand Values Section Fields

##### Values Section Title (Single Line Textbox)
- **Field UID**: `values_section_title`
- **Display Name**: Values Section Title
- **Required**: Yes

##### Values Section Description (Multi Line Textbox)
- **Field UID**: `values_section_description`
- **Display Name**: Values Section Description
- **Required**: Yes

##### Value Propositions (Multiple Value Group)
- **Field UID**: `value_propositions`
- **Display Name**: Value Propositions
- **Fields**:
  - `icon` (Single Line Textbox) - Icon name (Sparkles, Users, Globe)
  - `title` (Single Line Textbox) - Value title
  - `description` (Multi Line Textbox) - Value description

#### 5. Blog Section Fields

##### Blog Section Title (Single Line Textbox)
- **Field UID**: `blog_section_title`
- **Display Name**: Blog Section Title
- **Required**: Yes

##### Blog Section Description (Multi Line Textbox)
- **Field UID**: `blog_section_description`
- **Display Name**: Blog Section Description
- **Required**: Yes

##### Blog Posts Limit (Number)
- **Field UID**: `blog_posts_limit`
- **Display Name**: Blog Posts Limit
- **Help Text**: Number of blog posts to display
- **Default Value**: 3

##### Blog CTA Text (Single Line Textbox)
- **Field UID**: `blog_cta_text`
- **Display Name**: Blog CTA Text
- **Help Text**: Text for "View All Posts" button
- **Required**: Yes

#### 6. Final CTA Section Fields

##### Final CTA (Group)
- **Field UID**: `final_cta`
- **Display Name**: Final Call-to-Action Section
- **Fields**:
  - `title` (Single Line Textbox) - CTA section title
  - `description` (Multi Line Textbox) - CTA section description
  - `primary_button` (Group):
    - `text` (Single Line Textbox) - Primary button text
    - `url` (Single Line Textbox) - Primary button URL
  - `secondary_button` (Group):
    - `text` (Single Line Textbox) - Secondary button text
    - `url` (Single Line Textbox) - Secondary button URL
  - `background_color` (Single Line Textbox) - Background color ("dark" or "light")

#### 7. SEO Fields

##### Meta Title (Single Line Textbox)
- **Field UID**: `meta_title`
- **Display Name**: Meta Title
- **Help Text**: SEO title for the homepage

##### Meta Description (Multi Line Textbox)
- **Field UID**: `meta_description`
- **Display Name**: Meta Description
- **Help Text**: SEO description for the homepage

## Sample Content Entry

Once you've created the content type, create a single entry with the following sample content:

### Hero Section
- **Hero Badge Text**: "Premium Luxury Technology"
- **Hero Title**: "Where Innovation Meets Luxury"
- **Hero Subtitle**: "Where Innovation"
- **Hero Description**: "Discover the future with Demolux premium wearable technology and innovative technofurniture. Each piece is crafted where cutting-edge design meets exceptional performance."
- **Hero Image**: Upload a high-quality hero image (recommended: 2340x1560px)
- **Hero Primary CTA**:
  - Text: "Shop Wearable Tech"
  - URL: "/categories/wearable-tech"
- **Hero Secondary CTA**:
  - Text: "Explore Technofurniture"
  - URL: "/categories/technofurniture"

### Hero Features
1. **Feature 1**:
   - Icon: "Award"
   - Title: "Premium Quality"
   - Description: "Exceptional craftsmanship"

2. **Feature 2**:
   - Icon: "Zap"
   - Title: "Innovation"
   - Description: "Cutting-edge technology"

3. **Feature 3**:
   - Icon: "Star"
   - Title: "Luxury Design"
   - Description: "Sophisticated aesthetics"

### Featured Products Section
- **Title**: "Featured Products"
- **Description**: "Discover our latest innovations in wearable technology and technofurniture, each designed to elevate your lifestyle with premium functionality and style."
- **Limit**: 4

### Brand Values Section
- **Title**: "The Demolux Difference"
- **Description**: "We don't just create products—we craft experiences that seamlessly blend innovation, luxury, and functionality for the modern lifestyle."

### Value Propositions
1. **Innovation First**:
   - Icon: "Sparkles"
   - Title: "Innovation First"
   - Description: "We pioneer breakthrough technologies that redefine what's possible, from quantum processors to neural interfaces."

2. **Human-Centered Design**:
   - Icon: "Users"
   - Title: "Human-Centered Design"
   - Description: "Every product is designed with the user at the center, ensuring intuitive experiences that enhance daily life naturally."

3. **Sustainable Luxury**:
   - Icon: "Globe"
   - Title: "Sustainable Luxury"
   - Description: "Premium quality doesn't compromise our planet. We use sustainable materials and responsible manufacturing processes."

### Blog Section
- **Title**: "Latest Insights"
- **Description**: "Stay informed about the latest trends, innovations, and insights in technology and design."
- **Limit**: 3
- **CTA Text**: "View All Posts"

### Final CTA
- **Title**: "Ready to Experience the Future?"
- **Description**: "Join thousands of innovators who have already transformed their lives with Demolux premium technology."
- **Primary Button**:
  - Text: "Shop Wearable Tech"
  - URL: "/categories/wearable-tech"
- **Secondary Button**:
  - Text: "Explore Technofurniture"
  - URL: "/categories/technofurniture"
- **Background Color**: "dark"

### SEO
- **Meta Title**: "Demolux - Where Innovation Meets Luxury"
- **Meta Description**: "Discover the future with Demolux premium wearable technology and innovative technofurniture. Each piece is crafted where cutting-edge design meets exceptional performance."

## Implementation Notes

1. **Icon Names**: Use exact icon names as specified in the Lucide React library: Award, Zap, Star, Sparkles, Users, Globe
2. **Background Color**: Use "dark" for dark background or "light" for light background in the final CTA section
3. **URLs**: Use relative URLs starting with "/" for internal links
4. **Images**: All images should be optimized for web and uploaded to Contentstack's media library
5. **Publishing**: Make sure to publish the entry after creating/editing it

## Fallback Behavior

The application is designed with robust fallback behavior. If Contentstack is unavailable or the home page entry doesn't exist, the application will use mock data defined in `src/data/mock-data.ts`. This ensures the site remains functional even during content management system outages.
