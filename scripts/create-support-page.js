require('dotenv').config();
const contentstack = require('@contentstack/management');

const client = contentstack.client();

async function createSupportPage() {
  try {
    const stack = client.stack({
      api_key: process.env.CONTENTSTACK_API_KEY,
      management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN
    });

    console.log('🔍 Checking for existing Support page...');

    // Support page content
    const supportPageContent = {
      title: 'Support',
      slug: 'support',
      meta_description: 'Demolux Support - Get help with your products, find answers to common questions, and access technical support resources.',
      hero_section: {
        title: 'Support Center',
        subtitle: 'We\'re here to ensure your Demolux experience exceeds expectations. Explore resources, get answers, and connect with our expert support team.'
      },
      content_sections: [
        {
          section_title: 'How Can We Help You?',
          layout: 'centered',
          content: `<p>Whether you need technical assistance, product guidance, or general inquiries, the Demolux Support Center is your resource for seamless solutions.</p>`
        },
        {
          section_title: 'Frequently Asked Questions',
          layout: 'centered',
          content: `<p><strong>Product Setup & Use</strong></p>

<p><em>Q: How do I set up my Smart Winter Hat for the first time?</em><br>
A: Your Smart Winter Hat comes with a quick start guide. Simply download the Demolux Connect app, enable Bluetooth, and follow the in-app pairing instructions. The embedded display will activate automatically once paired.</p>

<p><em>Q: Can I use the AR Bracer with prescription glasses?</em><br>
A: Yes! The AR Bracer is designed to work seamlessly whether you wear glasses or not. The augmented overlays are projected onto the bracer's display, not directly into your field of vision, making it compatible with all eyewear.</p>

<p><em>Q: How do I adjust the comfort settings on my Holographic Display Chair?</em><br>
A: Use the Demolux Connect app or the discreet touch controls on the chair's armrest to adjust firmness, lumbar support, and heating. The chair also features adaptive AI that learns your preferences over time.</p>

<p><strong>Connectivity & Software</strong></p>

<p><em>Q: Which devices are compatible with Demolux products?</em><br>
A: Demolux products are compatible with iOS 15+, Android 11+, and select smart home ecosystems including Apple HomeKit, Google Home, and Amazon Alexa. Check individual product pages for specific compatibility details.</p>

<p><em>Q: How do I update the firmware on my Demolux device?</em><br>
A: Firmware updates are delivered automatically via the Demolux Connect app. When an update is available, you'll receive a notification. Simply approve the update, and it will install wirelessly. Your device will restart once complete.</p>

<p><strong>Battery & Charging</strong></p>

<p><em>Q: How long does the Smart Winter Hat battery last?</em><br>
A: On a full charge, the Smart Winter Hat provides up to 7 days of typical use (2-3 hours per day) with display and heating active. Standby mode extends battery life up to 14 days.</p>

<p><em>Q: Can I replace the battery in my AR Bracer?</em><br>
A: The AR Bracer features a rechargeable lithium-polymer battery designed to last for years. If you experience battery issues, please contact our support team for service options. We do not recommend user battery replacement to maintain product integrity and warranty coverage.</p>

<p><strong>Care & Maintenance</strong></p>

<p><em>Q: How do I clean my Demolux wearable tech?</em><br>
A: Wipe gently with a soft, lint-free cloth slightly dampened with water. Avoid harsh chemicals, abrasives, or submerging the device in water. For leather or fabric components, use a specialized cleaner recommended in your product manual.</p>

<p><em>Q: What should I do if my Minimalist Smart Side Table's display stops responding?</em><br>
A: First, try a soft reset by unplugging the table for 30 seconds, then reconnecting power. If the issue persists, contact our support team for troubleshooting assistance.</p>`
        },
        {
          section_title: 'Product Manuals & Guides',
          layout: 'centered',
          content: `<p>Access comprehensive product documentation, setup guides, and troubleshooting resources:</p>

<ul>
<li><strong>Smart Winter Hat:</strong> <a href="/support/manuals/smart-winter-hat">User Manual</a></li>
<li><strong>AR Bracer:</strong> <a href="/support/manuals/ar-bracer">User Manual</a></li>
<li><strong>Minimalist Smart Side Table:</strong> <a href="/support/manuals/smart-side-table">User Manual</a></li>
<li><strong>Holographic Display Chair:</strong> <a href="/support/manuals/holographic-chair">User Manual</a></li>
</ul>

<p><em>Note: Manual links are placeholders for demonstration purposes. Actual manuals would be hosted in Contentstack as downloadable PDFs.</em></p>`
        },
        {
          section_title: 'Warranty Information',
          layout: 'centered',
          content: `<p>All Demolux products are backed by a <strong>1-year limited warranty</strong> covering defects in materials and workmanship under normal use.</p>

<p><strong>What's Covered:</strong></p>

<ul>
<li>Manufacturing defects</li>
<li>Component failures under normal use</li>
<li>Software malfunctions not caused by user error</li>
</ul>

<p><strong>What's Not Covered:</strong></p>

<ul>
<li>Accidental damage, drops, or impacts</li>
<li>Unauthorized repairs or modifications</li>
<li>Normal wear and tear (e.g., battery degradation, cosmetic wear)</li>
<li>Damage from misuse or failure to follow product guidelines</li>
</ul>

<p>To file a warranty claim, contact us at <strong>warranty@demolux.com</strong> with your order number, product serial number, and a description of the issue.</p>`
        },
        {
          section_title: 'Technical Support',
          layout: 'centered',
          content: `<p>Our technical support team is available to assist with setup, troubleshooting, and advanced product features.</p>

<p><strong>Contact Methods:</strong></p>

<ul>
<li><strong>Email:</strong> support@demolux.com (response within 24 hours)</li>
<li><strong>Phone:</strong> +45 3333 7000 (Mon-Fri, 9:00 AM - 6:00 PM CET)</li>
<li><strong>Live Chat:</strong> Available on our website during business hours</li>
</ul>

<p><strong>Before You Contact Us:</strong></p>

<ul>
<li>Have your order number and product serial number ready</li>
<li>Try basic troubleshooting (restart device, check connections, update firmware)</li>
<li>Review the relevant product manual or FAQ section</li>
</ul>`
        },
        {
          section_title: 'Repair & Service',
          layout: 'centered',
          content: `<p>If your Demolux product requires repair, we offer authorized service through our Copenhagen service center and select partner locations worldwide.</p>

<p><strong>Repair Process:</strong></p>

<ol>
<li><strong>Contact Support:</strong> Reach out to support@demolux.com to initiate a service request</li>
<li><strong>Diagnostic:</strong> Our team will assess the issue and provide repair options and cost estimates (if out of warranty)</li>
<li><strong>Shipping:</strong> We'll provide a prepaid shipping label for return to our service center</li>
<li><strong>Repair:</strong> Repairs are typically completed within 7-10 business days</li>
<li><strong>Return:</strong> Your product will be returned via express shipping at no additional cost</li>
</ol>

<p><strong>In-Warranty Repairs:</strong> Free of charge, including shipping<br>
<strong>Out-of-Warranty Repairs:</strong> Quoted on a case-by-case basis</p>`
        },
        {
          section_title: 'Software & App Support',
          layout: 'centered',
          content: `<p>The <strong>Demolux Connect</strong> app is your central hub for managing all Demolux products. Available for iOS and Android.</p>

<p><strong>App Features:</strong></p>

<ul>
<li>Device pairing and setup</li>
<li>Firmware updates</li>
<li>Customizable settings and preferences</li>
<li>Usage analytics and insights</li>
<li>Access to exclusive content and features</li>
</ul>

<p><strong>Download:</strong></p>

<ul>
<li><a href="https://apps.apple.com/demolux-connect">iOS App Store</a></li>
<li><a href="https://play.google.com/store/apps/demolux-connect">Google Play Store</a></li>
</ul>

<p><em>Note: App links are placeholders for demonstration purposes.</em></p>`
        },
        {
          section_title: 'Community & Resources',
          layout: 'centered',
          content: `<p>Join the Demolux community to connect with other users, share experiences, and stay informed about product updates and tips.</p>

<ul>
<li><strong>Demolux Blog:</strong> <a href="/blog">Latest insights, tutorials, and product news</a></li>
<li><strong>YouTube Channel:</strong> Video guides, unboxings, and feature demonstrations</li>
<li><strong>Social Media:</strong> Follow us on Instagram, Twitter, and LinkedIn for updates</li>
</ul>`
        },
        {
          section_title: 'Contact Information',
          layout: 'centered',
          content: `<p><strong>Demolux Support Center</strong><br>
Email: support@demolux.com<br>
Phone: +45 3333 7000<br>
Live Chat: Available on website (Mon-Fri, 9:00 AM - 6:00 PM CET)<br>
Address: Demolux ApS, Copenhagen, Denmark</p>

<p>We're committed to providing exceptional support that matches the quality of our products. Thank you for choosing Demolux.</p>`
        }
      ]
    };

    // Try to find existing entry
    let entry;
    try {
      const entries = await stack.contentType('page').entry().query({ query: { slug: 'support' } }).find();
      if (entries.items && entries.items.length > 0) {
        entry = stack.contentType('page').entry(entries.items[0].uid);
        console.log('✏️  Updating existing Support page...');
        await entry.fetch();
        Object.assign(entry, supportPageContent);
        await entry.update();
      }
    } catch (err) {
      console.log('📝 Creating new Support page...');
    }

    // Create new entry if not found
    if (!entry) {
      entry = await stack.contentType('page').entry().create({ entry: supportPageContent });
    }

    console.log('✅ Support page created/updated successfully!');
    console.log('   UID:', entry.uid);

    // Publish the entry
    console.log('📤 Publishing Support page...');
    await entry.publish({
      publishDetails: {
        environments: [process.env.CONTENTSTACK_ENVIRONMENT || 'dev'],
        locales: ['en-us']
      }
    });

    console.log('✅ Support page published successfully!');
    console.log('\n🎉 Done! Visit http://localhost:3000/support to see your Support page.');

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

createSupportPage();
