import { dataService } from '@/lib/data-service';
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';
import { configurePreview } from '@/lib/preview-context';
import { ProductTileBannerBlock } from '@/components/blocks/ProductTileBannerBlock';

export const dynamic = 'force-dynamic';

export default async function ProductTileBannerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  configurePreview(await searchParams);

  const variantAliases = await getVariantAliasesFromCookies();

  let pageHeading = 'Customizable Product Tile Banner';
  let pageSubheading: string | undefined;
  let banners: any[] = [];
  let fetchError: string | null = null;

  try {
    const page = await dataService.getProductTileBannerPage(variantAliases);
    if (page) {
      pageHeading = page.heading || pageHeading;
      pageSubheading = page.subheading;
      banners = page.tile_banners || [];
    }
  } catch (error: any) {
    fetchError = error.message || 'Failed to fetch product tile banner page';
    console.error('Tile banner fetch error:', error);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero header */}
      <div className="bg-gray-900 text-white">
        <div className="container-padding py-16 md:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-2 bg-gold-400/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 bg-gold-400 rounded-full"></div>
              <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
                Product Tile Banner Demo
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                {pageHeading?.split(' ').slice(0, 2).join(' ') || 'Customizable Tile'}
              </span>{' '}
              <span className="text-white">
                {pageHeading?.split(' ').slice(2).join(' ') || 'Banner'}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl">
              {pageSubheading ||
                'Editor-controlled grid of product tiles. Each tile pulls in a product image and lets editors customize five badge fields — eyebrow, prefix, value, suffix, sublabel — in a fixed visual format.'}
            </p>

            {fetchError && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 mb-4">
                <p className="text-red-300 text-sm font-medium">Failed to load page from Contentstack</p>
                <p className="text-red-400 text-xs mt-1">{fetchError}</p>
                <p className="text-red-400 text-xs mt-2">
                  Run{' '}
                  <code className="bg-white/10 px-1.5 py-0.5 rounded">
                    cd scripts && npm run setup-product-tile-banner
                  </code>{' '}
                  to create schemas and seed sample data.
                </p>
              </div>
            )}

            {!fetchError && banners.length === 0 && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-gray-300 text-sm font-medium">No banners configured yet</p>
                <p className="text-gray-400 text-xs mt-2">
                  Run{' '}
                  <code className="bg-white/10 px-1.5 py-0.5 rounded">
                    cd scripts && npm run setup-product-tile-banner
                  </code>{' '}
                  to seed a sample banner.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner blocks */}
      {banners.map((banner, idx) => (
        <ProductTileBannerBlock key={banner.uid || idx} block={banner} />
      ))}

      {/* Editor field reference */}
      <section className="bg-gray-50 section-spacing">
        <div className="container-padding">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl font-bold text-gray-900 mb-8">
              Tile Field Reference
            </h2>
            <p className="text-gray-600 mb-8">
              Each tile is composed of an image, a caption label, a destination URL, and five badge fields.
              The badge fields render in a fixed layout so the visual format stays consistent across tiles.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <FieldCard name="Image" detail="Square image of the product or category" />
              <FieldCard name="Label" detail='Caption under the tile (e.g. "Smart Glasses")' />
              <FieldCard name="Link URL" detail="Destination when the tile is clicked" />
              <FieldCard name="Eyebrow" detail='Small lead-in on the badge (e.g. "from", "up to")' />
              <FieldCard name="Prefix" detail='Currency or prefix symbol (e.g. "$")' />
              <FieldCard name="Value" detail='Main number — price or discount (e.g. "12", "60")' />
              <FieldCard name="Suffix" detail='"%" or amount in cents (e.g. "99")' />
              <FieldCard name="Sublabel" detail='Text below the suffix (e.g. "off")' />
            </div>

            <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200">
              <h3 className="font-heading text-lg font-semibold text-gray-900 mb-3">
                Block-level Design Settings
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><strong>Columns:</strong> 4, 5, or 6 — desktop grid density (scales 2/3/4/5/6 across breakpoints)</li>
                <li><strong>Background:</strong> white, gray, or dark</li>
                <li><strong>Gap size:</strong> tight, normal, or loose</li>
                <li><strong>Tile aspect ratio:</strong> square, 4:5, 3:4, or 4:3</li>
                <li><strong>Tile image fit:</strong> cover (crop) or contain (full image with padding)</li>
                <li><strong>Tile background:</strong> transparent, white, soft gray, or soft warm</li>
                <li><strong>Corner radius:</strong> none, small, medium, or large</li>
                <li><strong>Badge color:</strong> teal, gold, red, navy, or black</li>
                <li><strong>Badge shape:</strong> price tag (with punch hole), rectangle, or pill</li>
                <li><strong>Badge position:</strong> top-left or top-right</li>
                <li><strong>Label alignment:</strong> center or left</li>
                <li><strong>Show labels:</strong> toggle the caption under each tile</li>
                <li><strong>Tile cap:</strong> up to 30 tiles per banner</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FieldCard({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="font-mono text-xs font-semibold text-gold-700 mb-1">{name}</div>
      <div className="text-sm text-gray-700">{detail}</div>
    </div>
  );
}
