// ============================================================================
// REFERENCE DATA - Simulates Contentstack reference content types
// These would be separate content types in the customer's stack:
//   - discount_types
//   - product_categories
//   - product_brands
//   - product_tags
//   - technology_types (equivalent to customer's product_strains)
// ============================================================================

export interface ReferenceEntry {
  uid: string;
  title: string;
  description?: string;
}

// ============================================================================
// DISCOUNT TYPES (customer: discount_types)
// ============================================================================
export const discountTypes: ReferenceEntry[] = [
  { uid: 'dt-seasonal', title: 'Seasonal Sale', description: 'Limited-time seasonal promotion' },
  { uid: 'dt-clearance', title: 'Clearance', description: 'End-of-line clearance pricing' },
  { uid: 'dt-bundle', title: 'Bundle Deal', description: 'Multi-product bundle discount' },
  { uid: 'dt-member', title: 'Member Exclusive', description: 'Members-only pricing' },
  { uid: 'dt-launch', title: 'Launch Special', description: 'New product launch discount' },
  { uid: 'dt-flash', title: 'Flash Sale', description: '24-hour flash sale' },
];

// ============================================================================
// PRODUCT CATEGORIES (customer: product_categories)
// ============================================================================
export const productCategories: ReferenceEntry[] = [
  { uid: 'cat-wearable', title: 'Wearable Tech', description: 'Smart wearable devices and accessories' },
  { uid: 'cat-furniture', title: 'Technofurniture', description: 'Smart furniture with integrated technology' },
  { uid: 'cat-smarthome', title: 'Smart Home', description: 'Connected home devices and systems' },
  { uid: 'cat-audio', title: 'Audio', description: 'Premium audio equipment and accessories' },
  { uid: 'cat-wellness', title: 'Wellness Tech', description: 'Health and wellness technology products' },
];

// ============================================================================
// PRODUCT BRANDS (customer: product_brands)
// ============================================================================
export const productBrands: ReferenceEntry[] = [
  { uid: 'brand-aetherwear', title: 'AetherWear', description: 'Premium wearable technology' },
  { uid: 'brand-luxframe', title: 'LuxFrame', description: 'Smart eyewear and optical tech' },
  { uid: 'brand-terraform', title: 'TerraForm', description: 'Intelligent furniture design' },
  { uid: 'brand-novasonic', title: 'NovaSonic', description: 'Next-generation audio' },
  { uid: 'brand-cirrushome', title: 'CirrusHome', description: 'Connected home ecosystems' },
  { uid: 'brand-voltalife', title: 'VoltaLife', description: 'Wellness-focused technology' },
  { uid: 'brand-arclight', title: 'ArcLight', description: 'Ambient lighting and atmosphere' },
  { uid: 'brand-zenithlabs', title: 'Zenith Labs', description: 'Experimental tech accessories' },
];

// ============================================================================
// PRODUCT TAGS (customer: product_tags)
// ============================================================================
export const productTags: ReferenceEntry[] = [
  { uid: 'tag-wireless', title: 'Wireless' },
  { uid: 'tag-bluetooth', title: 'Bluetooth' },
  { uid: 'tag-sustainable', title: 'Sustainable' },
  { uid: 'tag-limited', title: 'Limited Edition' },
  { uid: 'tag-bestseller', title: 'Bestseller' },
  { uid: 'tag-new', title: 'New Arrival' },
  { uid: 'tag-premium', title: 'Premium Materials' },
  { uid: 'tag-handcrafted', title: 'Handcrafted' },
  { uid: 'tag-waterproof', title: 'Water Resistant' },
  { uid: 'tag-noisecancelling', title: 'Noise Cancelling' },
  { uid: 'tag-gesture', title: 'Gesture Control' },
  { uid: 'tag-ambient', title: 'Ambient Sensing' },
  { uid: 'tag-modular', title: 'Modular' },
  { uid: 'tag-carbon', title: 'Carbon Fiber' },
  { uid: 'tag-titanium', title: 'Titanium' },
  { uid: 'tag-ai', title: 'AI-Powered' },
  { uid: 'tag-voice', title: 'Voice Control' },
  { uid: 'tag-solar', title: 'Solar Powered' },
  { uid: 'tag-biometric', title: 'Biometric' },
];

// ============================================================================
// TECHNOLOGY TYPES (customer: product_strains)
// Equivalent concept: strain type -> technology paradigm
// ============================================================================
export const technologyTypes: ReferenceEntry[] = [
  { uid: 'tech-ai', title: 'AI-Enhanced', description: 'Machine learning and artificial intelligence' },
  { uid: 'tech-iot', title: 'IoT-Connected', description: 'Internet of Things integration' },
  { uid: 'tech-arvr', title: 'AR/VR-Enabled', description: 'Augmented or virtual reality features' },
  { uid: 'tech-haptic', title: 'Haptic Feedback', description: 'Tactile feedback technology' },
  { uid: 'tech-biometric', title: 'Biometric Sensing', description: 'Health and biometric monitoring' },
  { uid: 'tech-voice', title: 'Voice-Controlled', description: 'Voice assistant integration' },
  { uid: 'tech-solar', title: 'Solar-Powered', description: 'Solar energy harvesting' },
  { uid: 'tech-neural', title: 'Neural Interface', description: 'Brain-computer interface technology' },
];

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

export function findReferenceByUid(entries: ReferenceEntry[], uid: string): ReferenceEntry | undefined {
  return entries.find(e => e.uid === uid);
}

export function findReferencesByUids(entries: ReferenceEntry[], uids: string[]): ReferenceEntry[] {
  return entries.filter(e => uids.includes(e.uid));
}

export function getReferenceTitle(entries: ReferenceEntry[], uid: string): string {
  return findReferenceByUid(entries, uid)?.title || uid;
}
