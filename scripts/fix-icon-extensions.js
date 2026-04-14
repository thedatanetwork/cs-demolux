/**
 * fix-icon-extensions.js
 *
 * Dynamically discovers the Lucide React Icon Selector marketplace app
 * and converts ALL plain-text "icon" fields across every content type
 * to use its custom field extension.
 *
 * The extension UID changes each time the marketplace app is updated,
 * so we look it up by app_uid + type:"field" instead of hardcoding it.
 *
 * Usage:  cd scripts && node fix-icon-extensions.js
 */
require('dotenv').config();
const https = require('https');

const API_KEY = process.env.CONTENTSTACK_API_KEY;
const MGMT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
const HOST = 'api.contentstack.io';

// Lucide React Icon Selector marketplace app UID (stable across versions)
const ICON_APP_UID = '695c09e858e346566e1a3ddd';

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      path,
      method,
      headers: {
        api_key: API_KEY,
        authorization: MGMT_TOKEN,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          reject(new Error(`Non-JSON response (${res.statusCode}): ${data.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Discover the current extension_uid for the icon picker app.
 * Searches installed extensions for the one matching our app_uid with type "field".
 */
async function findIconExtensionUid() {
  const res = await apiRequest('GET', '/v3/extensions?include_marketplace_extensions=true');
  const extensions = res.body.extensions || [];
  const iconExt = extensions.find(
    (ext) => ext.app_uid === ICON_APP_UID && ext.type === 'field'
  );
  if (!iconExt) {
    throw new Error(
      'Lucide React Icon Selector app not found. ' +
      'Install it from the Contentstack Marketplace first.'
    );
  }
  return iconExt.uid;
}

/**
 * Recursively walk a content type schema and convert any plain-text
 * "icon" field to use the marketplace extension.
 * Returns the number of fields converted.
 */
function convertIconFields(schema, extensionUid, path) {
  let count = 0;
  for (let i = 0; i < schema.length; i++) {
    const field = schema[i];
    const fieldPath = path ? `${path}.${field.uid}` : field.uid;

    // Match: uid is "icon" or "badge_icon", data_type text,
    // either not yet an extension OR pointing at a stale/wrong extension UID
    if (
      (field.uid === 'icon' || field.uid === 'badge_icon') &&
      field.data_type === 'text' &&
      field.extension_uid !== extensionUid
    ) {
      console.log(`  Converting: ${fieldPath}`);
      schema[i] = {
        display_name: field.display_name || 'Icon',
        extension_uid: extensionUid,
        field_metadata: { extension: true },
        uid: field.uid,
        mandatory: field.mandatory || false,
        non_localizable: field.non_localizable || false,
        unique: false,
        config: {},
        data_type: 'text',
        multiple: false,
      };
      count++;
    }

    // Recurse into group fields
    if (field.schema && Array.isArray(field.schema)) {
      count += convertIconFields(field.schema, extensionUid, fieldPath);
    }

    // Recurse into modular block definitions
    if (field.blocks && Array.isArray(field.blocks)) {
      for (const block of field.blocks) {
        if (block.schema && Array.isArray(block.schema)) {
          count += convertIconFields(block.schema, extensionUid, `${fieldPath}[${block.uid}]`);
        }
      }
    }

    // Recurse into global fields
    if (field.data_type === 'global_field' && field.schema && Array.isArray(field.schema)) {
      count += convertIconFields(field.schema, extensionUid, fieldPath);
    }
  }
  return count;
}

async function main() {
  console.log('Looking up Lucide React Icon Selector extension...');
  const extensionUid = await findIconExtensionUid();
  console.log(`Found extension UID: ${extensionUid}\n`);

  // Fetch all content types
  const ctRes = await apiRequest('GET', '/v3/content_types?include_count=true&limit=100');
  const contentTypes = ctRes.body.content_types || [];
  console.log(`Scanning ${contentTypes.length} content types...\n`);

  let totalConverted = 0;

  for (const ct of contentTypes) {
    // Fetch full schema
    const fullRes = await apiRequest('GET', `/v3/content_types/${ct.uid}`);
    const fullCt = fullRes.body.content_type;
    if (!fullCt || !fullCt.schema) continue;

    const converted = convertIconFields(fullCt.schema, extensionUid, '');
    if (converted > 0) {
      console.log(`  => Updating ${fullCt.uid} (${converted} field(s))...`);
      const updateRes = await apiRequest('PUT', `/v3/content_types/${fullCt.uid}`, {
        content_type: { schema: fullCt.schema },
      });
      if (updateRes.status >= 400) {
        console.error(`  ERROR updating ${fullCt.uid}:`, JSON.stringify(updateRes.body.errors || updateRes.body.error_message));
      } else {
        console.log(`  => Updated successfully.`);
        totalConverted += converted;
      }
    }
  }

  console.log(`\nDone. Converted ${totalConverted} icon field(s) across all content types.`);
  if (totalConverted === 0) {
    console.log('All icon fields already use the extension, or no icon fields found.');
  }
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
