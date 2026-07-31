import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/settings — get current admin profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (session?.user as any)?.role;
    if (!session?.user || (role !== 'admin' && role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('❌ Admin settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin profile' }, { status: 500 });
  }
}

// PATCH /api/admin/settings — update admin profile and/or password
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    // Update name if provided
    if (name && name.trim().length >= 2) {
      updateData.name = name.trim();
    }

    // Update email if provided and different
    if (email && email !== admin.email) {
      // Check if email is already taken
      const existing = await prisma.admin.findUnique({
        where: { email },
      });
      if (existing) {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 400 });
      }
      updateData.email = email.trim().toLowerCase();
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
      }

      const isValid = await bcrypt.compare(currentPassword, admin.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No changes to update' });
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true },
    });

    console.log(`✅ Admin profile updated: ${updatedAdmin.email}`);

    return NextResponse.json({
      success: true,
      admin: updatedAdmin,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('❌ Admin settings PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
