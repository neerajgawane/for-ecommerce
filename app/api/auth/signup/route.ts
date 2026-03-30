import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // ── Validate inputs ─────────────────────────────────────────────────────────
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // ── Check for existing user ─────────────────────────────────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      if (existingUser.password) {
        // User already has a password — can't re-register
        return NextResponse.json(
          { error: 'An account with this email already exists.' },
          { status: 409 }
        );
      }

      // Google-only user → let them set a password so they can use either method
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          name: existingUser.name || name.trim(), // keep existing name if set
        },
      });

      return NextResponse.json(
        { message: 'Password added to existing account. You can now sign in with either method.', userId: existingUser.id },
        { status: 200 }
      );
    }

    // ── Hash password & create user ─────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'user',
      },
    });

    return NextResponse.json(
      { message: 'Account created successfully.', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('[SIGNUP_ERROR]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
