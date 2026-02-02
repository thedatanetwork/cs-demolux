require('dotenv').config();
const contentstack = require('@contentstack/management');

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
  region: process.env.CONTENTSTACK_REGION || 'US'
};

console.log('Contentstack Configuration:', {
  api_key: stackConfig.api_key ? `${stackConfig.api_key.substring(0, 10)}...` : 'missing',
  management_token: stackConfig.management_token ? `${stackConfig.management_token.substring(0, 10)}...` : 'missing',
  environment: stackConfig.environment,
  region: stackConfig.region
});

const client = contentstack.client();

const stack = client.stack({
  api_key: stackConfig.api_key,
  management_token: stackConfig.management_token
});

// ============================================================================
// HTML to JSON RTE Converter
// ============================================================================

/**
 * Convert an HTML string to Contentstack JSON RTE document format.
 * Handles: h2, h3, p, ul/ol with li, strong, em, a tags.
 */
function htmlToJsonRte(html) {
  if (!html || typeof html !== 'string') {
    return { type: 'doc', uid: generateUid(), attrs: {}, children: [{ type: 'p', uid: generateUid(), attrs: {}, children: [{ text: '' }] }] };
  }

  // Trim and normalize whitespace
  const trimmed = html.trim();
  const children = [];

  // Split into top-level block elements
  // Match tags like <h2>...</h2>, <h3>...</h3>, <p>...</p>, <ul>...</ul>, <ol>...</ol>
  const blockRegex = /<(h[2-6]|p|ul|ol)([\s>])([\s\S]*?)<\/\1>/gi;
  let match;

  while ((match = blockRegex.exec(trimmed)) !== null) {
    const tag = match[1].toLowerCase();
    const innerHtml = match[3];

    if (tag === 'ul' || tag === 'ol') {
      children.push(parseList(tag, innerHtml));
    } else {
      children.push({
        type: tag,
        uid: generateUid(),
        attrs: {},
        children: parseInlineContent(innerHtml)
      });
    }
  }

  // If no blocks were found, wrap the whole thing in a paragraph
  if (children.length === 0) {
    children.push({
      type: 'p',
      uid: generateUid(),
      attrs: {},
      children: parseInlineContent(trimmed)
    });
  }

  return {
    type: 'doc',
    uid: generateUid(),
    attrs: {},
    children
  };
}

function parseList(tag, innerHtml) {
  const listType = tag === 'ul' ? 'ul' : 'ol';
  const items = [];
  const liRegex = /<li>([\s\S]*?)<\/li>/gi;
  let liMatch;

  while ((liMatch = liRegex.exec(innerHtml)) !== null) {
    items.push({
      type: 'li',
      uid: generateUid(),
      attrs: {},
      children: [{
        type: 'p',
        uid: generateUid(),
        attrs: {},
        children: parseInlineContent(liMatch[1])
      }]
    });
  }

  return {
    type: listType,
    uid: generateUid(),
    attrs: {},
    children: items.length > 0 ? items : [{ type: 'li', uid: generateUid(), attrs: {}, children: [{ type: 'p', uid: generateUid(), attrs: {}, children: [{ text: '' }] }] }]
  };
}

