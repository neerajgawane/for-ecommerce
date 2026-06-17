import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmation, sendNewOrderAlert, type OrderEmailData } from '@/lib/email';
import crypto from 'crypto';

// ── POST /api/checkout/verify — verify Razorpay payment signature ─────────────
export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to complete payment.' },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // 2. Parse body
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json(
        { error: 'Missing payment verification data.' },
        { status: 400 }
      );
    }

    // 3. Verify HMAC signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('❌ RAZORPAY_KEY_SECRET is not set');
      return NextResponse.json(
        { error: 'Payment configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Razorpay signature mismatch');
      return NextResponse.json(
        { error: 'Payment verification failed. Please contact support.' },
        { status: 400 }
      );
    }

    // 4. Verify the order belongs to this user and has the matching razorpayOrderId
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        razorpayOrderId: true,
        paymentStatus: true,
        orderNumber: true,
      },
    });

    if (!order || order.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json(
        { error: 'Order ID mismatch.' },
        { status: 400 }
      );
    }

    // Prevent double-processing
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        message: 'Payment already verified.',
      });
    }

    // 5. Update order — mark as paid and confirmed
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        status: 'confirmed',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });

    console.log(`✅ Payment verified for order ${updatedOrder.orderNumber}`);

    // Send confirmation emails now that payment is verified
    const fullOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    if (fullOrder) {
      const emailData: OrderEmailData = {
        orderNumber: fullOrder.orderNumber,
        customerName: fullOrder.customerName,
        customerEmail: fullOrder.customerEmail,
        customerPhone: fullOrder.customerPhone,
        totalAmount: fullOrder.totalAmount,
        paymentMethod: fullOrder.paymentMethod,
        shippingAddress: fullOrder.shippingAddress,
        shippingCity: fullOrder.shippingCity,
        shippingState: fullOrder.shippingState,
        shippingPincode: fullOrder.shippingPincode,
        items: fullOrder.items.map((item) => ({
          name: item.product?.name || 'Custom Design T-Shirt',
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
        })),
      };

      // Fire-and-forget
      sendOrderConfirmation(emailData).catch(console.error);
      sendNewOrderAlert(emailData).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed. Please contact support.' },
      { status: 500 }
    );
  }
}
