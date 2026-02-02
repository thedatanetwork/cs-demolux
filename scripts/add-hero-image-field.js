require('dotenv').config();
const contentstack = require('@contentstack/management');

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

const client = contentstack.client();
const stack = client.stack({
  api_key: stackConfig.api_key,
  management_token: stackConfig.management_token,
});

async function addHeroImageField() {
  console.log('\nAdding hero_image field to modular_home_page hero_section block...\n');

  try {
    const contentType = await stack.contentType('modular_home_page').fetch();
    const schema = contentType.schema;

    // Find page_sections field (modular blocks)
    const pageSections = schema.find(f => f.uid === 'page_sections');
    if (!pageSections) {
      console.log('page_sections field not found');
      return;
    }

    // Find hero_section block within modular blocks
    const heroBlock = pageSections.blocks?.find(b => b.uid === 'hero_section');
    if (!heroBlock) {
      console.log('hero_section block not found in page_sections');
      return;
    }

    // Check if hero_image already exists
    if (heroBlock.schema?.find(f => f.uid === 'hero_image')) {
      console.log('hero_image field already exists. Skipping.');
      return;
    }

    // Find the position of background_media to insert after it
    const bgMediaIndex = heroBlock.schema.findIndex(f => f.uid === 'background_media');
    const insertIndex = bgMediaIndex >= 0 ? bgMediaIndex + 1 : heroBlock.schema.length;

    // Add hero_image field
    const heroImageField = {
      display_name: 'Hero Image',
      uid: 'hero_image',
      data_type: 'file',
      field_metadata: {
        description: 'Featured image displayed in the right column of the split_hero variant. Use this instead of Background Image for split hero layouts.',
        image: true,
      },
    };

    heroBlock.schema.splice(insertIndex, 0, heroImageField);

    contentType.schema = schema;
    await contentType.update();
    console.log('hero_image field added successfully to hero_section block.');
    console.log('You can now upload a Hero Image in the Contentstack CMS for the split_hero variant.');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

addHeroImageField().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
