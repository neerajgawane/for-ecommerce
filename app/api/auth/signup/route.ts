import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// ── Input sanitization ────────────────────────────────────────────────────────
function sanitize(s: string): string {
  return s.trim().replace(/[<>]/g, '');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): boolean {
  // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

// ── Simple in-memory rate limiter ─────────────────────────────────────────────
const signupAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = signupAttempts.get(ip);

  if (!record || record.resetAt < now) {
    signupAttempts.set(ip, { count: 1, resetAt: now + 60_000 }); // 1 min window
    return false;
  }

  record.count++;
  if (record.count > 5) return true; // max 5 signups per minute per IP
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ─────────────────────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const { name, email, password } = await req.json();

    // ── Validate inputs ─────────────────────────────────────────────────────────
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const cleanName = sanitize(name);
    const cleanEmail = email.toLowerCase().trim();

    if (cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, and a number.' },
        { status: 400 }
      );
    }

    // ── Check for existing user ─────────────────────────────────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
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
          name: existingUser.name || cleanName,
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
        name: cleanName,
        email: cleanEmail,
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
