/**
 * Contentstack Schema Definitions for New Modular Block Types
 *
 * This script outputs the JSON schemas needed to create these content types in Contentstack.
 * You can use these to manually create the content types or adapt for the Management API.
 *
 * New Block Types:
 * 1. process_steps_block - "How It Works" style numbered steps
 * 2. statistics_block - Key stats/metrics display
 * 3. testimonials_block - Customer testimonials
 * 4. faq_block - Frequently asked questions
 */

const processStepsBlockSchema = {
  title: "Process Steps Block",
  uid: "process_steps_block",
  description: "Display a step-by-step process (e.g., 'How It Works')",
  schema: [
    {
      display_name: "Section Title",
      uid: "section_title",
      data_type: "text",
      mandatory: true,
      field_metadata: { instruction: "Main heading for the section" }
    },
    {
      display_name: "Section Description",
      uid: "section_description",
      data_type: "text",
      mandatory: false,
      field_metadata: { instruction: "Optional subheading/description" }
    },
    {
      display_name: "Badge Text",
      uid: "badge_text",
      data_type: "text",
      mandatory: false,
      field_metadata: { instruction: "Small label above the title (e.g., 'HOW IT WORKS')" }
    },
    {
      display_name: "Steps",
      uid: "steps",
      data_type: "group",
      mandatory: true,
      multiple: true,
      field_metadata: { instruction: "Add 3-5 steps" },
      schema: [
        {
          display_name: "Step Number",
          uid: "step_number",
          data_type: "number",
          mandatory: false,
          field_metadata: { instruction: "Optional custom step number" }
        },
        {
          display_name: "Title",
          uid: "title",
          data_type: "text",
          mandatory: true
        },
        {
          display_name: "Description",
          uid: "description",
          data_type: "text",
          mandatory: true,
          field_metadata: { multiline: true }
        },
        {
          display_name: "Icon",
          uid: "icon",
          data_type: "text",
          mandatory: false,
          field_metadata: {
            instruction: "Icon name: CheckCircle, Sparkles, Users, Gift, Truck, Star, Zap, Heart, ShoppingBag, Palette, Target"
          }
        },
        {
          display_name: "Image",
          uid: "image",
          data_type: "file",
          mandatory: false,
          field_metadata: { instruction: "Optional image for the step" }
        },
        {
          display_name: "CTA Button",
          uid: "cta",
          data_type: "group",
          mandatory: false,
          schema: [
            { display_name: "Text", uid: "text", data_type: "text", mandatory: true },
            { display_name: "URL", uid: "url", data_type: "text", mandatory: true }
          ]
        }
      ]
    },
    {
      display_name: "Layout Style",
      uid: "layout_style",
      data_type: "text",
      mandatory: true,
      enum: {
        advanced: false,
        choices: [
          { value: "horizontal", label: "Horizontal (side by side)" },
          { value: "vertical", label: "Vertical (stacked)" },
          { value: "alternating", label: "Alternating (zigzag)" }
        ]
      },
      field_metadata: { default_value: "horizontal" }
    },
    {
      display_name: "Show Step Numbers",
      uid: "show_step_numbers",
      data_type: "boolean",
      mandatory: false,
      field_metadata: { default_value: true }
    },
    {
      display_name: "Show Connector Lines",
      uid: "show_connector_lines",
      data_type: "boolean",
      mandatory: false,
      field_metadata: { default_value: true }
    },
    {
      display_name: "Background Style",
      uid: "background_style",
      data_type: "text",
      mandatory: true,
      enum: {
        advanced: false,
        choices: [
          { value: "white", label: "White" },
          { value: "gray", label: "Light Gray" },
          { value: "gradient", label: "Gradient" }
        ]
      },
      field_metadata: { default_value: "white" }
    }
  ]
};

