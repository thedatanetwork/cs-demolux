#!/usr/bin/env node

/**
 * Set up a Contentstack Personalize SEGMENTED experience that varies the homepage
 * recommendations rail per audience.
 *
 * Audiences are keyed on the `audience_affinity` user attribute (set by the on-page demo
 * audience switcher). Each variant overrides the inline `recommendations` block on the
 * modular_home_page entry (heading / subheading / lytics_collection) so a wearable-tech fan
 * and a technofurniture fan see a different recommendation experience, while Lytics ranks the
 * actual products inside it.
 *
 * AUTH: the Personalize Management API needs a USER AUTHTOKEN (management tokens are rejected).
 *   Mint one and export it before running:
 *     curl -s -X POST https://api.contentstack.io/v3/user-session \
 *       -H 'Content-Type: application/json' \
 *       -d '{"user":{"email":"you@contentstack.com","password":"********"}}' | jq -r .user.authtoken
 *   export CONTENTSTACK_AUTHTOKEN=<that token>
 *
 * Steps (per the personalize-experiences + personalize-variants skills):
 *   1. Ensure `audience_affinity` custom attribute        (Personalize API)
 *   2. Ensure 2 audiences (wearable-tech, technofurniture) (Personalize API)
 *   3. Ensure SEGMENTED experience + draft version         (Personalize API)
 *   4. Configure version variants -> audiences             (Personalize API)
 *   5. Read _cms.variantGroup + _cms.variants              (Personalize API)
 *   6. Link variant group to modular_home_page             (CMA)
 *   7. Create entry variants overriding the rec block      (CMA)
 *   8. Publish variants                                    (CMA)
 *   9. Activate the experience                             (Personalize API)
 *
 * Idempotent where practical (reuses existing audiences/experience by name).
 * Safe publish: omits the bulk-publish `version` field to publish the latest base version.
 */

require('dotenv').config();

const PERSONALIZE_BASE = process.env.CONTENTSTACK_PERSONALIZE_API || 'https://personalize-api.contentstack.com';
const CMA_BASE = process.env.CONTENTSTACK_CMA_API || 'https://api.contentstack.io/v3';

