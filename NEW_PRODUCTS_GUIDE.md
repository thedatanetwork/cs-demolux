# Adding 8 New Products to Contentstack

This guide provides exact field mappings for adding 8 new products to Contentstack CMS.

## Contentstack Product Content Type Fields

Based on the existing product structure, here are the fields you'll need to fill:

- **Title** (required): Product name
- **URL** (required): `/products/[slug]` format (slug should be lowercase, hyphenated)
- **Description** (required): Short description (1-2 sentences, used on product cards)
- **Detailed Description** (optional): Long description (full product details, shown on product detail page)
- **Featured Image** (required): Product image (upload or select from assets)
- **Price** (required): Number (without $ or commas)
- **Category** (required): Either `wearable-tech` or `technofurniture`
- **Product Tags** (optional): Array of tags (e.g., `smart-home`, `luxury`, `ambient-lighting`)
- **Call to Action** (optional): Not typically used for products

---

## Product 1: LuminFrame™ Ambient Display Mirror

**Category**: `technofurniture`

### Field Mappings:
- **Title**: `LuminFrame™ Ambient Display Mirror`
- **URL**: `/products/luminframe-ambient-display-mirror`
- **Description**: `A frameless smart mirror that blends reflection, ambient lighting, and adaptive digital art into a seamless luxury surface.`
- **Detailed Description**:
```
LuminFrame™ transforms any room into a hybrid space of functionality and immersive digital expression. When inactive, it appears as a flawless frameless mirror with a soft perimeter glow. When activated, it becomes a high-resolution ambient display capable of showing artwork, mood visuals, information overlays, or holographic-style reflections. With gesture controls and voice-adaptive visual sets, it creates a living environment that evolves with you.

Designed for minimalists, design lovers, and interiors that demand tech without visible tech, LuminFrame™ enhances bedrooms, foyers, living rooms, and luxury hospitality spaces.

**Product Details:**
- Dimensions: 46" H × 30" W × 1.1" D
- Materials: Zero-bezel tempered smart glass, brushed aluminum rear chassis
- Display: 4K ambient QLED panel
- Controls: Gesture controls, Bluetooth app, voice assistant integration
- Power: 100–240V; hidden rear power channel
- Color Options: Silver Glass, Soft Bronze, Graphite Smoke
- Warranty: 2-year premium warranty
```
- **Price**: `4299`
- **Product Tags**: `smart-mirror`, `ambient-display`, `luxury`, `minimalist`, `gesture-control`

---

## Product 2: HaloVibe™ Resonance Table

**Category**: `technofurniture`

### Field Mappings:
- **Title**: `HaloVibe™ Resonance Table`
- **URL**: `/products/halovibe-resonance-table`
- **Description**: `A sculptural coffee table with an embedded invisible speaker system that turns the entire surface into a tactile audio experience.`
- **Detailed Description**:
```
HaloVibe™ is a sound system disguised as a piece of luxury furniture. Using distributed resonance drivers beneath its seamless mineral-glass surface, the table produces rich omni-directional sound that radiates evenly throughout the room. Whether used for music, ambiance, or subtle haptic feedback during movies and games, HaloVibe™ redefines how furniture and audio can coexist.

Paired with its circular design and soft under-lighting, it functions as both a centerpiece and an immersive sonic experience.

**Product Details:**
- Dimensions: 39" diameter × 15" H
- Materials: Mineral-infused glass top, titanium base
- Audio: 360° resonance driver system, sub-layer vibration chamber
- Connectivity: Bluetooth 5.3, Wi-Fi, multi-room sync
- Lighting: RGBW ambient under-glow
- Power: 120V plugin (concealed)
- Warranty: 18 months
```
- **Price**: `3599`
- **Product Tags**: `smart-furniture`, `audio`, `resonance`, `luxury`, `ambient-lighting`

---

## Product 3: FluxBand™ Kinetic Wearable Display

**Category**: `wearable-tech`