function parseInlineContent(html) {
  if (!html) return [{ text: '' }];

  const result = [];
  let remaining = html;

  // Process inline tags: <strong>, <em>, <a>
  const inlineRegex = /<(strong|b|em|i|a)(\s[^>]*)?>([^<]*)<\/\1>/g;

  let lastIndex = 0;
  let inlineMatch;

  // Reset regex
  inlineRegex.lastIndex = 0;

  while ((inlineMatch = inlineRegex.exec(html)) !== null) {
    // Add text before this match
    if (inlineMatch.index > lastIndex) {
      const textBefore = html.substring(lastIndex, inlineMatch.index).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      if (textBefore) {
        result.push({ text: textBefore });
      }
    }

    const tag = inlineMatch[1].toLowerCase();
    const attrs = inlineMatch[2] || '';
    const text = inlineMatch[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    if (tag === 'strong' || tag === 'b') {
      result.push({ text, bold: true });
    } else if (tag === 'em' || tag === 'i') {
      result.push({ text, italic: true });
    } else if (tag === 'a') {
      const hrefMatch = attrs.match(/href=["']([^"']*)["']/);
      const href = hrefMatch ? hrefMatch[1] : '';
      result.push({
        type: 'a',
        uid: generateUid(),
        attrs: { url: href, target: '_blank' },
        children: [{ text }]
      });
    }

    lastIndex = inlineMatch.index + inlineMatch[0].length;
  }

  // Add remaining text after last match
  if (lastIndex < html.length) {
    const textAfter = html.substring(lastIndex).replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    if (textAfter) {
      result.push({ text: textAfter });
    }
  }

  return result.length > 0 ? result : [{ text: '' }];
}

let uidCounter = 0;
function generateUid() {
  uidCounter++;
  return `uid_${Date.now()}_${uidCounter}_${Math.random().toString(36).substring(2, 8)}`;
}

// ============================================================================
// Migration Steps
// ============================================================================

async function updateContentTypeSchema() {
  console.log('\n--- Step 1: Update blog_post content type schema ---');

  try {
    const contentType = await stack.contentType('blog_post').fetch();
    const schema = contentType.schema;

    // Find the content field
    const contentFieldIndex = schema.findIndex(f => f.uid === 'content');
    if (contentFieldIndex === -1) {
      console.log('   Content field not found in schema. Skipping schema update.');
      return false;
    }

    const currentField = schema[contentFieldIndex];
    if (currentField.data_type === 'json') {
      console.log('   Content field is already JSON RTE. Skipping schema update.');
      return true;
    }

    console.log(`   Current content field type: ${currentField.data_type}`);
    console.log('   Updating to JSON RTE...');

    // Replace with JSON RTE field
    schema[contentFieldIndex] = {
      display_name: 'Content',
      uid: 'content',
      data_type: 'json',
      field_metadata: {
        allow_json_rte: true,
        rich_text_type: 'advanced',
        multiline: false,
        description: 'Blog post content in JSON Rich Text Editor format'
      },
      format: '',
      error_messages: { format: '' },
      mandatory: false,
      multiple: false,
      non_localizable: false,
      unique: false
    };

    contentType.schema = schema;
    await contentType.update();
    console.log('   Schema updated successfully to JSON RTE.');
    return true;
  } catch (error) {
    console.error('   Error updating schema:', error.message);
    if (error.errors) {
      console.error('   Details:', JSON.stringify(error.errors, null, 2));
    }
    return false;
  }
}

async function migrateEntryContent() {
  console.log('\n--- Step 2: Migrate existing blog post content ---');

  try {
    const response = await stack.contentType('blog_post').entry().query().find();
    const entries = response.items || [];

    console.log(`   Found ${entries.length} blog post entries to migrate.`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const entry of entries) {
      try {
        console.log(`\n   Processing: "${entry.title}" (${entry.uid})`);

        // Fetch full entry
        const fullEntry = await stack.contentType('blog_post').entry(entry.uid).fetch();
        const content = fullEntry.content;

        // Check if already JSON RTE format
        if (content && typeof content === 'object' && content.type === 'doc') {
          console.log('      Already in JSON RTE format. Skipping.');
          skipped++;
          continue;
        }

        // Convert HTML string to JSON RTE
        if (typeof content === 'string' && content.trim()) {
          const jsonRteContent = htmlToJsonRte(content);
          console.log(`      Converted HTML (${content.length} chars) to JSON RTE (${jsonRteContent.children.length} blocks)`);

          fullEntry.content = jsonRteContent;
          await fullEntry.update();
          console.log('      Entry updated.');

          // Republish
          try {
            await fullEntry.publish({
              publishDetails: {
                environments: [stackConfig.environment],
                locales: ['en-us']
              }
            });
            console.log(`      Republished to ${stackConfig.environment}.`);
          } catch (pubErr) {
            console.log(`      Warning: Could not republish: ${pubErr.message}`);
          }

          migrated++;
        } else {
          console.log('      No content to migrate. Skipping.');
          skipped++;
        }

        // Rate limiting
        await sleep(500);
      } catch (entryErr) {
        console.error(`      Error migrating entry ${entry.uid}: ${entryErr.message}`);
        errors++;
      }
    }

    console.log('\n   Migration Summary:');
    console.log(`      Migrated: ${migrated}`);
    console.log(`      Skipped: ${skipped}`);
    console.log(`      Errors: ${errors}`);
  } catch (error) {
    console.error('   Error fetching entries:', error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('\n========================================');
  console.log('Blog Post Migration: HTML -> JSON RTE');
  console.log('========================================\n');

  // Step 1: Update the content type schema
  const schemaUpdated = await updateContentTypeSchema();

  if (!schemaUpdated) {
    console.log('\nSchema update failed or was skipped. Aborting content migration.');
    console.log('If the field is already JSON RTE, you can run the content migration separately.');
    return;
  }

  // Wait for schema update to propagate
  console.log('\n   Waiting for schema changes to propagate...');
  await sleep(3000);

  // Step 2: Migrate existing entry content
  await migrateEntryContent();

  console.log('\n========================================');
  console.log('Migration complete!');
  console.log('========================================\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
