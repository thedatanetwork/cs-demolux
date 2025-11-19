require('dotenv').config();
const contentstack = require('@contentstack/management');

const client = contentstack.client();

async function createTermsPage() {
  try {
    const stack = client.stack({
      api_key: process.env.CONTENTSTACK_API_KEY,
      management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN
    });

    console.log('🔍 Checking for existing Terms of Service page...');

    // Terms of Service page content
    const termsPageContent = {
      title: 'Terms of Service',
      slug: 'terms',
      meta_description: 'Demolux Terms of Service - Review the terms and conditions governing your use of Demolux products and services.',
      hero_section: {
        title: 'Terms of Service',
        subtitle: 'These terms govern your relationship with Demolux and ensure a mutually respectful and transparent partnership as you experience our innovations.'
      },
      content_sections: [
        {
          section_title: 'Welcome to Demolux',
          layout: 'centered',
          content: `<p>Thank you for choosing Demolux. These Terms of Service ("Terms") govern your access to and use of the Demolux website, products, and services (collectively, the "Services"). By using our Services, you agree to these Terms in full.</p>

<p>If you do not agree with any part of these Terms, please discontinue use of our Services immediately.</p>

<p><em>Last Updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</em></p>`
        },
        {
          section_title: 'Eligibility',
          layout: 'centered',
          content: `<p>To use Demolux Services, you must:</p>

<ul>
<li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
<li>Have the legal capacity to enter into binding agreements</li>
<li>Provide accurate, complete, and current information during registration</li>
<li>Comply with all applicable local, national, and international laws</li>
</ul>

<p>By creating an account or placing an order, you represent and warrant that you meet these eligibility requirements.</p>`
        },
        {
          section_title: 'Account Responsibilities',
          layout: 'centered',
          content: `<p>When you create a Demolux account, you agree to:</p>

<ul>
<li>Maintain the confidentiality of your login credentials</li>
<li>Notify us immediately of any unauthorized access or security breach</li>
<li>Accept responsibility for all activities conducted under your account</li>
<li>Provide accurate and up-to-date contact and billing information</li>
</ul>

<p>Demolux reserves the right to suspend or terminate accounts that violate these Terms or engage in fraudulent, abusive, or illegal activity.</p>`
        },
        {
          section_title: 'Product Purchases and Pricing',
          layout: 'centered',
          content: `<p><strong>Orders and Acceptance</strong></p>

<p>When you place an order through Demolux, you are making an offer to purchase. We reserve the right to accept or decline any order at our discretion. Order confirmation does not constitute acceptance—acceptance occurs upon shipment or delivery confirmation.</p>

<p><strong>Pricing and Availability</strong></p>

<ul>
<li>All prices are listed in the currency displayed at checkout and are subject to change without notice</li>
<li>Product availability is not guaranteed; limited editions and custom pieces may sell out</li>
<li>Prices exclude taxes, duties, and shipping fees unless otherwise stated</li>
<li>We reserve the right to correct pricing errors, even after order placement</li>
</ul>

<p><strong>Payment</strong></p>

<p>Payment is due at the time of purchase. We accept major credit cards, secure payment platforms, and other methods as indicated at checkout. All transactions are processed securely through encrypted third-party payment providers.</p>`
        },
        {
          section_title: 'Shipping, Delivery, and Risk of Loss',
          layout: 'centered',
          content: `<p>Demolux partners with premium carriers to ensure safe, timely delivery of your order. Shipping times and costs vary based on destination and product type.</p>

<ul>
<li><strong>Delivery Estimates:</strong> Provided at checkout; not guaranteed due to factors beyond our control</li>
<li><strong>Risk of Loss:</strong> Title and risk of loss pass to you upon delivery</li>
<li><strong>Customs and Duties:</strong> International customers are responsible for applicable customs fees, taxes, and import duties</li>
</ul>

<p>For detailed shipping information, please visit our <a href="/shipping">Shipping & Returns</a> page.</p>`
        },
        {
          section_title: 'Returns and Refunds',
          layout: 'centered',
          content: `<p>We stand behind the quality of every Demolux product. If you are not completely satisfied, we offer returns within 30 days of delivery, subject to the following conditions:</p>

<ul>
<li>Products must be unused, undamaged, and in original packaging</li>
<li>Custom or personalized items may not be eligible for return</li>
<li>Proof of purchase is required</li>
<li>Return shipping costs are the responsibility of the customer unless the product is defective or an error was made by Demolux</li>
</ul>

<p>Refunds are processed to the original payment method within 7-10 business days of receiving the returned item. For complete return details, see our <a href="/shipping">Shipping & Returns</a> page.</p>`
        },
        {
          section_title: 'Product Warranties and Disclaimers',
          layout: 'centered',
          content: `<p><strong>Limited Warranty</strong></p>

<p>Demolux warrants that products will be free from defects in materials and workmanship under normal use for a period of one (1) year from the date of delivery. This warranty does not cover damage caused by misuse, accidents, unauthorized modifications, or normal wear and tear.</p>

<p><strong>Disclaimer of Other Warranties</strong></p>

<p>Except as expressly stated above, Demolux products are provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>

<p>Some jurisdictions do not allow the exclusion of implied warranties, so the above exclusions may not apply to you.</p>`
        },
        {
          section_title: 'Limitation of Liability',
          layout: 'centered',
          content: `<p>To the fullest extent permitted by law, Demolux shall not be liable for any indirect, incidental, consequential, special, or punitive damages arising from or related to your use of our Services or products, even if we have been advised of the possibility of such damages.</p>

<p>Our total liability for any claim arising from these Terms or your use of our Services shall not exceed the amount you paid for the product or service giving rise to the claim.</p>

<p>This limitation of liability does not apply to damages caused by gross negligence, willful misconduct, or violations of applicable consumer protection laws.</p>`
        },
        {
          section_title: 'Intellectual Property Rights',
          layout: 'centered',
          content: `<p>All content on the Demolux website—including text, graphics, logos, images, product designs, software, and trademarks—is the property of Demolux or its licensors and is protected by copyright, trademark, and other intellectual property laws.</p>

<p>You may not:</p>

<ul>
<li>Reproduce, distribute, modify, or create derivative works from our content without prior written permission</li>
<li>Use Demolux trademarks, logos, or branding without authorization</li>
<li>Reverse engineer, decompile, or disassemble any Demolux products or software</li>
<li>Remove or alter any proprietary notices or labels</li>
</ul>

<p>Unauthorized use may result in legal action and termination of your access to our Services.</p>`
        },
        {
          section_title: 'User Conduct and Prohibited Activities',
          layout: 'centered',
          content: `<p>When using Demolux Services, you agree not to:</p>

<ul>
<li>Engage in fraudulent, deceptive, or unlawful activity</li>
<li>Interfere with or disrupt the operation of our website or servers</li>
<li>Attempt to gain unauthorized access to Demolux systems or accounts</li>
<li>Transmit viruses, malware, or other harmful code</li>
<li>Harass, threaten, or harm other users or Demolux staff</li>
<li>Scrape, crawl, or data mine our website without permission</li>
<li>Impersonate any person or entity or misrepresent your affiliation</li>
</ul>

<p>Violations may result in account suspension, termination, and legal action.</p>`
        },
        {
          section_title: 'Privacy and Data Protection',
          layout: 'centered',
          content: `<p>Your use of Demolux Services is also governed by our <a href="/privacy">Privacy Policy</a>, which explains how we collect, use, and protect your personal information. By using our Services, you consent to such processing in accordance with the Privacy Policy.</p>`
        },
        {
          section_title: 'Modifications to Terms',
          layout: 'centered',
          content: `<p>Demolux reserves the right to modify these Terms at any time. Changes will be effective upon posting to our website. We will notify you of material changes via email or a prominent notice on our site.</p>

<p>Your continued use of our Services after such modifications constitutes acceptance of the updated Terms. If you do not agree to the changes, you must discontinue use of our Services.</p>`
        },
        {
          section_title: 'Termination',
          layout: 'centered',
          content: `<p>Demolux may terminate or suspend your access to our Services at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, Demolux, or third parties.</p>

<p>Upon termination, your right to use our Services will immediately cease. Sections of these Terms that by their nature should survive termination will remain in effect, including but not limited to intellectual property rights, disclaimers, and limitations of liability.</p>`
        },
        {
          section_title: 'Governing Law and Dispute Resolution',
          layout: 'centered',
          content: `<p>These Terms shall be governed by and construed in accordance with the laws of Denmark, without regard to its conflict of law provisions.</p>

<p>Any disputes arising from these Terms or your use of Demolux Services shall be resolved through binding arbitration in Copenhagen, Denmark, in accordance with the rules of the Danish Arbitration Association. You waive any right to participate in class actions or class arbitrations.</p>

<p>In jurisdictions where arbitration agreements are unenforceable, disputes shall be resolved in the courts of Copenhagen, Denmark.</p>`
        },
        {
          section_title: 'Miscellaneous',
          layout: 'centered',
          content: `<p><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and Demolux.</p>

<p><strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.</p>

<p><strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.</p>

<p><strong>Assignment:</strong> You may not assign or transfer these Terms without our prior written consent. Demolux may assign these Terms at any time without notice.</p>`
        },
        {
          section_title: 'Contact Information',
          layout: 'centered',
          content: `<p>Questions or concerns about these Terms? We're here to help.</p>

<p><strong>Demolux Legal Team</strong><br>
Email: legal@demolux.com<br>
Phone: +45 3333 7000<br>
Address: Demolux ApS, Copenhagen, Denmark</p>

<p>Thank you for being part of the Demolux community. We look forward to delivering exceptional experiences that redefine luxury technology.</p>`
        }
      ]
    };

    // Try to find existing entry
    let entry;
    try {
      const entries = await stack.contentType('page').entry().query({ query: { slug: 'terms' } }).find();
      if (entries.items && entries.items.length > 0) {
        entry = stack.contentType('page').entry(entries.items[0].uid);
        console.log('✏️  Updating existing Terms of Service page...');
        await entry.fetch();
        Object.assign(entry, termsPageContent);
        await entry.update();
      }
    } catch (err) {
      console.log('📝 Creating new Terms of Service page...');
    }

    // Create new entry if not found
    if (!entry) {
      entry = await stack.contentType('page').entry().create({ entry: termsPageContent });
    }

    console.log('✅ Terms of Service page created/updated successfully!');
    console.log('   UID:', entry.uid);

    // Publish the entry
    console.log('📤 Publishing Terms of Service page...');
    await entry.publish({
      publishDetails: {
        environments: [process.env.CONTENTSTACK_ENVIRONMENT || 'dev'],
        locales: ['en-us']
      }
    });

    console.log('✅ Terms of Service page published successfully!');
    console.log('\n🎉 Done! Visit http://localhost:3000/terms to see your Terms of Service page.');

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

createTermsPage();