const cfg = {
  authtoken: process.env.CONTENTSTACK_AUTHTOKEN,
  projectUid:
    process.env.CONTENTSTACK_PERSONALIZE_PROJECT_UID ||
    process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID ||
    '68d6bf935a9840e3f43f276e',
  apiKey: process.env.CONTENTSTACK_API_KEY,
  managementToken: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

const PAGE_CT = 'modular_home_page';
const REC_BLOCK_KEY = 'recommendations';
const ATTR_KEY = 'audience_affinity';

// Per-audience copy for the recommendations rail. lytics_collection can be pointed at a
// topic-specific Lytics collection if one exists; PRODUCTS works as a sensible default.
const AUDIENCES = [
  {
    name: 'Wearable Tech Affinity',
    value: 'wearable-tech',
    variantName: 'Wearables',
    rec: {
      heading: 'Wearables picked for you',
      subheading: 'Smart, wearable tech ranked for your taste',
      lytics_collection: 'PRODUCTS',
    },
  },
  {
    name: 'Technofurniture Affinity',
    value: 'technofurniture',
    variantName: 'Technofurniture',
    rec: {
      heading: 'Furniture to complete your space',
      subheading: 'Technofurniture ranked for your taste',
      lytics_collection: 'PRODUCTS',
    },
  },
];

function preflight() {
  const missing = [];
  if (!cfg.authtoken) missing.push('CONTENTSTACK_AUTHTOKEN (user authtoken — see header of this file)');
  if (!cfg.apiKey) missing.push('CONTENTSTACK_API_KEY');
  if (!cfg.managementToken) missing.push('CONTENTSTACK_MANAGEMENT_TOKEN');
  if (!cfg.projectUid) missing.push('CONTENTSTACK_PERSONALIZE_PROJECT_UID');
  if (missing.length) {
    console.error('\nMissing required configuration:\n  - ' + missing.join('\n  - '));
    console.error('\nThe Personalize Management API needs a USER AUTHTOKEN — see the comment at the');
    console.error('top of this script for how to mint one. Management tokens are rejected by it.');
    process.exit(1);
  }
}

async function px(method, path, body) {
  const res = await fetch(`${PERSONALIZE_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      authtoken: cfg.authtoken,
      'x-project-uid': cfg.projectUid,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) {
    throw new Error(`Personalize ${method} ${path} -> ${res.status}: ${text}`);
  }
  return json;
}

async function cma(method, path, body) {
  const res = await fetch(`${CMA_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      api_key: cfg.apiKey,
      authorization: cfg.managementToken,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) {
    throw new Error(`CMA ${method} ${path} -> ${res.status}: ${text}`);
  }
  return json;
}

async function ensureAttribute() {
  console.log('\n[1] Ensure custom attribute `audience_affinity`');
  const list = await px('GET', '/attributes');
  const items = Array.isArray(list) ? list : list.attributes || list.data || [];
  const found = items.find((a) => a.key === ATTR_KEY || a.uid === ATTR_KEY);
  if (found) {
    console.log(`    ~ exists (${found.uid})`);
    return found.uid;
  }
  const created = await px('POST', '/attributes', {
    name: 'Audience Affinity',
    key: ATTR_KEY,
    description: 'Demo audience affinity set by the on-page audience switcher',
  });
  console.log(`    + created (${created.uid})`);
  return created.uid;
}

async function ensureAudiences(attrUid) {
  console.log('\n[2] Ensure audiences');
  const list = await px('GET', '/audiences');
  const items = Array.isArray(list) ? list : list.audiences || list.data || [];
  const result = [];
  for (const aud of AUDIENCES) {
    let existing = items.find((a) => a.name === aud.name);
    if (existing) {
      console.log(`    ~ ${aud.name} (${existing.uid})`);
      result.push({ ...aud, uid: existing.uid });
      continue;
    }
    const created = await px('POST', '/audiences', {
      name: aud.name,
      description: `Visitors with ${ATTR_KEY} = ${aud.value}`,
      definition: {
        __type: 'RuleCombination',
        combinationType: 'AND',
        rules: [
          {
            __type: 'Rule',
            attribute: { __type: 'CustomAttributeReference', ref: attrUid },
            attributeMatchCondition: 'STRING_EQUALS',
            attributeMatchOptions: { __type: 'StringMatchOptions', value: aud.value },
            invertCondition: false,
          },
        ],
      },
    });
    console.log(`    + ${aud.name} (${created.uid})`);
    result.push({ ...aud, uid: created.uid });
  }
  return result;
}

async function ensureExperience() {
  console.log('\n[3] Ensure SEGMENTED experience');
  const name = 'Homepage Recommendations by Audience';
  const list = await px('GET', '/experiences');
  const items = Array.isArray(list) ? list : list.experiences || list.data || [];
  let exp = items.find((e) => e.name === name);
  if (!exp) {
    exp = await px('POST', '/experiences', {
      name,
      description: 'Varies the homepage recommendations rail per audience.',
      __type: 'SegmentedExperience',
    });
    console.log(`    + created experience (${exp.uid})`);
  } else {
    console.log(`    ~ experience exists (${exp.uid})`);
  }
  const full = await px('GET', `/experiences/${exp.uid}`);
  const version = (full.latestVersion || full.versions?.[0] || full.draftVersion);
  const versionUid = version?.uid || version?._id || full.latestVersionUid;
  if (!versionUid) throw new Error('Could not resolve experience version uid from: ' + JSON.stringify(full).slice(0, 400));
  return { uid: exp.uid, versionUid };
}

function buildVariants(audiences) {
  // One SegmentedVariant per audience.
  return audiences.map((a) => ({
    __type: 'SegmentedVariant',
    name: a.variantName,
    audiences: [a.uid],
    lyticsAudiences: [],
    audienceCombinationType: 'OR',
  }));
}

async function configureVersion(expUid, versionUid, audiences, status) {
  await px('PUT', `/experiences/${expUid}/versions/${versionUid}`, {
    status,
    variants: buildVariants(audiences),
  });
}

async function getCmsMapping(expUid) {
  const full = await px('GET', `/experiences/${expUid}`);
  const cms = full._cms || full.cms;
  if (!cms?.variantGroup || !cms?.variants) {
    throw new Error('Experience _cms mapping not ready: ' + JSON.stringify(full).slice(0, 400));
  }
  return cms; // { variantGroup, variants: { "0": uid, "1": uid } }
}

async function linkVariantGroup(variantGroupUid) {
  console.log('\n[6] Link variant group to modular_home_page');
  await cma('PUT', `/variant_groups/${variantGroupUid}`, {
    name: 'Homepage Recommendations by Audience',
    content_types: [{ uid: PAGE_CT, status: 'linked' }],
  });
  console.log('    + linked');
}

async function getHomeEntry() {
  const list = await cma('GET', `/content_types/${PAGE_CT}/entries`);
  const entry = list.entries?.[0];
  if (!entry) throw new Error('No modular_home_page entry found');
  const full = await cma('GET', `/content_types/${PAGE_CT}/entries/${entry.uid}`);
  return full.entry;
}

// Derive _order entries (base.{blockType}.{uid}) and the rec block's metadata uid.
function analyzeSections(entry) {
  const order = [];
  let recBlockUid = null;
  for (const section of entry.page_sections || []) {
    const blockType = Object.keys(section).find((k) => !k.startsWith('_') && k !== '$');
    if (!blockType) continue;
    const uid = section[blockType]?._metadata?.uid;
    if (!uid) continue;
    order.push(`base.${blockType}.${uid}`);
    if (blockType === REC_BLOCK_KEY) recBlockUid = uid;
  }
  return { order, recBlockUid };
}

async function createEntryVariant(entry, variantUid, recBlockUid, order, rec) {
  const changeSet = [
    `page_sections.${REC_BLOCK_KEY}.${recBlockUid}.heading`,
    `page_sections.${REC_BLOCK_KEY}.${recBlockUid}.subheading`,
    `page_sections.${REC_BLOCK_KEY}.${recBlockUid}.lytics_collection`,
  ];
  const payload = {
    entry: {
      _variant: {
        _uid: variantUid,
        _change_set: changeSet,
        _order: [{ page_sections: order }],
      },
      page_sections: [
        {
          [REC_BLOCK_KEY]: {
            heading: rec.heading,
            subheading: rec.subheading,
            lytics_collection: rec.lytics_collection,
            _metadata: { uid: recBlockUid },
          },
        },
      ],
    },
  };
  await cma('PUT', `/content_types/${PAGE_CT}/entries/${entry.uid}/variants/${variantUid}`, payload);
}

async function publishVariant(entryUid, variantUid) {
  // Omit `version` so the LATEST base version is published (avoids the documented footgun).
  await cma('POST', '/bulk/publish', {
    entries: [
      { uid: entryUid, content_type: PAGE_CT, locale: 'en-us', variant_uid: variantUid },
    ],
    environments: [cfg.environment],
    locales: ['en-us'],
  });
}

async function main() {
  console.log('='.repeat(64));
  console.log('Personalize: Homepage Recommendations by Audience');
  console.log('='.repeat(64));
  preflight();

  const attrUid = await ensureAttribute();
  const audiences = await ensureAudiences(attrUid);
  const { uid: expUid, versionUid } = await ensureExperience();

  console.log('\n[4] Configure version variants (DRAFT)');
  await configureVersion(expUid, versionUid, audiences, 'DRAFT');
  console.log('    + variants configured');

  console.log('\n[5] Read CMS variant mapping');
  const cms = await getCmsMapping(expUid);
  console.log(`    variantGroup=${cms.variantGroup} variants=${JSON.stringify(cms.variants)}`);

  await linkVariantGroup(cms.variantGroup);

  console.log('\n[7] Create entry variants on the homepage');
  const entry = await getHomeEntry();
  const { order, recBlockUid } = analyzeSections(entry);
  if (!recBlockUid) {
    throw new Error('No `recommendations` block found on the homepage. Run create-recommendations-block first.');
  }
  // Map variant shortUid -> audience by order (variant index aligns with configured variants order).
  const variantUidByIndex = Object.keys(cms.variants)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => cms.variants[k]);

  for (let i = 0; i < audiences.length; i++) {
    const variantUid = variantUidByIndex[i];
    await createEntryVariant(entry, variantUid, recBlockUid, order, audiences[i].rec);
    console.log(`    + variant for ${audiences[i].variantName} (${variantUid})`);
    await publishVariant(entry.uid, variantUid);
    console.log('      -> published');
  }

  console.log('\n[9] Activate experience');
  await configureVersion(expUid, versionUid, audiences, 'ACTIVE');
  try {
    await px('PUT', '/experiences-priority', { experiences: [expUid] });
  } catch (e) {
    console.warn('    ! priority set skipped:', e.message);
  }
  console.log('    + active');

  console.log('\n' + '='.repeat(64));
  console.log('Done. Use the on-page "Audience" switcher to preview each variant live.');
  console.log('='.repeat(64));
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    process.exit(1);
  });
}

module.exports = { main };
