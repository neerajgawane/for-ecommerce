import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// GET - Get single product by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params; // ✅ AWAIT params

    console.log('📦 Fetching product ID:', id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
      },
    });

    if (!product) {
      console.log('❌ Product not found:', id);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('✅ Product found:', product.name);
    return NextResponse.json({ product });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete product by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params; // ✅ AWAIT params

    console.log('🗑️ Attempting to delete product:', id);

    // Delete the product
    const deletedProduct = await prisma.product.delete({
      where: { id },
    });

    console.log('✅ Successfully deleted product:', deletedProduct.name);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      deletedProduct: deletedProduct.name
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Delete error:', error);

    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      // Record not found
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2003') {
      // Foreign key constraint failed
      return NextResponse.json(
        { error: 'Cannot delete product with existing references' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete product: ' + error.message },
      { status: 500 }
    );
  }
}