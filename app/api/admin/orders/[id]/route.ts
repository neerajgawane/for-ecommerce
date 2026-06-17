import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusUpdate } from '@/lib/email';

// GET single order detail
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                variants: {
                  select: { frontImage: true, colorName: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Order detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order: ' + error.message },
      { status: 500 }
    );
  }
}

// PATCH update order status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    });

    console.log(`✅ Order ${order.orderNumber} updated: status=${order.status}`);

    // Send status update email to customer (for meaningful status changes)
    const emailStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (body.status && emailStatuses.includes(body.status)) {
      sendOrderStatusUpdate({
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        orderNumber: order.orderNumber,
        newStatus: body.status,
        trackingNumber: body.trackingNumber,
        courierName: body.courierName,
      }).catch(console.error);
    }

    return NextResponse.json({ order });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    console.error('❌ Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order: ' + error.message },
      { status: 500 }
    );
  }
}