### Field Mappings:
- **Title**: `FluxBand™ Kinetic Wearable Display`
- **URL**: `/products/fluxband-kinetic-wearable-display`
- **Description**: `A flexible, wraparound wrist display that changes form and function based on motion.`
- **Detailed Description**:
```
FluxBand™ adapts its interface depending on how you move. Bend your wrist to expand notifications, rotate your hand to open kinetic menus, or tap twice to transform the display into a glowing bracelet. With a fluid, edge-less OLED panel and motion-responsive UI, it merges jewelry and wearable tech into a single expressive accessory.

Made for creators, trendsetters, and anyone who wants a wearable that's more art than device.

**Product Details:**
- Display: 2.1" flexible OLED wrap panel
- Materials: Soft graphene band with magnetic clasp
- Sensors: Accelerometer, gyro, temperature, gesture detection
- Battery: Up to 48 hours; rapid magnetic charge
- Connectivity: Bluetooth LE
- Colors: Obsidian, Ice Chrome, Neon Ember
```
- **Price**: `899`
- **Product Tags**: `wearable`, `flexible-display`, `gesture-control`, `kinetic`, `oled`

---

## Product 4: EtherSphere™ Floating Light Orb

**Category**: `technofurniture`

### Field Mappings:
- **Title**: `EtherSphere™ Floating Light Orb`
- **URL**: `/products/ethersphere-floating-light-orb`
- **Description**: `A levitating ambient-light orb that floats above a magnetic base, shifting colors and intensity based on environment.`
- **Detailed Description**:
```
EtherSphere™ is a magical fusion of physics and mood lighting. The orb hovers silently above its base using ultra-stable magnetic levitation, creating the illusion of weightlessness and calm. Its LED core adjusts automatically to natural light, music, or touch, producing ambient colorscapes that gently animate your space.

Perfect for side tables, office desks, meditation rooms, or high-end hospitality displays.

**Product Details:**
- Orb Size: 6" diameter
- Materials: Frosted silica sphere + titanium base
- Lighting: 64-bit RGB core, ambient-adaptive mode
- Controls: Touch interface, Music-sync, App
- Power: USB-C; low-power standby
- Warranty: 1-year
```
- **Price**: `599`
- **Product Tags**: `levitation`, `ambient-lighting`, `magnetic`, `smart-light`, `mood-lighting`

---

## Product 5: AeroSlate™ Smart Wall Panel

**Category**: `technofurniture`

### Field Mappings:
- **Title**: `AeroSlate™ Smart Wall Panel`
- **URL**: `/products/aeroslate-smart-wall-panel`
- **Description**: `A modular ultra-thin smart wall tile that displays art, lighting, notifications, and subtle animations.`
- **Detailed Description**:
```
AeroSlate™ panels turn any wall into a living digital canvas. At just 8mm thick, each tile magnetically snaps into place and connects wirelessly to neighboring tiles, creating an endlessly customizable display surface. Show digital art, soft gradients, dynamic lighting, dashboards, or interactive ambient visuals that respond to movement.

Ideal for statement home walls, modern offices, showrooms, and luxury retail.

**Product Details:**
- Panel Size: 12" × 12" × 8mm
- Display: Matte micro-LED lattice
- Connectivity: Mesh sync up to 24 panels
- Controls: App, gestures, proximity triggers
- Power: 1 hidden base tile + daisy-chain power
- Colors: Arctic White, Shadow Black
```
- **Price**: `399`
- **Product Tags**: `modular`, `wall-panel`, `digital-art`, `smart-display`, `ambient`

---

## Product 6: VeloChair™ Motion-Adaptive Lounge Seat

**Category**: `technofurniture`

### Field Mappings:
- **Title**: `VeloChair™ Motion-Adaptive Lounge Seat`
- **URL**: `/products/velochair-motion-adaptive-lounge-seat`
- **Description**: `A sculpted lounge chair with micro-motors that subtly shift your posture based on movement, relaxation patterns, or media content.`
- **Detailed Description**:
```
VeloChair™ enhances comfort using motion adaptation technology originally pioneered in automotive seating. Its internal micro-actuators subtly adjust lumbar support, tilt, and balance in response to breathing, sitting position, or synced media. Soft ambient lighting and integrated spatial speakers turn any room into an immersive escape.

Both a luxury seating object and a wellness device, VeloChair™ is perfect for unwinding, gaming, reading, or deep-focus work.

**Product Details:**
- Dimensions: 45" H × 32" W × 34" D
- Materials: Soft-tech vegan leather, carbon-fiber frame
- Features: Motion-adaptive support, built-in ambient lights, near-field speakers
- Power: Standard wall plug
- Colors: Cloud White, Onyx Black, Sandstone
- Warranty: 2 years
```
- **Price**: `5499`
- **Product Tags**: `smart-furniture`, `adaptive`, `wellness`, `luxury-seating`, `immersive`

