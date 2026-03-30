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

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product: ' + error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update product and manage variants
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    // Update product basic fields
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = String(body.name);
    if (body.description !== undefined) updateData.description = body.description ? String(body.description) : null;
    if (body.basePrice !== undefined) updateData.basePrice = Number(body.basePrice);
    if (body.printPrice !== undefined) updateData.printPrice = Number(body.printPrice);
    if (body.category !== undefined) updateData.category = String(body.category);
    if (body.gender !== undefined) updateData.gender = String(body.gender);
    if (body.fit !== undefined) updateData.fit = String(body.fit);
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    // If variants are provided, replace all existing variants
    if (Array.isArray(body.variants)) {
      // Delete old variants
      await prisma.productVariant.deleteMany({
        where: { productId: id },
      });

      // Create new variants
      const variantsData = body.variants.map((v: { color: string; colorName: string; size: string; frontImage: string; backImage: string; stock: number }, idx: number) => ({
        productId: id,
        color: v.color,
        colorName: v.colorName,
        size: v.size,
        frontImage: v.frontImage,
        backImage: v.backImage || v.frontImage,
        stock: v.stock || 50,
        sku: `${id.slice(0, 8)}-${v.colorName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}-${v.size}-${Date.now()}-${idx}`,
      }));

      await prisma.productVariant.createMany({
        data: variantsData,
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { variants: true },
    });

    console.log(`✅ Product "${product.name}" updated with ${product.variants.length} variants`);

    return NextResponse.json({ product });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product: ' + error.message },
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

    const { id } = await params;

    const deletedProduct = await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      deletedProduct: deletedProduct.name
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Delete error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete product: ' + error.message },
      { status: 500 }
    );
  }
}