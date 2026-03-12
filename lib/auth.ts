import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  try {
    const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
    const session = await getServerSession(authOptions);
    return session?.user || null;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireAdmin() {
  try {
    const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      redirect('/admin/login');
    }

    return session.user;
  } catch {
    redirect('/admin/login');
  }
}

export async function isAdmin(): Promise<boolean> {
  try {
    const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
    const session = await getServerSession(authOptions);
    return !!session?.user;
  } catch {
    return false;
  }
}

export async function isLoggedIn(): Promise<boolean> {
  try {
    const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
    const session = await getServerSession(authOptions);
    return !!session?.user;
  } catch {
    return false;
  }
}