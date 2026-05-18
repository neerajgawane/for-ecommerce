import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ── GET /api/designs — List current user's saved designs ──────────────────────
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const designs = await prisma.design.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        tshirtColor: true,
        tshirtGender: true,
        tshirtFit: true,
        tshirtSize: true,
        frontImage: true,
        backImage: true,
        hasFront: true,
        hasBack: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(designs);
  } catch (error) {
    console.error('❌ Error fetching designs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
      { status: 500 }
    );
  }
}

// ── POST /api/designs — Save a new design ─────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.designData) {
      return NextResponse.json(
        { error: 'Design data is required' },
        { status: 400 }
      );
    }

    const design = await prisma.design.create({
      data: {
        userId: dbUser.id,
        name: body.name?.trim() || 'Untitled Design',
        designData: body.designData,
        tshirtColor: body.tshirtColor || '#000000',
        tshirtGender: body.tshirtGender || 'men',
        tshirtFit: body.tshirtFit || 'regular',
        tshirtSize: body.tshirtSize || 'M',
        frontImage: body.frontImage || null,
        backImage: body.backImage || null,
        hasFront: body.hasFront ?? true,
        hasBack: body.hasBack ?? false,
        isPublic: body.isPublic ?? false,
      },
    });

    return NextResponse.json({
      id: design.id,
      name: design.name,
      createdAt: design.createdAt,
    });
  } catch (error) {
    console.error('❌ Error saving design:', error);
    return NextResponse.json(
      { error: 'Failed to save design' },
      { status: 500 }
    );
  }
}
