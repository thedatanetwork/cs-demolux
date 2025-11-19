import { NextResponse } from 'next/server';
import { dataService } from '@/lib/data-service';

export async function GET() {
  try {
    // Fetch all products without category filter and without variant aliases
    // This is for search purposes, so we want all base products
    const products = await dataService.getProducts(undefined, []);

    return NextResponse.json({
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products for search:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', products: [], count: 0 },
      { status: 500 }
    );
  }
}