const statisticsBlockSchema = {
  title: "Statistics Block",
  uid: "statistics_block",
  description: "Display key metrics and statistics (e.g., '2000+ brands', '40+ hours saved')",
  schema: [
    {
      display_name: "Section Title",
      uid: "section_title",
      data_type: "text",
      mandatory: false,
      field_metadata: { instruction: "Optional heading above the stats" }
    },
    {
      display_name: "Section Description",
      uid: "section_description",
      data_type: "text",
      mandatory: false
    },
    {
      display_name: "Badge Text",
      uid: "badge_text",
      data_type: "text",
      mandatory: false
    },
    {
      display_name: "Metrics",
      uid: "metrics",
      data_type: "group",
      mandatory: true,
      multiple: true,
      field_metadata: { instruction: "Add 3-4 key statistics" },
      schema: [
        {
          display_name: "Value",
          uid: "value",
          data_type: "text",
          mandatory: true,
          field_metadata: { instruction: "The stat value (e.g., '2,000+', '40+', '$29')" }
        },
        {
          display_name: "Label",
          uid: "label",
          data_type: "text",
          mandatory: true,
          field_metadata: { instruction: "Short label (e.g., 'Brands', 'Hours Saved')" }
        },
        {
          display_name: "Description",
          uid: "description",
          data_type: "text",
          mandatory: false,
          field_metadata: { instruction: "Optional longer description" }
        },
        {
          display_name: "Icon",
          uid: "icon",
          data_type: "text",
          mandatory: false,
          field_metadata: {
            instruction: "Icon name: TrendingUp, Users, Award, Clock, Star, ShoppingBag, Heart, Zap, Globe, CheckCircle"
          }
        }
      ]
    },
    {
      display_name: "Layout Style",
      uid: "layout_style",
      data_type: "text",
      mandatory: true,
      enum: {
        advanced: false,
        choices: [
          { value: "horizontal", label: "Horizontal Row" },
          { value: "grid-3", label: "3 Column Grid" },
          { value: "grid-4", label: "4 Column Grid" }
        ]
      },
      field_metadata: { default_value: "horizontal" }
    },
    {
      display_name: "Background Style",
      uid: "background_style",
      data_type: "text",
      mandatory: true,
      enum: {
        advanced: false,
        choices: [
          { value: "white", label: "White" },
          { value: "dark", label: "Dark" },
          { value: "gradient", label: "Dark Gradient" },
          { value: "gradient-gold", label: "Gold Gradient" }
        ]
      },
      field_metadata: { default_value: "dark" }
    },
    {
      display_name: "Animated Numbers",
      uid: "animated",
      data_type: "boolean",
      mandatory: false,
      field_metadata: {
        default_value: true,
        instruction: "Animate numbers counting up when scrolled into view"
      }
    }
  ]
};

const testimonialsBlockSchema = {
  title: "Testimonials Block",
  uid: "testimonials_block",
  description: "Display customer testimonials and reviews",
  schema: [
    {
      display_name: "Section Title",
      uid: "section_title",
      data_type: "text",
      mandatory: false
    },
    {
      display_name: "Section Description",
      uid: "section_description",
      data_type: "text",
      mandatory: false
    },
    {
      display_name: "Badge Text",
      uid: "badge_text",
      data_type: "text",
      mandatory: false
    },
    {
      display_name: "Testimonials",
      uid: "testimonials",
      data_type: "reference",
      mandatory: true,
      multiple: true,
      reference_to: ["testimonial"],
      field_metadata: { instruction: "Select testimonials to display" }
    },
    {
      display_name: "Layout Style",
      uid: "layout_style",
      data_type: "text",
      mandatory: true,
      enum: {
        advanced: false,
        choices: [
          { value: "carousel", label: "Carousel (one at a time)" },
          { value: "grid", label: "Grid (all visible)" },
          { value: "single-featured", label: "Single Featured (large)" }
        ]
      },
      field_metadata: { default_value: "carousel" }
    },
    {
      display_name: "Show Ratings",
      uid: "show_ratings",
      data_type: "boolean",
      mandatory: false,
      field_metadata: { default_value: true }
    },
    {
      display_name: "Show Customer Images",
      uid: "show_images",
      data_type: "boolean",
      mandatory: false,
      field_metadata: { default_value: true }
    },
    {
      display_name: "Background Style",
      uid: "background_style",
      data_type: "text",
      mandatory: true,
      enum: {
        advanced: false,
        choices: [
          { value: "white", label: "White" },
          { value: "gray", label: "Light Gray" },
          { value: "gradient", label: "Gradient" }
        ]
      },
      field_metadata: { default_value: "gray" }
    }
  ]
};

