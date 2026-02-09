#!/usr/bin/env node

/**
 * Migrate URL Fields to Contentstack URL Field Type
 *
 * This script:
 * 1. Updates content type schemas to change URL field from Link to URL type
 * 2. Migrates existing entry data (extracts href value to new URL format)
 *
 * IMPORTANT: Run this AFTER deploying the code changes that expect url: string
 *
 * The Contentstack URL field type:
 * - Returns just a string (the URL path)
 * - Required for Visual Builder integration
 * - Different from Link field (which has title + href)
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

// Configuration
const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
  region: process.env.CONTENTSTACK_REGION || 'US'
};

// Validate configuration
if (!stackConfig.api_key || !stackConfig.management_token) {
  console.error('❌ Missing required environment variables:');
  console.error('   CONTENTSTACK_API_KEY');
  console.error('   CONTENTSTACK_MANAGEMENT_TOKEN');
  console.error('\nMake sure your scripts/.env file has the correct credentials.');
  process.exit(1);
}

// Initialize Management API
const client = contentstack.client();

const stack = client.stack({
  api_key: stackConfig.api_key,
  management_token: stackConfig.management_token
});

// Content types to migrate
const contentTypesToMigrate = [
  {
    uid: 'product',
    fieldUid: 'url',
    displayName: 'URL',
    helpText: 'URL path for the product page (e.g., /products/smart-watch). Required for Visual Builder.',
  },
  {
    uid: 'blog_post',
    fieldUid: 'url',
    displayName: 'URL',
    helpText: 'URL path for the blog post (e.g., /blog/future-of-wearables). Required for Visual Builder.',
  }
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Step 1: Update content type schema to use URL field type
 */
async function updateContentTypeSchema(contentTypeUid, fieldUid, displayName, helpText) {
  try {
    console.log(`\n📋 Fetching ${contentTypeUid} content type schema...`);
    const contentType = await stack.contentType(contentTypeUid).fetch();

    // Find the field
    const fieldIndex = contentType.schema.findIndex(field => field.uid === fieldUid);

    if (fieldIndex === -1) {
      console.log(`⚠️  Field '${fieldUid}' not found in ${contentTypeUid}. Skipping schema update...`);
      return false;
    }

    const field = contentType.schema[fieldIndex];
    console.log(`   Current field type: ${field.data_type}`);

    // Check if it's already URL type (not link)
    // URL field type in Contentstack has data_type: 'text' with field_metadata indicating URL
    if (field.data_type === 'text' && field.field_metadata?._default === true) {
      console.log(`✅ Field '${fieldUid}' appears to already be URL type in ${contentTypeUid}. Skipping...`);
      return 'already_done';
    }

    // If it's a link field, we need to change it
    if (field.data_type === 'link') {
      console.log(`🔄 Converting '${fieldUid}' from Link to URL field type...`);

      // The Contentstack URL field type is actually a text field with specific metadata
      // When you create a "URL" field in the UI, it creates this structure:
      contentType.schema[fieldIndex] = {
        uid: fieldUid,
        data_type: 'text',
        display_name: displayName,
        mandatory: true,
        unique: true,
        field_metadata: {
          _default: true,
          instruction: helpText,
          version: 3
        },
        format: '',
        error_messages: {
          format: ''
        },
        non_localizable: false,
        multiple: false
      };

      // Save the updated content type
      console.log(`💾 Saving updated ${contentTypeUid} content type schema...`);
      await contentType.update();

      console.log(`✅ Successfully updated '${fieldUid}' to URL field type in ${contentTypeUid}`);
      return true;
    }

    console.log(`⚠️  Field '${fieldUid}' has unexpected type '${field.data_type}'. Manual review needed.`);
    return false;

  } catch (error) {
    console.error(`\n❌ Failed to update ${contentTypeUid} schema:`);
    console.error(`   ${error.message}`);
    if (error.errors) {
      console.error('\nDetailed errors:', JSON.stringify(error.errors, null, 2));
    }
    return false;
  }
}

/**
 * Step 2: Migrate existing entry data
 * Extracts href value from Link field and saves as plain URL string
 */
