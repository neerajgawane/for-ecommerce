import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ── GET /api/designs/:id — Load a specific design ────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const design = await prisma.design.findUnique({
      where: { id },
    });

    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    // Only owner or public designs can be viewed
    if (design.userId !== dbUser.id && !design.isPublic) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(design);
  } catch (error) {
    console.error('❌ Error fetching design:', error);
    return NextResponse.json(
      { error: 'Failed to fetch design' },
      { status: 500 }
    );
  }
}

// ── PUT /api/designs/:id — Update an existing design ─────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify ownership
    const existing = await prisma.design.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const body = await request.json();

    const updated = await prisma.design.update({
      where: { id },
      data: {
        name: body.name?.trim() || undefined,
        designData: body.designData || undefined,
        tshirtColor: body.tshirtColor || undefined,
        tshirtGender: body.tshirtGender || undefined,
        tshirtFit: body.tshirtFit || undefined,
        tshirtSize: body.tshirtSize || undefined,
        frontImage: body.frontImage ?? undefined,
        backImage: body.backImage ?? undefined,
        hasFront: body.hasFront ?? undefined,
        hasBack: body.hasBack ?? undefined,
        isPublic: body.isPublic ?? undefined,
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error('❌ Error updating design:', error);
    return NextResponse.json(
      { error: 'Failed to update design' },
      { status: 500 }
    );
  }
}

// ── DELETE /api/designs/:id — Delete a design ────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify ownership
    const existing = await prisma.design.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    await prisma.design.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting design:', error);
    return NextResponse.json(
      { error: 'Failed to delete design' },
      { status: 500 }
    );
  }
}