const faqBlockSchema = {
  title: "FAQ Block",
  uid: "faq_block",
  description: "Display frequently asked questions with expandable answers",
  schema: [
    {
      display_name: "Section Title",
      uid: "section_title",
      data_type: "text",
      mandatory: true,
      field_metadata: { default_value: "Frequently Asked Questions" }
    },
    {
      display_name: "Section Description",
      uid: "section_description",
      data_type: "text",
      mandatory: false
    },
    {
      display_name: "Badge Text",
      uid: "badge_text",
      data_type: "text",
      mandatory: false,
      field_metadata: { instruction: "e.g., 'GOT QUESTIONS?'" }
    },
    {
      display_name: "FAQs",
      uid: "faqs",
      data_type: "group",
      mandatory: true,
      multiple: true,
      field_metadata: { instruction: "Add frequently asked questions" },
      schema: [
        {
          display_name: "Question",
          uid: "question",
          data_type: "text",
          mandatory: true
        },
        {
          display_name: "Answer",
          uid: "answer",
          data_type: "text",
          mandatory: true,
          field_metadata: { multiline: true }
        },
        {
          display_name: "Category",
          uid: "category",
          data_type: "text",
          mandatory: false,
          field_metadata: { instruction: "Optional category for grouping (e.g., 'Shipping', 'Returns')" }
        }
      ]
    },
    {
      display_name: "Layout Style",
      uid: "layout_style",
      data_type: "text",
      mandatory: true,
      enum: {
        advanced: false,
        choices: [
          { value: "accordion", label: "Accordion (expandable)" },
          { value: "two-column", label: "Two Column Accordion" },
          { value: "cards", label: "Cards (all visible)" }
        ]
      },
      field_metadata: { default_value: "accordion" }
    },
    {
      display_name: "Show Categories",
      uid: "show_categories",
      data_type: "boolean",
      mandatory: false,
      field_metadata: {
        default_value: false,
        instruction: "Group FAQs by category"
      }
    },
    {
      display_name: "Expand First FAQ",
      uid: "expand_first",
      data_type: "boolean",
      mandatory: false,
      field_metadata: {
        default_value: true,
        instruction: "Auto-expand the first FAQ on load"
      }
    },
    {
      display_name: "Background Style",
      uid: "background_style",
      data_type: "text",
      mandatory: true,
      enum: {
        advanced: false,
        choices: [
          { value: "white", label: "White" },
          { value: "gray", label: "Light Gray" },
          { value: "gradient", label: "Gradient" }
        ]
      },
      field_metadata: { default_value: "white" }
    }
  ]
};

// Also need to add testimonial content type if it doesn't exist
const testimonialContentTypeSchema = {
  title: "Testimonial",
  uid: "testimonial",
  description: "Customer testimonial/review",
  schema: [
    {
      display_name: "Customer Name",
      uid: "customer_name",
      data_type: "text",
      mandatory: true
    },
    {
      display_name: "Customer Title",
      uid: "customer_title",
      data_type: "text",
      mandatory: false,
      field_metadata: { instruction: "Job title or location (e.g., 'Marketing Manager' or 'San Francisco, CA')" }
    },
    {
      display_name: "Customer Image",
      uid: "customer_image",
      data_type: "file",
      mandatory: false,
      field_metadata: { instruction: "Profile photo" }
    },
    {
      display_name: "Testimonial Text",
      uid: "testimonial_text",
      data_type: "text",
      mandatory: true,
      field_metadata: { multiline: true }
    },
    {
      display_name: "Rating",
      uid: "rating",
      data_type: "number",
      mandatory: false,
      field_metadata: {
        instruction: "Rating out of 5",
        min: 1,
        max: 5
      }
    },
    {
      display_name: "Related Product",
      uid: "product",
      data_type: "reference",
      mandatory: false,
      reference_to: ["product"]
    },
    {
      display_name: "Date",
      uid: "date",
      data_type: "isodate",
      mandatory: false
    },
    {
      display_name: "Featured",
      uid: "is_featured",
      data_type: "boolean",
      mandatory: false,
      field_metadata: { default_value: false }
    }
  ]
};

// Output all schemas
console.log('\n========================================');
console.log('CONTENTSTACK CONTENT TYPE SCHEMAS');
console.log('========================================\n');

console.log('1. PROCESS STEPS BLOCK');
console.log('------------------------');
console.log(JSON.stringify(processStepsBlockSchema, null, 2));

console.log('\n\n2. STATISTICS BLOCK');
console.log('--------------------');
console.log(JSON.stringify(statisticsBlockSchema, null, 2));

console.log('\n\n3. TESTIMONIALS BLOCK');
console.log('----------------------');
console.log(JSON.stringify(testimonialsBlockSchema, null, 2));

