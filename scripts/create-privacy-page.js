require('dotenv').config();
const contentstack = require('@contentstack/management');

const client = contentstack.client();

async function createPrivacyPage() {
  try {
    const stack = client.stack({
      api_key: process.env.CONTENTSTACK_API_KEY,
      management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN
    });

    console.log('🔍 Checking for existing Privacy Policy page...');

    // Privacy Policy page content
    const privacyPageContent = {
      title: 'Privacy Policy',
      slug: 'privacy',
      meta_description: 'Demolux Privacy Policy - Learn how we protect and handle your personal information with the same care and precision we apply to our luxury products.',
      hero_section: {
        title: 'Privacy Policy',
        subtitle: 'Your privacy is as important to us as the quality of our products. We handle your information with the same precision and care that defines every Demolux creation.'
      },
      content_sections: [
        {
          section_title: 'Our Commitment to Your Privacy',
          layout: 'centered',
          content: `<p>At Demolux, we believe that luxury extends beyond products to encompass every aspect of your experience with us. This includes the thoughtful, transparent handling of your personal information.</p>

<p>This Privacy Policy outlines how Demolux ("we," "our," or "us") collects, uses, protects, and shares information when you interact with our website, products, and services. By engaging with Demolux, you agree to the practices described in this policy.</p>

<p><em>Last Updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</em></p>`
        },
        {
          section_title: 'Information We Collect',
          layout: 'centered',
          content: `<p><strong>Personal Information You Provide</strong></p>

<p>When you engage with Demolux—whether placing an order, scheduling a private viewing, or subscribing to our newsletter—we may collect:</p>

<ul>
<li>Name and contact details (email, phone, shipping address)</li>
<li>Payment and billing information (processed securely through encrypted third-party payment providers)</li>
<li>Account credentials and preferences</li>
<li>Communication history and preferences</li>
<li>Custom product specifications and design preferences</li>
</ul>

<p><strong>Information Collected Automatically</strong></p>

<p>To enhance your experience and optimize our platform, we collect certain technical data:</p>

<ul>
<li>Device information (browser type, operating system, screen resolution)</li>
<li>IP address and approximate geographic location</li>
<li>Pages viewed, links clicked, and time spent on our site</li>
<li>Referral sources and navigation patterns</li>
<li>Cookie data and session identifiers</li>
</ul>

<p><strong>Product Interaction Data</strong></p>

<p>Some Demolux products may collect anonymized usage data to improve functionality, personalize experiences, and develop future innovations. This data is handled with the utmost care and is never sold to third parties.</p>`
        },
        {
          section_title: 'How We Use Your Information',
          layout: 'centered',
          content: `<p>Your information enables us to deliver the exceptional service you expect from Demolux:</p>

<ul>
<li><strong>Order Fulfillment:</strong> Processing purchases, coordinating delivery, and providing customer support</li>
<li><strong>Personalization:</strong> Tailoring product recommendations and content to your preferences</li>
<li><strong>Communication:</strong> Sending order updates, product launches, and curated content (with your consent)</li>
<li><strong>Platform Improvement:</strong> Analyzing site performance and user behavior to refine the Demolux experience</li>
<li><strong>Security:</strong> Detecting fraud, preventing abuse, and protecting both you and Demolux</li>
<li><strong>Legal Compliance:</strong> Meeting regulatory obligations and responding to lawful requests</li>
</ul>

<p>We never sell your personal information to third parties. Any data sharing is limited to trusted partners who help us deliver our services (e.g., payment processors, shipping carriers) and who are contractually bound to protect your privacy.</p>`
        },
        {
          section_title: 'Cookies and Tracking Technologies',
          layout: 'centered',
          content: `<p>Demolux uses cookies and similar technologies to enhance your browsing experience, remember your preferences, and gather insights into site usage.</p>

<p><strong>Types of Cookies We Use:</strong></p>

<ul>
<li><strong>Essential Cookies:</strong> Required for core site functionality (e.g., shopping cart, secure login)</li>
<li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our site</li>
<li><strong>Personalization Cookies:</strong> Remember your preferences and customize content</li>
<li><strong>Marketing Cookies:</strong> Track advertising effectiveness and deliver relevant promotions</li>
</ul>

<p>You can manage cookie preferences through your browser settings. Note that disabling certain cookies may limit site functionality.</p>`
        },
        {
          section_title: 'Data Security and Retention',
          layout: 'centered',
          content: `<p>Protecting your information is paramount. Demolux employs industry-leading security measures:</p>

<ul>
<li>End-to-end encryption for sensitive data transmission</li>
<li>Secure servers with regular security audits</li>
<li>Restricted access to personal information on a need-to-know basis</li>
<li>Regular staff training on data protection best practices</li>
</ul>

<p>We retain your information only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, or resolve disputes. When data is no longer needed, it is securely deleted or anonymized.</p>`
        },
        {
          section_title: 'Your Rights and Choices',
          layout: 'centered',
          content: `<p>You have the following rights regarding your personal information:</p>

<ul>
<li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
<li><strong>Correction:</strong> Update or correct inaccurate information</li>
<li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal and contractual obligations)</li>
<li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
<li><strong>Data Portability:</strong> Request your data in a structured, commonly used format</li>
<li><strong>Object:</strong> Object to certain processing activities, such as direct marketing</li>
</ul>

<p>To exercise these rights, please contact us at <strong>privacy@demolux.com</strong>. We will respond to your request within 30 days.</p>`
        },
        {
          section_title: 'International Data Transfers',
          layout: 'centered',
          content: `<p>Demolux is headquartered in Copenhagen, Denmark, but serves customers globally. Your information may be transferred to and processed in countries outside your residence. We ensure that all international transfers comply with applicable data protection laws, including the use of Standard Contractual Clauses and other approved safeguards.</p>`
        },
        {
          section_title: 'Third-Party Links and Services',
          layout: 'centered',
          content: `<p>Our website may contain links to third-party sites or services. Demolux is not responsible for the privacy practices of these external platforms. We encourage you to review their privacy policies before sharing any personal information.</p>`
        },
        {
          section_title: "Children's Privacy",
          layout: 'centered',
          content: `<p>Demolux products and services are intended for adults. We do not knowingly collect personal information from individuals under 18 years of age. If you believe a child has provided us with personal data, please contact us immediately at privacy@demolux.com, and we will take steps to delete such information.</p>`
        },
        {
          section_title: 'Changes to This Policy',
          layout: 'centered',
          content: `<p>As Demolux evolves, so too may this Privacy Policy. We will notify you of significant changes via email or a prominent notice on our website. Continued use of our services after such changes constitutes acceptance of the updated policy.</p>`
        },
        {
          section_title: 'Contact Us',
          layout: 'centered',
          content: `<p>Questions, concerns, or requests regarding your privacy? We're here to help.</p>

<p><strong>Demolux Privacy Team</strong><br>
Email: privacy@demolux.com<br>
Phone: +45 3333 7000<br>
Address: Demolux ApS, Copenhagen, Denmark</p>

<p>Your trust is the foundation of our relationship. We are committed to protecting your privacy with the same dedication we bring to crafting exceptional products.</p>`
        }
      ]
    };

    // Try to find existing entry
    let entry;
    try {
      const entries = await stack.contentType('page').entry().query({ query: { slug: 'privacy' } }).find();
      if (entries.items && entries.items.length > 0) {
        entry = stack.contentType('page').entry(entries.items[0].uid);
        console.log('✏️  Updating existing Privacy Policy page...');
        await entry.fetch();
        Object.assign(entry, privacyPageContent);
        await entry.update();
      }
    } catch (err) {
      console.log('📝 Creating new Privacy Policy page...');
    }

    // Create new entry if not found
    if (!entry) {
      entry = await stack.contentType('page').entry().create({ entry: privacyPageContent });
    }

    console.log('✅ Privacy Policy page created/updated successfully!');
    console.log('   UID:', entry.uid);

    // Publish the entry
    console.log('📤 Publishing Privacy Policy page...');
    await entry.publish({
      publishDetails: {
        environments: [process.env.CONTENTSTACK_ENVIRONMENT || 'dev'],
        locales: ['en-us']
      }
    });

    console.log('✅ Privacy Policy page published successfully!');
    console.log('\n🎉 Done! Visit http://localhost:3000/privacy to see your Privacy Policy page.');

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

createPrivacyPage();
