# Deploying Lytics Event Tracking via Google Tag Manager

This guide explains how to send events to Lytics via Google Tag Manager (GTM) instead of directly from code. This approach provides a tag management layer that allows marketers to modify tracking without code changes.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [GTM Container Setup](#gtm-container-setup)
3. [Data Layer Configuration](#data-layer-configuration)
4. [Events Reference](#events-reference)
5. [Creating GTM Tags](#creating-gtm-tags)
6. [Creating GTM Triggers](#creating-gtm-triggers)
7. [Creating GTM Variables](#creating-gtm-variables)
8. [Lytics Tag Configuration](#lytics-tag-configuration)
9. [User Identification](#user-identification)
10. [Testing & Debugging](#testing--debugging)
11. [Deployment Checklist](#deployment-checklist)

---

## Prerequisites

Before implementing GTM-based Lytics tracking:

1. **Lytics Account**: Active Lytics account with access to your Account ID (AID) and Data Stream ID
2. **GTM Account**: Google Tag Manager account with a container for your website
3. **GTM Container Access**: Edit permissions for the GTM container
4. **Website Access**: Ability to add the GTM snippet to your site's `<head>` tag

---

## GTM Container Setup

### Step 1: Enable GTM via Environment Variable

The GTM container is **already integrated** into the Demolux site and loads conditionally based on an environment variable. This allows you to demonstrate both tracking approaches:

- **Without GTM**: Direct Lytics tracking via code (default)
- **With GTM**: Lytics tracking via Google Tag Manager

To enable GTM, add the following to your `.env.local` file:

```bash
# Google Tag Manager
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-MQG24VX6
```

Replace `GTM-MQG24VX6` with your actual GTM container ID.

**How it works**: When `NEXT_PUBLIC_GTM_CONTAINER_ID` is set, the site automatically:
1. Loads the GTM script in the `<head>`
2. Adds the GTM noscript iframe in the `<body>`
3. **Disables direct Lytics tracking** (jstag is not loaded)
4. **Pushes all events to `dataLayer`** instead of sending to Lytics directly

When the variable is **not set**:
- GTM is not loaded
- Lytics jstag loads directly
- Events are sent to Lytics via `jstag.send()`

This means you only need to configure GTM tags to forward dataLayer events to Lytics - **the site already pushes all events to dataLayer when GTM mode is enabled**.

### Step 2: Data Layer Auto-Initialization

The data layer is automatically initialized by the application code. You do not need to add any initialization scripts - the tracking utilities handle this when pushing events.

---

## Data Layer Configuration

The data layer is how your website communicates with GTM. Events are pushed to the data layer, and GTM triggers fire based on those events.

**Important**: When GTM mode is enabled (`NEXT_PUBLIC_GTM_CONTAINER_ID` is set), the Demolux site **automatically pushes all events to `dataLayer`**. You do not need to modify any application code - just configure GTM tags to listen for these events and forward them to Lytics.

### Data Layer Push Pattern

All events follow this pattern (automatically handled by the app):

```javascript
window.dataLayer.push({
  event: 'event_name',
  // Event-specific parameters
  param1: 'value1',
  param2: 'value2',
  // Page context (automatically added)
  page_url: 'https://...',
  page_path: '/products/...',
  timestamp: '2024-01-15T10:30:00.000Z'
});
```

---

## Events Reference

Below are all the events currently tracked in Demolux, with their data layer specifications.

### Page View Events

**Event: `pageView`**

Triggered on every page load and SPA route change.

```javascript
window.dataLayer.push({
  event: 'pageView',
  page_url: window.location.href,
  page_title: document.title,
  page_path: window.location.pathname,
  page_referrer: document.referrer
});
```

### Product Events

**Event: `add_to_cart`**

Triggered when a user adds a product to their cart.

```javascript
window.dataLayer.push({
  event: 'add_to_cart',
  product_id: 'blt123abc',
  product_title: 'Quantum Neural Headset',
  product_price: 2499.99,
  product_category: 'wearable-tech',
  quantity: 1,
  cart_item_count: 3,
  cart_total_value: 5499.97
});
```

**Event: `buy_now`**

Triggered when a user clicks "Buy Now" to proceed directly to checkout.

```javascript
window.dataLayer.push({
  event: 'buy_now',
  product_id: 'blt123abc',
  product_title: 'Quantum Neural Headset',
  product_price: 2499.99,
  product_category: 'wearable-tech',
  quantity: 1,
  cart_item_count: 1,
  cart_total_value: 2499.99
});
```

**Event: `favorite`**

Triggered when a user favorites/unfavorites a product.

```javascript
window.dataLayer.push({
  event: 'favorite',
  product_id: 'blt123abc',
  product_title: 'Quantum Neural Headset',
  product_price: 2499.99,
  product_category: 'wearable-tech',
  action: 'add' // or 'remove'
});
```

**Event: `share`**

Triggered when a user shares a product.

```javascript
window.dataLayer.push({
  event: 'share',
  product_id: 'blt123abc',
  product_title: 'Quantum Neural Headset',
  product_price: 2499.99,
  product_category: 'wearable-tech',
  platform: 'twitter' // or 'facebook', 'linkedin', 'email', 'copy_link'
});
```

### Cart Events

**Event: `cart_quantity_change`**

Triggered when a user changes the quantity of an item in the cart.

```javascript
window.dataLayer.push({
  event: 'cart_quantity_change',
  product_id: 'blt123abc',
  product_title: 'Quantum Neural Headset',
  old_quantity: 1,
  new_quantity: 2
});
```

**Event: `cart_remove_item`**

Triggered when a user removes an item from the cart.

```javascript
window.dataLayer.push({
  event: 'cart_remove_item',
  product_id: 'blt123abc',
  product_title: 'Quantum Neural Headset',
  product_price: 2499.99,
  product_category: 'wearable-tech',
  quantity: 1
});
```

**Event: `cart_clear`**

Triggered when a user clears their entire cart.

```javascript
window.dataLayer.push({
  event: 'cart_clear',
  items_count: 3,
  cart_total: 5499.97
});
```

**Event: `proceed_to_checkout`**

Triggered when a user clicks "Proceed to Checkout" from the cart.

```javascript
window.dataLayer.push({
  event: 'proceed_to_checkout',
  items_count: 2,
  cart_total: 4999.98,
  items: [
    {
      product_id: 'blt123abc',
      product_title: 'Quantum Neural Headset',
      quantity: 1,
      price: 2499.99
    },
    {
      product_id: 'blt456def',
      product_title: 'Holographic Display Table',
      quantity: 1,
      price: 2499.99
    }
  ]
});
```

### Checkout Events

**Event: `checkout_step_completed`**

Triggered when a user completes a checkout step.

```javascript
// Shipping step completed
window.dataLayer.push({
  event: 'checkout_step_completed',
  step: 'shipping',
  step_number: 1,
  email_provided: true,
  items_count: 2,
  cart_total: 4999.98
});

// Payment step completed
window.dataLayer.push({
  event: 'checkout_step_completed',
  step: 'payment',
  step_number: 2,
  items_count: 2,
  cart_total: 4999.98,
  demo_mode: true
});
```

### Search Events

**Event: `search`**

Triggered when a user performs a search.

```javascript
window.dataLayer.push({
  event: 'search',
  search_query: 'neural headset',
  search_results_count: 5,
  search_type: 'product_search'
});
```

**Event: `search_click`**

Triggered when a user clicks a search result.

```javascript
window.dataLayer.push({
  event: 'search_click',
  search_query: 'neural headset',
  product_id: 'blt123abc',
  product_title: 'Quantum Neural Headset',
  product_category: 'wearable-tech',
  product_price: 2499.99,
  search_results_count: 5,
  click_context: 'search_results'
});
```

### Form Events

**Event: `form_field_interaction`**

Triggered when a user interacts with a form field.

```javascript
window.dataLayer.push({
  event: 'form_field_interaction',
  form_type: 'contact_form',
  field_name: 'email',
  field_length: 25
});
```

**Event: `form_submit`**

Triggered when a user submits a form.

```javascript
window.dataLayer.push({
  event: 'form_submit',
  form_type: 'contact_form',
  subject: 'Product Inquiry',
  message_length: 150
});
```

### User Identification

**Event: `identify_user`**

Triggered when a user provides their email (e.g., at checkout or form submission).

```javascript
window.dataLayer.push({
  event: 'identify_user',
  email: 'user@example.com'
});
```

---

## Creating GTM Variables

Create the following Data Layer Variables in GTM to capture event parameters.

### Step 1: Navigate to Variables

1. In GTM, go to **Variables** in the left sidebar
2. Under **User-Defined Variables**, click **New**

### Step 2: Create Data Layer Variables

Create a variable for each parameter you want to capture:

| Variable Name | Variable Type | Data Layer Variable Name |
|--------------|---------------|-------------------------|
| DLV - product_id | Data Layer Variable | product_id |
| DLV - product_title | Data Layer Variable | product_title |
| DLV - product_price | Data Layer Variable | product_price |
| DLV - product_category | Data Layer Variable | product_category |
| DLV - quantity | Data Layer Variable | quantity |
| DLV - cart_item_count | Data Layer Variable | cart_item_count |
| DLV - cart_total_value | Data Layer Variable | cart_total_value |
| DLV - cart_total | Data Layer Variable | cart_total |
| DLV - items_count | Data Layer Variable | items_count |
| DLV - items | Data Layer Variable | items |
| DLV - action | Data Layer Variable | action |
| DLV - platform | Data Layer Variable | platform |
| DLV - old_quantity | Data Layer Variable | old_quantity |
| DLV - new_quantity | Data Layer Variable | new_quantity |
| DLV - step | Data Layer Variable | step |
| DLV - step_number | Data Layer Variable | step_number |
| DLV - email_provided | Data Layer Variable | email_provided |
| DLV - search_query | Data Layer Variable | search_query |
| DLV - search_results_count | Data Layer Variable | search_results_count |
| DLV - search_type | Data Layer Variable | search_type |
| DLV - click_context | Data Layer Variable | click_context |
| DLV - form_type | Data Layer Variable | form_type |
| DLV - field_name | Data Layer Variable | field_name |
| DLV - field_length | Data Layer Variable | field_length |
| DLV - subject | Data Layer Variable | subject |
| DLV - message_length | Data Layer Variable | message_length |
| DLV - email | Data Layer Variable | email |
| DLV - page_url | Data Layer Variable | page_url |
| DLV - page_title | Data Layer Variable | page_title |
| DLV - page_path | Data Layer Variable | page_path |
| DLV - page_referrer | Data Layer Variable | page_referrer |

### Step 3: Create Built-in Variables

Enable these built-in variables if not already enabled:

1. Go to **Variables** > **Configure**
2. Enable:
   - **Event** (under Pages)
   - **Page URL**
   - **Page Path**
   - **Referrer**

---

## Creating GTM Triggers

Create triggers for each event type.

### Step 1: Navigate to Triggers

1. In GTM, go to **Triggers** in the left sidebar
2. Click **New**

### Step 2: Create Custom Event Triggers

Create a trigger for each event:

| Trigger Name | Trigger Type | Event Name |
|-------------|--------------|------------|
| CE - pageView | Custom Event | pageView |
| CE - add_to_cart | Custom Event | add_to_cart |
| CE - buy_now | Custom Event | buy_now |
| CE - favorite | Custom Event | favorite |
| CE - share | Custom Event | share |
| CE - cart_quantity_change | Custom Event | cart_quantity_change |
| CE - cart_remove_item | Custom Event | cart_remove_item |
| CE - cart_clear | Custom Event | cart_clear |
| CE - proceed_to_checkout | Custom Event | proceed_to_checkout |
| CE - checkout_step_completed | Custom Event | checkout_step_completed |
| CE - search | Custom Event | search |
| CE - search_click | Custom Event | search_click |
| CE - form_field_interaction | Custom Event | form_field_interaction |
| CE - form_submit | Custom Event | form_submit |
| CE - identify_user | Custom Event | identify_user |

For each trigger:
1. Choose **Custom Event** as the trigger type
2. Enter the event name exactly as shown above
3. Set "This trigger fires on" to **All Custom Events**
4. Save

---

## Lytics Tag Configuration

### Step 1: Add Lytics Base Tag

Create a tag to load the Lytics JavaScript SDK.

1. Go to **Tags** > **New**
2. Name: `Lytics - Base Tag`
3. Tag Type: **Custom HTML**
4. HTML:

```html
<script type="text/javascript">
  !function(){"use strict";var o=window.jstag||(window.jstag={}),r=[];function n(e){o[e]=function(){for(var n=arguments.length,t=new Array(n),i=0;i<n;i++)t[i]=arguments[i];r.push([e,t])}}n("send"),n("mock"),n("identify"),n("pageView"),n("unblock"),n("getid"),n("setid"),n("loadEntity"),n("getEntity"),n("on"),n("once"),n("call"),o.loadScript=function(n,t,i){var e=document.createElement("script");e.async=!0,e.src=n,e.onload=t,e.onerror=i;var o=document.getElementsByTagName("script")[0],r=o&&o.parentNode||document.head||document.body,c=o||r.lastChild;return null!=c?r.insertBefore(e,c):r.appendChild(e),this},o.init=function n(t){return this.config=t,this.loadScript(t.src,function(){if(o.init===n)throw new Error("Load error!");o.init(o.config),function(){for(var n=0;n<r.length;n++){var t=r[n][0],i=r[n][1];o[t].apply(o,i)}r=void 0}()}),this}}();

  // Initialize with your Lytics account
  jstag.init({
    src: 'https://c.lytics.io/api/tag/YOUR_LYTICS_AID/latest.min.js',
    pageAnalysis: {
      dataLayerPull: {
        disabled: true // We'll send events manually via GTM
      }
    }
  });
</script>
```

5. Replace `YOUR_LYTICS_AID` with your Lytics Account ID
6. Triggering: **All Pages** (Page View trigger)
7. Under **Advanced Settings** > **Tag firing options**: Select **Once per page**
8. Save

### Step 2: Create Lytics Event Tags

Create a tag for each event type. Below are examples for the main events.

#### Tag: Lytics - Page View

1. Tag Type: **Custom HTML**
2. HTML:

```html
<script>
  if (window.jstag) {
    jstag.pageView();
  }
</script>
```

3. Triggering: **CE - pageView**
4. Under **Advanced Settings** > **Tag Sequencing**: Check "Fire a tag before this tag fires" and select `Lytics - Base Tag`

#### Tag: Lytics - Add to Cart

1. Tag Type: **Custom HTML**
2. HTML:

```html
<script>
  if (window.jstag) {
    jstag.send({
      stream: 'web_events',
      data: {
        event_type: 'add_to_cart',
        product_id: {{DLV - product_id}},
        product_title: {{DLV - product_title}},
        product_price: {{DLV - product_price}},
        product_category: {{DLV - product_category}},
        quantity: {{DLV - quantity}},
        cart_item_count: {{DLV - cart_item_count}},
        cart_total_value: {{DLV - cart_total_value}},
        page_url: {{Page URL}},
        page_path: {{Page Path}},
        timestamp: new Date().toISOString()
      }
    });
  }
</script>
```

3. Triggering: **CE - add_to_cart**
4. Tag Sequencing: Ensure `Lytics - Base Tag` fires first

#### Tag: Lytics - Search

1. Tag Type: **Custom HTML**
2. HTML:

```html
<script>
  if (window.jstag) {
    jstag.send({
      stream: 'web_events',
      data: {
        event_type: 'search',
        search_query: {{DLV - search_query}},
        search_results_count: {{DLV - search_results_count}},
        search_type: {{DLV - search_type}},
        page_url: {{Page URL}},
        page_path: {{Page Path}},
        timestamp: new Date().toISOString()
      }
    });
  }
</script>
```

3. Triggering: **CE - search**

#### Tag: Lytics - Checkout Step

1. Tag Type: **Custom HTML**
2. HTML:

```html
<script>
  if (window.jstag) {
    jstag.send({
      stream: 'web_events',
      data: {
        event_type: 'checkout_step_completed',
        step: {{DLV - step}},
        step_number: {{DLV - step_number}},
        email_provided: {{DLV - email_provided}},
        items_count: {{DLV - items_count}},
        cart_total: {{DLV - cart_total}},
        page_url: {{Page URL}},
        timestamp: new Date().toISOString()
      }
    });
  }
</script>
```

3. Triggering: **CE - checkout_step_completed**

### Step 3: Repeat for All Events

Create similar tags for all remaining events:

- `buy_now`
- `favorite`
- `share`
- `cart_quantity_change`
- `cart_remove_item`
- `cart_clear`
- `proceed_to_checkout`
- `search_click`
- `form_field_interaction`
- `form_submit`

Each tag should:
1. Use Custom HTML tag type
2. Check for `window.jstag` before calling
3. Call `jstag.send()` with appropriate parameters
4. Fire on the corresponding custom event trigger
5. Have tag sequencing to ensure base tag fires first

---

## User Identification

User identification links anonymous browsing data to known users.

### Tag: Lytics - Identify User

1. Tag Type: **Custom HTML**
2. HTML:

```html
<script>
  if (window.jstag && {{DLV - email}}) {
    jstag.identify({
      email: {{DLV - email}}
    });
    console.log('Lytics: User identified with email');
  }
</script>
```

3. Triggering: **CE - identify_user**

### When to Push identify_user

Push the `identify_user` event when you capture an email:

- Checkout shipping form submission
- Contact form submission
- Newsletter signup
- Account login

---

## Testing & Debugging

### Step 1: Use GTM Preview Mode

1. In GTM, click **Preview** in the top right
2. Enter your website URL
3. GTM Debug panel will open alongside your site

### Step 2: Verify Data Layer Pushes

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Type `dataLayer` and press Enter
4. Verify events are being pushed with correct data

### Step 3: Verify Tags Firing

In GTM Preview mode:
1. Perform actions (add to cart, search, etc.)
2. Check the **Tags** tab to see which tags fired
3. Check the **Data Layer** tab to see pushed events

### Step 4: Verify Lytics Receiving Data

1. Log into Lytics
2. Go to **Data** > **Stream**
3. Filter by your data stream
4. Verify events are appearing with correct parameters

### Debugging Tips

- If tags aren't firing, check trigger configuration
- If data is missing, verify variable names match data layer keys exactly
- If Lytics isn't receiving data, check:
  - Account ID is correct
  - `jstag` is loading (check Network tab for lytics.io requests)
  - No JavaScript errors in console

---

## Deployment Checklist

Before publishing your GTM container to production:

- [ ] **Base Tag**: Lytics base tag loads on all pages
- [ ] **Variables**: All Data Layer Variables are created
- [ ] **Triggers**: All Custom Event triggers are created
- [ ] **Tags**: All Lytics event tags are created and configured
- [ ] **Tag Sequencing**: All event tags wait for base tag to fire first
- [ ] **Preview Testing**: All events fire correctly in GTM Preview
- [ ] **Data Layer Pushes**: Website pushes correct data to dataLayer
- [ ] **Lytics Verification**: Events appear in Lytics data stream
- [ ] **User Identification**: Email identification works correctly
- [ ] **No Console Errors**: No JavaScript errors related to tracking
- [ ] **Production Test**: Quick smoke test after publishing

### Publishing

1. In GTM, click **Submit** in the top right
2. Add a version name and description (e.g., "Lytics tracking implementation")
3. Click **Publish**
4. Test in production to verify everything works

---

## Quick Reference: Event to Tag Mapping

| Event | GTM Tag | Trigger |
|-------|---------|---------|
| Page View | Lytics - Page View | CE - pageView |
| Add to Cart | Lytics - Add to Cart | CE - add_to_cart |
| Buy Now | Lytics - Buy Now | CE - buy_now |
| Favorite | Lytics - Favorite | CE - favorite |
| Share | Lytics - Share | CE - share |
| Cart Quantity Change | Lytics - Cart Quantity | CE - cart_quantity_change |
| Cart Remove Item | Lytics - Cart Remove | CE - cart_remove_item |
| Cart Clear | Lytics - Cart Clear | CE - cart_clear |
| Proceed to Checkout | Lytics - Proceed Checkout | CE - proceed_to_checkout |
| Checkout Step | Lytics - Checkout Step | CE - checkout_step_completed |
| Search | Lytics - Search | CE - search |
| Search Click | Lytics - Search Click | CE - search_click |
| Form Interaction | Lytics - Form Interaction | CE - form_field_interaction |
| Form Submit | Lytics - Form Submit | CE - form_submit |
| User Identification | Lytics - Identify User | CE - identify_user |

---

## Support Resources

- **Lytics Documentation**: https://docs.lytics.com/
- **GTM Documentation**: https://support.google.com/tagmanager
- **Lytics JavaScript SDK**: https://docs.lytics.com/docs/lytics-javascript-tag