console.log('\n\n4. FAQ BLOCK');
console.log('-------------');
console.log(JSON.stringify(faqBlockSchema, null, 2));

console.log('\n\n5. TESTIMONIAL CONTENT TYPE (if not exists)');
console.log('--------------------------------------------');
console.log(JSON.stringify(testimonialContentTypeSchema, null, 2));

console.log('\n\n========================================');
console.log('QUICK START - SAMPLE CONTENT');
console.log('========================================\n');

const sampleProcessSteps = {
  section_title: "How Demolux Works",
  section_description: "Get personalized luxury tech recommendations in three simple steps",
  badge_text: "HOW IT WORKS",
  steps: [
    {
      step_number: 1,
      title: "Take the Style Quiz",
      description: "Tell us about your lifestyle, preferences, and tech needs. Our AI learns what makes you unique.",
      icon: "Sparkles"
    },
    {
      step_number: 2,
      title: "Get Curated Picks",
      description: "Our experts select premium wearables and technofurniture tailored to your taste and budget.",
      icon: "Target"
    },
    {
      step_number: 3,
      title: "Experience Luxury",
      description: "Receive your personalized collection with free shipping. Love it or return it hassle-free.",
      icon: "Gift"
    }
  ],
  layout_style: "horizontal",
  show_step_numbers: true,
  show_connector_lines: true,
  background_style: "white"
};

const sampleStatistics = {
  section_title: "Trusted by Tech Enthusiasts",
  badge_text: "BY THE NUMBERS",
  metrics: [
    { value: "50+", label: "Premium Brands", icon: "Award" },
    { value: "10,000+", label: "Happy Customers", icon: "Users" },
    { value: "98%", label: "Satisfaction Rate", icon: "Star" },
    { value: "$299", label: "Average Savings", icon: "TrendingUp" }
  ],
  layout_style: "horizontal",
  background_style: "dark",
  animated: true
};

const sampleFAQs = {
  section_title: "Frequently Asked Questions",
  badge_text: "GOT QUESTIONS?",
  faqs: [
    {
      question: "How does the personalization work?",
      answer: "Our AI analyzes your style preferences, lifestyle, and tech needs to curate products specifically for you. The more you interact, the smarter our recommendations become."
    },
    {
      question: "What is your return policy?",
      answer: "We offer hassle-free returns within 30 days of delivery. Simply initiate a return in your account, and we'll send you a prepaid shipping label."
    },
    {
      question: "Do you offer financing options?",
      answer: "Yes! We partner with Affirm to offer flexible payment plans. Split your purchase into 3, 6, or 12 monthly payments with rates as low as 0% APR."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping is 5-7 business days and free on orders over $100. Express shipping (2-3 days) is available for $15."
    }
  ],
  layout_style: "accordion",
  show_categories: false,
  expand_first: true,
  background_style: "gray"
};

console.log('SAMPLE PROCESS STEPS DATA:');
console.log(JSON.stringify(sampleProcessSteps, null, 2));

console.log('\n\nSAMPLE STATISTICS DATA:');
console.log(JSON.stringify(sampleStatistics, null, 2));

console.log('\n\nSAMPLE FAQ DATA:');
console.log(JSON.stringify(sampleFAQs, null, 2));

console.log('\n\n========================================');
console.log('PERSONALIZATION IDEAS');
console.log('========================================\n');

console.log(`
These new blocks are perfect for Contentstack Personalize targeting:

1. PROCESS STEPS BLOCK
   - Show different "How It Works" journeys based on CDP segment
   - Fitness enthusiasts: emphasize health tracking features
   - Home decor lovers: focus on smart home integration
   - Tech enthusiasts: highlight cutting-edge specs

2. STATISTICS BLOCK
   - Vary stats based on visitor interests
   - Show "40+ fitness brands" to health-conscious visitors
   - Show "Smart home compatibility" stats to home decor segment
   - Use different social proof numbers per audience

3. TESTIMONIALS BLOCK
   - Match customer testimonials to visitor demographics
   - Show young professional testimonials to that segment
   - Display family testimonials to family account holders
   - Feature power user reviews for tech enthusiasts

4. FAQ BLOCK
   - Surface relevant FAQs per segment
   - First-time visitors: focus on "How it works" FAQs
   - Returning visitors: show advanced feature FAQs
   - Cart abandoners: highlight return policy and shipping FAQs
`);
