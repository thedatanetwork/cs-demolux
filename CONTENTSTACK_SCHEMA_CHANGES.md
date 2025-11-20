# Contentstack Schema Changes for Multiple Product Images

## Overview
This document outlines the changes needed in Contentstack CMS to support multiple images per product.

## Changes Required

### Product Content Type

You need to add a new field to the **Product** content type in Contentstack:

#### New Field: `additional_images`

**Field Configuration:**
- **Display Name:** Additional Images
- **Field UID:** `additional_images`
- **Data Type:** File (multiple)
- **Multiple:** Yes (allows multiple file uploads)
- **Mandatory:** No (optional field)
- **Help Text:** Upload additional product images. These will be displayed in the product gallery and cycled through on hover in product listings.

**File Settings:**
- **Allowed File Types:** Images only (png, jpg, jpeg, webp, gif)
- **Maximum File Size:** As per your requirements (suggested: 5MB per image)
- **Dimension Limits:** Optional (suggested minimum: 800x800px for quality)

## Current vs New Structure

### Current Structure
```
Product Content Type:
├── uid (UID)
├── title (Single Line Textbox)
├── url (Single Line Textbox)
├── description (Multi Line Textbox)
├── detailed_description (Rich Text Editor)
├── featured_image (File - single/multiple) ← Currently used
├── price (Number)
├── category (Single Line Textbox)
└── product_tags (Tags)
```

### New Structure
```
Product Content Type:
├── uid (UID)
├── title (Single Line Textbox)
├── url (Single Line Textbox)
├── description (Multi Line Textbox)
├── detailed_description (Rich Text Editor)
├── featured_image (File - single/multiple) ← Main product image
├── additional_images (File - multiple) ← NEW: Additional gallery images
├── price (Number)
├── category (Single Line Textbox)
└── product_tags (Tags)
```

## How Images Will Be Used

### `featured_image`
- Primary product image shown by default
- Used in search results, category listings, and social shares
- Should be the hero/main product shot

### `additional_images`
- Supplementary product images (different angles, details, lifestyle shots)
- Displayed in product detail page gallery
- Cycled through on hover in product listing cards
- Can have 0 to unlimited additional images

## Steps to Implement in Contentstack

1. **Log in to Contentstack Dashboard**
2. **Navigate to Content Models** → Select **Product** content type
3. **Add New Field:**
   - Click "Add Field"
   - Select "File" field type
   - Configure as specified above
   - Enable "Multiple" option
   - Set UID as `additional_images`
4. **Save the Content Type**
5. **Update Existing Products:**
   - Open existing product entries
   - Add additional images to the new field
   - Save and publish

## Best Practices

### Image Guidelines
- **Featured Image:** Best representative shot of the product (front view, neutral background)
- **Additional Images:**
  - Multiple angles (side, back, top)
  - Close-up detail shots
  - Product in use / lifestyle contexts
  - Size/scale comparisons
  - Feature highlights

### Recommended Image Count
- Minimum: 1 featured image (required)
- Recommended additional: 3-5 images
- Maximum: No hard limit, but 8-10 is reasonable for performance

### Image Specs
- Resolution: Minimum 1200x1200px
- Aspect Ratio: Square (1:1) preferred for consistency
- Format: JPEG or WebP for web optimization
- File Size: < 500KB per image (after compression)

## After Schema Update

Once you've made these changes in Contentstack, the development team will:
1. Update TypeScript interfaces to include `additional_images`
2. Update the Contentstack SDK to fetch additional images
3. Implement hover-to-cycle functionality in product cards
4. Create an interactive gallery component for product detail pages

## Testing

After implementation, test with:
- Products with 0 additional images (should work with just featured image)
- Products with 1 additional image
- Products with 5+ additional images
- Different image aspect ratios
