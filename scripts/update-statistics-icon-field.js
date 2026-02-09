require('dotenv').config();
const contentstack = require('@contentstack/management');

const client = contentstack.client();
const stack = client.stack({
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
});

// Extension UID for the Lucide icon picker custom field (from dev_statistics_block)
const ICON_EXTENSION_UID = 'blt788c131f4a2f3aff';

async function updateIconField() {
  console.log('\nUpdating statistics block icon field to use custom field extension...\n');

  try {
    const contentType = await stack.contentType('modular_home_page').fetch();
    const schema = contentType.schema;

    const pageSections = schema.find(function(f) { return f.uid === 'page_sections'; });
    if (!pageSections || !pageSections.blocks) {
      console.log('page_sections field not found');
      return;
    }

    const statsBlock = pageSections.blocks.find(function(b) { return b.uid === 'statistics'; });
    if (!statsBlock) {
      console.log('statistics block not found in page_sections');
      return;
    }

    const metricsField = statsBlock.schema.find(function(f) { return f.uid === 'metrics'; });
    if (!metricsField || !metricsField.schema) {
      console.log('metrics group field not found in statistics block');
      return;
    }

    const iconFieldIndex = metricsField.schema.findIndex(function(f) { return f.uid === 'icon'; });
    if (iconFieldIndex === -1) {
      console.log('icon field not found in metrics group');
      return;
    }

    const currentField = metricsField.schema[iconFieldIndex];

    // Check if already using the extension
    if (currentField.extension_uid) {
      console.log('Icon field already uses custom field extension. Skipping.');
      return;
    }

    console.log('Current icon field:', JSON.stringify(currentField, null, 2));

    // Replace with custom field extension version
    metricsField.schema[iconFieldIndex] = {
      display_name: 'Icon',
      extension_uid: ICON_EXTENSION_UID,
      field_metadata: {
        extension: true,
      },
      uid: 'icon',
      mandatory: false,
      non_localizable: false,
      unique: false,
      config: {},
      data_type: 'text',
      multiple: false,
    };

    contentType.schema = schema;
    await contentType.update();
    console.log('\nIcon field updated to use custom field extension.');
    console.log('You can now use the visual icon picker in the CMS.');
    console.log('Go to the statistics block in the modular homepage and re-select icons for each metric.');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

updateIconField().catch(function(e) { console.error(e); process.exit(1); });
