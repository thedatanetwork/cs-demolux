require('dotenv').config();
const contentstack = require('@contentstack/management');

const client = contentstack.client();

async function createShippingPage() {
  try {
    const stack = client.stack({
      api_key: process.env.CONTENTSTACK_API_KEY,
      management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN
    });

    console.log('🔍 Checking for existing Shipping & Returns page...');

    // Shipping & Returns page content
    const shippingPageContent = {
      title: 'Shipping & Returns',
      slug: 'shipping',
      meta_description: 'Demolux Shipping & Returns - Learn about our white-glove delivery service and hassle-free returns policy.',
      hero_section: {
        title: 'Shipping & Returns',
        subtitle: 'Experience luxury from purchase to delivery. We ensure your Demolux products arrive with the same care and precision that went into crafting them.'
      },
      content_sections: [
        {
          section_title: 'Shipping Information',
          layout: 'centered',
          content: `<p>At Demolux, every detail matters—including how your products reach you. We partner with premium carriers and use custom packaging to ensure your order arrives in perfect condition.</p>`
        },
        {
          section_title: 'Delivery Regions',
          layout: 'centered',
          content: `<p>We currently ship to the following regions:</p>

<ul>
<li><strong>European Union:</strong> All EU member states</li>
<li><strong>United Kingdom:</strong> England, Scotland, Wales, Northern Ireland</li>
<li><strong>North America:</strong> United States, Canada</li>
<li><strong>Asia-Pacific:</strong> Japan, South Korea, Singapore, Australia, New Zealand</li>
<li><strong>Middle East:</strong> United Arab Emirates, Qatar, Saudi Arabia</li>
</ul>

<p>Don't see your region? Contact us at <strong>hello@demolux.com</strong> to inquire about international shipping options. We're continuously expanding our global reach.</p>`
        },
        {
          section_title: 'Shipping Methods and Timeframes',
          layout: 'centered',
          content: `<p><strong>Standard Shipping</strong></p>

<ul>
<li><strong>EU & UK:</strong> 3-5 business days</li>
<li><strong>North America:</strong> 5-7 business days</li>
<li><strong>Asia-Pacific & Middle East:</strong> 7-10 business days</li>
<li><strong>Cost:</strong> Calculated at checkout based on destination and order weight</li>
</ul>

<p><strong>Express Shipping</strong></p>

<ul>
<li><strong>EU & UK:</strong> 1-2 business days</li>
<li><strong>North America:</strong> 2-3 business days</li>
<li><strong>Asia-Pacific & Middle East:</strong> 3-5 business days</li>
<li><strong>Cost:</strong> Premium rates apply; calculated at checkout</li>
</ul>

<p><strong>White-Glove Delivery</strong></p>

<p>For select technofurniture pieces (such as the Holographic Display Chair and Minimalist Smart Side Table), we offer white-glove delivery service:</p>

<ul>
<li>Scheduled delivery appointment at your convenience</li>
<li>Professional setup and installation</li>
<li>Product demonstration and orientation</li>
<li>Removal of all packaging materials</li>
<li>Available in major metropolitan areas; contact us for eligibility</li>
</ul>`
        },
        {
          section_title: 'Order Processing',
          layout: 'centered',
          content: `<p>Orders are typically processed within 1-2 business days. Custom or personalized products may require additional production time (2-4 weeks). You will receive an email confirmation when your order ships, along with tracking information.</p>

<p><strong>Order Tracking:</strong> Track your shipment anytime through the link provided in your shipping confirmation email or by logging into your Demolux account.</p>`
        },
        {
          section_title: 'Customs, Duties, and Taxes',
          layout: 'centered',
          content: `<p>International orders may be subject to import duties, customs fees, and local taxes based on your country's regulations. These charges are the responsibility of the recipient and are not included in your Demolux order total.</p>

<p>We recommend checking with your local customs office to estimate potential fees before placing an order.</p>`
        },
        {
          section_title: 'Returns Policy',
          layout: 'centered',
          content: `<p>Your satisfaction is our priority. If you're not completely delighted with your Demolux purchase, we offer a <strong>30-day return policy</strong> from the date of delivery.</p>

<p><strong>Eligible Returns:</strong></p>

<ul>
<li>Products must be unused, undamaged, and in original condition</li>
<li>All original packaging, accessories, and documentation must be included</li>
<li>Proof of purchase (order confirmation or receipt) is required</li>
</ul>

<p><strong>Non-Returnable Items:</strong></p>

<ul>
<li>Custom or personalized products</li>
<li>Products showing signs of use, wear, or damage</li>
<li>Items purchased during final sale or clearance events (unless defective)</li>
</ul>`
        },
        {
          section_title: 'How to Initiate a Return',
          layout: 'centered',
          content: `<p><strong>Step 1: Contact Us</strong></p>

<p>Email <strong>returns@demolux.com</strong> with your order number, reason for return, and photos of the product (if applicable). Our team will respond within 24 hours with return instructions and a return authorization number.</p>

<p><strong>Step 2: Package Your Return</strong></p>

<p>Securely pack the product in its original packaging. Include all accessories, manuals, and inserts. Attach the return authorization label provided by our team.</p>

<p><strong>Step 3: Ship Your Return</strong></p>

<p>Return shipping costs are the responsibility of the customer unless the product is defective or an error was made by Demolux. We recommend using a tracked shipping service for your protection.</p>

<p><strong>Step 4: Receive Your Refund</strong></p>

<p>Once we receive and inspect your return, we will process your refund within 7-10 business days. Refunds are issued to the original payment method. You will receive an email confirmation when the refund is complete.</p>`
        },
        {
          section_title: 'Exchanges',
          layout: 'centered',
          content: `<p>We currently do not offer direct exchanges. If you would like a different product, please return the original item for a refund and place a new order.</p>

<p>For defective products or shipping errors, please contact us immediately at <strong>support@demolux.com</strong>, and we will arrange a replacement at no cost to you.</p>`
        },
        {
          section_title: 'Damaged or Defective Products',
          layout: 'centered',
          content: `<p>While rare, if your Demolux product arrives damaged or is found to be defective, we will make it right.</p>

<p><strong>Reporting Damage:</strong></p>

<ul>
<li>Inspect your order upon delivery</li>
<li>Report any damage or defects within 48 hours of receipt by emailing <strong>support@demolux.com</strong></li>
<li>Include photos of the damage and packaging</li>
</ul>

<p>We will arrange a replacement or full refund, including return shipping costs, at no charge to you.</p>`
        },
        {
          section_title: 'Lost or Stolen Packages',
          layout: 'centered',
          content: `<p>Demolux is not responsible for lost or stolen packages once they have been marked as delivered by the carrier. We recommend:</p>

<ul>
<li>Tracking your order and arranging to be present at delivery</li>
<li>Requesting signature confirmation for high-value items</li>
<li>Providing a secure delivery location or alternative address</li>
</ul>

<p>If you believe your package was lost or stolen, please contact the shipping carrier immediately to file a claim. Our team is available to assist with this process.</p>`
        },
        {
          section_title: 'Questions?',
          layout: 'centered',
          content: `<p>Our customer experience team is here to help with any shipping or returns inquiries.</p>

<p><strong>Demolux Customer Experience</strong><br>
Email: hello@demolux.com<br>
Phone: +45 3333 7000<br>
Hours: Monday-Friday, 9:00 AM - 6:00 PM CET</p>

<p>We're committed to ensuring your Demolux experience is seamless from start to finish.</p>`
        }
      ]
    };

    // Try to find existing entry
    let entry;
    try {
      const entries = await stack.contentType('page').entry().query({ query: { slug: 'shipping' } }).find();
      if (entries.items && entries.items.length > 0) {
        entry = stack.contentType('page').entry(entries.items[0].uid);
        console.log('✏️  Updating existing Shipping & Returns page...');
        await entry.fetch();
        Object.assign(entry, shippingPageContent);
        await entry.update();
      }
    } catch (err) {
      console.log('📝 Creating new Shipping & Returns page...');
    }

    // Create new entry if not found
    if (!entry) {
      entry = await stack.contentType('page').entry().create({ entry: shippingPageContent });
    }

    console.log('✅ Shipping & Returns page created/updated successfully!');
    console.log('   UID:', entry.uid);

    // Publish the entry
    console.log('📤 Publishing Shipping & Returns page...');
    await entry.publish({
      publishDetails: {
        environments: [process.env.CONTENTSTACK_ENVIRONMENT || 'dev'],
        locales: ['en-us']
      }
    });

    console.log('✅ Shipping & Returns page published successfully!');
    console.log('\n🎉 Done! Visit http://localhost:3000/shipping to see your Shipping & Returns page.');

  } catch (error) {
    console.error('❌ Error:', error);
    if (error.errorMessage) {
      console.error('   Message:', error.errorMessage);
    }
    if (error.errors) {
      console.error('   Details:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

createShippingPage();