---

## Product 7: PrismFold™ Pocket Hologram Projector

**Category**: `wearable-tech`

### Field Mappings:
- **Title**: `PrismFold™ Pocket Hologram Projector`
- **URL**: `/products/prismfold-pocket-hologram-projector`
- **Description**: `A foldable pocket-sized projector that casts bright holographic-style 3D visuals into mid-air.`
- **Detailed Description**:
```
PrismFold™ is a compact hologram projector engineered for travelers, creatives, and presenters who want big storytelling in a small form. The fold-out refractive wings generate a floating 3D visual field that displays product demos, abstract visuals, or interactive UI elements. It's portable, durable, and compatible with both mobile and desktop workflows.

Great for showrooms, pop-ups, creative studios, education, or futuristic home décor.

**Product Details:**
- Size (folded): 4.5" × 3" × 0.6"
- Projection Field: Up to 24" floating 3D display
- Materials: Titanium hinge system, optical polymer wings
- Connectivity: USB-C, Bluetooth
- Battery: 6 hours runtime
- Warranty: 1 year
```
- **Price**: `1299`
- **Product Tags**: `hologram`, `portable`, `projector`, `3d-display`, `creative-tools`

---

## Product 8: PulseLine™ Interactive Floor Strip

**Category**: `technofurniture`

### Field Mappings:
- **Title**: `PulseLine™ Interactive Floor Strip`
- **URL**: `/products/pulseline-interactive-floor-strip`
- **Description**: `A motion-sensitive LED floor strip that responds to footsteps with ripples, gradients, or animated light trails.`
- **Detailed Description**:
```
PulseLine™ transforms walkways into living paths of light. This ultra-durable, pressure-sensitive LED strip responds instantly to movement, creating visual trails and ripples that follow each step. Perfect for hallways, event spaces, creative studios, or luxury retail, it blends function, safety lighting, and immersive design.

Fully waterproof and designed to be walked on, PulseLine™ elevates every step into a moment of interaction.

**Product Details:**
- Length: 4ft, 6ft, and 8ft options
- Materials: Industrial-grade flexible polymer
- Lighting: High-density RGBW LED matrix
- Features: Motion + pressure detection, pattern customization, app control
- Durability: Waterproof (IP67)
- Warranty: 18 months
```
- **Price**: `799`
- **Product Tags**: `interactive`, `floor-lighting`, `motion-sensor`, `led`, `installation`

---

## Summary

### Products by Category:

**Wearable-Tech** (2 products):
1. FluxBand™ Kinetic Wearable Display - $899
2. PrismFold™ Pocket Hologram Projector - $1,299

**Technofurniture** (6 products):
1. LuminFrame™ Ambient Display Mirror - $4,299
2. HaloVibe™ Resonance Table - $3,599
3. EtherSphere™ Floating Light Orb - $599
4. AeroSlate™ Smart Wall Panel - $399
5. VeloChair™ Motion-Adaptive Lounge Seat - $5,499
6. PulseLine™ Interactive Floor Strip - $799

---

## Steps to Add Each Product in Contentstack:

1. Log into your Contentstack account
2. Navigate to **Entries** > **Product** content type
3. Click **+ New Entry**
4. Fill in all the fields using the mappings above
5. **Important**: For the URL field, use the exact format: `/products/[slug]`
6. Upload or select a featured image (you'll need to create/source images for these products)
7. Click **Save** and then **Publish**
8. Repeat for all 8 products

Once published, the products will automatically appear on the site:
- Homepage (featured products section)
- Category pages (`/categories/wearable-tech` or `/categories/technofurniture`)
- Individual product pages (`/products/[slug]`)
- Search results

---

## Note on Images

You'll need to upload or generate product images for each of these 8 products. The images should be:
- High quality (at least 1200x1200px)
- Transparent or clean background
- Consistent style with existing products
- Format: PNG or JPG

The site will automatically handle image optimization and responsive sizing.
