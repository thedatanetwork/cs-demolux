import { NextRequest, NextResponse } from 'next/server';
import { contentstack } from '@/lib/contentstack';

/**
 * API Route: Fetch Personalized Product
 * 
 * This endpoint accepts variant aliases from the Personalize SDK running in the browser
 * and returns the personalized product content using server-side Contentstack credentials.
 * 
 * Following Contentstack best practices from:
 * https://www.contentstack.com/docs/developers/sdks/personalize-edge-sdk/javascript/get-started-with-javascript-personalize-edge-sdk
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, variantAliases } = body;

    console.log('🔍 API Route - Personalized Product Request:', {
      slug,
      variantAliases,
      timestamp: new Date().toISOString()
    });

    // Validate inputs
    if (!slug) {
      return NextResponse.json(
        { error: 'Product slug is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(variantAliases)) {
      return NextResponse.json(
        { error: 'Variant aliases must be an array' },
        { status: 400 }
      );
    }

    // Fetch personalized product using server-side Contentstack credentials
    const product = await contentstack.getProductBySlug(slug, variantAliases);

    if (!product) {
      console.log('❌ Product not found:', slug);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('✅ API Route - Product fetched successfully:', {
      uid: product.uid,
      title: product.title,
      price: product.price,
      variantAliases
    });

    return NextResponse.json({
      success: true,
      product,
      meta: {
        variantAliases,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ API Route Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch personalized product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/personalized-product',
    method: 'POST',
    requiredFields: ['slug', 'variantAliases']
  });
}