async function migrateEntryData(contentTypeUid, fieldUid) {
  try {
    console.log(`\n📦 Fetching ${contentTypeUid} entries to migrate...`);

    const query = stack.contentType(contentTypeUid).entry().query();
    const entries = await query.find();

    if (!entries.items || entries.items.length === 0) {
      console.log(`   No entries found in ${contentTypeUid}.`);
      return { migrated: 0, skipped: 0, errors: 0 };
    }

    console.log(`   Found ${entries.items.length} entries to check.`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const entry of entries.items) {
      const currentValue = entry[fieldUid];

      // Check if it needs migration (has href property = Link field format)
      if (currentValue && typeof currentValue === 'object' && currentValue.href) {
        const newUrl = currentValue.href;
        console.log(`   🔄 Migrating ${entry.title}: "${currentValue.href}"`);

        try {
          // Fetch the entry for update
          const entryToUpdate = await stack.contentType(contentTypeUid).entry(entry.uid).fetch();
          entryToUpdate[fieldUid] = newUrl;

          await entryToUpdate.update();
          migrated++;

          // Small delay to avoid rate limiting
          await delay(200);
        } catch (err) {
          console.error(`   ❌ Failed to migrate ${entry.title}: ${err.message}`);
          errors++;
        }
      } else if (currentValue && typeof currentValue === 'string') {
        console.log(`   ✅ ${entry.title}: Already migrated (${currentValue})`);
        skipped++;
      } else {
        console.log(`   ⚠️  ${entry.title}: No URL value found`);
        skipped++;
      }
    }

    return { migrated, skipped, errors };

  } catch (error) {
    console.error(`\n❌ Failed to migrate ${contentTypeUid} entries:`);
    console.error(`   ${error.message}`);
    return { migrated: 0, skipped: 0, errors: 1 };
  }
}

/**
 * Step 3: Publish migrated entries
 */
async function publishEntries(contentTypeUid) {
  try {
    console.log(`\n🚀 Publishing ${contentTypeUid} entries...`);

    const query = stack.contentType(contentTypeUid).entry().query();
    const entries = await query.find();

    if (!entries.items || entries.items.length === 0) {
      return 0;
    }

    let published = 0;

    for (const entry of entries.items) {
      try {
        const entryToPublish = await stack.contentType(contentTypeUid).entry(entry.uid).fetch();
        await entryToPublish.publish({
          environments: [stackConfig.environment],
          locales: ['en-us']
        });
        published++;
        console.log(`   ✅ Published: ${entry.title}`);
        await delay(300);
      } catch (err) {
        console.log(`   ⚠️  Could not publish ${entry.title}: ${err.message}`);
      }
    }

    return published;

  } catch (error) {
    console.error(`\n❌ Failed to publish ${contentTypeUid} entries:`, error.message);
    return 0;
  }
}

async function runMigration() {
  console.log('🚀 Starting URL Field Migration\n');
  console.log('='.repeat(60));
  console.log('This will convert Link fields to Contentstack URL field type');
  console.log('and migrate existing entry data.');
  console.log('='.repeat(60));

  const results = {
    schemaUpdates: { success: 0, skipped: 0, failed: 0 },
    dataMigration: { migrated: 0, skipped: 0, errors: 0 },
    published: 0
  };

  // Step 1: Update schemas
  console.log('\n\n📋 STEP 1: Updating Content Type Schemas');
  console.log('-'.repeat(40));

  for (const config of contentTypesToMigrate) {
    const result = await updateContentTypeSchema(
      config.uid,
      config.fieldUid,
      config.displayName,
      config.helpText
    );

    if (result === true) {
      results.schemaUpdates.success++;
    } else if (result === 'already_done') {
      results.schemaUpdates.skipped++;
    } else {
      results.schemaUpdates.failed++;
    }

    await delay(1000); // Wait between schema updates
  }

  // Step 2: Migrate entry data
  console.log('\n\n📦 STEP 2: Migrating Entry Data');
  console.log('-'.repeat(40));

  for (const config of contentTypesToMigrate) {
    const result = await migrateEntryData(config.uid, config.fieldUid);
    results.dataMigration.migrated += result.migrated;
    results.dataMigration.skipped += result.skipped;
    results.dataMigration.errors += result.errors;
  }

  // Step 3: Publish entries
  console.log('\n\n🚀 STEP 3: Publishing Migrated Entries');
  console.log('-'.repeat(40));

  for (const config of contentTypesToMigrate) {
    const published = await publishEntries(config.uid);
    results.published += published;
  }

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log('\nSchema Updates:');
  console.log(`   ✅ Updated: ${results.schemaUpdates.success}`);
  console.log(`   ⏭️  Skipped: ${results.schemaUpdates.skipped}`);
  console.log(`   ❌ Failed: ${results.schemaUpdates.failed}`);
  console.log('\nData Migration:');
  console.log(`   ✅ Migrated: ${results.dataMigration.migrated}`);
  console.log(`   ⏭️  Skipped: ${results.dataMigration.skipped}`);
  console.log(`   ❌ Errors: ${results.dataMigration.errors}`);
  console.log('\nPublishing:');
  console.log(`   ✅ Published: ${results.published}`);
  console.log('='.repeat(60));

  if (results.schemaUpdates.failed > 0 || results.dataMigration.errors > 0) {
    console.log('\n⚠️  Some migrations failed. Please review the errors above.');
    console.log('   You may need to manually update schemas in Contentstack UI.');
  } else {
    console.log('\n✅ Migration completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Verify the changes in Contentstack dashboard');
    console.log('   2. Test Visual Builder with the updated content types');
    console.log('   3. Deploy the code changes if not already done');
  }
}

// Run the migration
if (require.main === module) {
  runMigration().catch(error => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { runMigration };
