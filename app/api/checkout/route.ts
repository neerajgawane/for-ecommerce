import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// ── Input validation helpers ──────────────────────────────────────────────────
function sanitize(s: string): string {
  return s.trim().replace(/[<>]/g, '');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

function isValidPincode(pin: string): boolean {
  return /^[0-9]{6}$/.test(pin);
}

// ── POST /api/checkout ────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // 1. Auth — require logged-in user (server-side session check)
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to place an order.' },
        { status: 401 }
      );
    }

    // Look up the DB user by email to get the real userId
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User account not found.' },
        { status: 404 }
      );
    }

    // 2. Parse & validate body
    const body = await request.json();
    const { items, name, email, phone, address, city, state, pincode, paymentMethod } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    const customerName = sanitize(name || '');
    const customerEmail = sanitize(email || '');
    const customerPhone = sanitize(phone || '');
    const shippingAddress = sanitize(address || '');
    const shippingCity = sanitize(city || '');
    const shippingState = sanitize(state || '');
    const shippingPincode = sanitize(pincode || '');
    const method = paymentMethod === 'cod' ? 'cod' : 'razorpay';

    if (!customerName || customerName.length < 2) {
      return NextResponse.json({ error: 'Please enter a valid name.' }, { status: 400 });
    }
    if (!isValidEmail(customerEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
    }
    if (!isValidPhone(customerPhone)) {
      return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 });
    }
    if (!shippingAddress || shippingAddress.length < 5) {
      return NextResponse.json({ error: 'Please enter a valid address.' }, { status: 400 });
    }
    if (!shippingCity) {
      return NextResponse.json({ error: 'Please enter a city.' }, { status: 400 });
    }
    if (!shippingState) {
      return NextResponse.json({ error: 'Please select a state.' }, { status: 400 });
    }
    if (!isValidPincode(shippingPincode)) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit PIN code.' }, { status: 400 });
    }

    // 3. Calculate total SERVER-SIDE (never trust client totals)
    let totalAmount = 0;
    const validatedItems: Array<{
      productId: string | null;
      designId: string;
      quantity: number;
      price: number;
      size: string;
      color: string;
      gender: string;
      fit: string;
    }> = [];

    for (const item of items) {
      const qty = Math.max(1, Math.min(10, parseInt(item.quantity) || 1));

      if (item.productId && item.productId !== 'custom-design') {
        // Validate product exists and get real price from DB
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, basePrice: true, printPrice: true, isActive: true },
        });

        if (!product || !product.isActive) {
          return NextResponse.json(
            { error: `Product "${item.name || item.productId}" is no longer available.` },
            { status: 400 }
          );
        }

        const unitPrice = product.basePrice + product.printPrice;
        totalAmount += unitPrice * qty;

        validatedItems.push({
          productId: product.id,
          designId: item.designId || '',
          quantity: qty,
          price: unitPrice,
          size: sanitize(item.size || 'M'),
          color: sanitize(item.color || 'Default'),
          gender: sanitize(item.gender || 'unisex'),
          fit: sanitize(item.fit || 'regular'),
        });
      } else {
        // Custom design item — use fixed pricing
        const customPrice = 499; // base price for custom tees
        totalAmount += customPrice * qty;

        validatedItems.push({
          productId: null,
          designId: item.designId || `custom-${Date.now()}`,
          quantity: qty,
          price: customPrice,
          size: sanitize(item.size || 'M'),
          color: sanitize(item.color || '#000000'),
          gender: sanitize(item.gender || 'men'),
          fit: sanitize(item.fit || 'regular'),
        });
      }
    }

    // 4. Generate unique order number
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `FOR-${timestamp}-${random}`;

    // 5. Create order in DB (transaction for data integrity)
    const order = await prisma.order.create({
      data: {
        userId: dbUser.id,
        orderNumber,
        status: method === 'cod' ? 'confirmed' : 'pending',
        totalAmount,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingPincode,
        paymentStatus: method === 'cod' ? 'cod_pending' : 'pending',
        paymentMethod: method,
        items: {
          create: validatedItems.map((vi) => ({
            productId: vi.productId,
            designId: vi.designId,
            quantity: vi.quantity,
            price: vi.price,
            size: vi.size,
            color: vi.color,
            gender: vi.gender,
            fit: vi.fit,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      paymentMethod: method,
      status: order.status,
    });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
