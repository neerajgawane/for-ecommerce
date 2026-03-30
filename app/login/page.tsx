'use client';

import { Suspense, useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const justRegistered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');

    const res = await signIn('user-credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError('Invalid email or password.');
      setLoading(false);
    } else {
      router.replace(callbackUrl);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signIn('google', { callbackUrl });
    } catch {
      setError('Failed to sign in with Google.');
      setGoogleLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F5' }}>
        <div className="text-[11px] uppercase tracking-widest text-[#8B7355]">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#FAF8F5' }}>
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1C1C1C] flex-col justify-between p-14">
        <Link href="/" className="text-2xl font-bold tracking-[0.22em] uppercase text-[#FAF8F5]"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}>
          FOR
        </Link>
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#8B7355] mb-4 font-medium">
            Your canvas. Your rules.
          </p>
          <h2 className="text-4xl text-[#FAF8F5] leading-[1.15]"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}>
            Design your story,<br /><em>wear your art.</em>
          </h2>
          <p className="text-base text-[#6B6055] mt-5 leading-relaxed font-light">
            Sign in to save your wishlist, track orders, and access your custom designs.
          </p>
        </div>
        <p className="text-[11px] text-[#4A4540] tracking-wider">© 2025 FOR. All rights reserved.</p>
      </div>

      {/* Right panel — sign in */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden block text-xl font-bold tracking-[0.18em] uppercase text-[#1C1C1C] mb-10"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}>
            FOR
          </Link>

          <Link href="/" className="hidden lg:flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#8B7355] hover:text-[#1C1C1C] transition-colors mb-10">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to store
          </Link>

          <h1 className="text-3xl text-[#1C1C1C] mb-2"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}>
            Welcome back
          </h1>
          <p className="text-sm text-[#6B6055] mb-8 font-light">
            Sign in to your FOR account to continue.
          </p>

          {/* Success banner after signup */}
          {justRegistered && (
            <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 px-4 py-3 mb-6">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-700">Account created successfully! Sign in to continue.</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Email / Password form */}
          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-[11px] uppercase tracking-widest text-[#8B7355] mb-2 font-medium">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 border border-[#C8C2B8] bg-white text-[#1C1C1C] text-sm placeholder:text-[#B0A898] focus:outline-none focus:border-[#8B7355] transition-colors"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-[11px] uppercase tracking-widest text-[#8B7355] mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 border border-[#C8C2B8] bg-white text-[#1C1C1C] text-sm placeholder:text-[#B0A898] focus:outline-none focus:border-[#8B7355] transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8B7355] hover:text-[#1C1C1C] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1C1C1C] text-[#FAF8F5] text-sm font-medium tracking-widest uppercase hover:bg-[#333] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-[#D9D4CC]" />
            <span className="text-[10px] uppercase tracking-widest text-[#A89E90] font-medium">or</span>
            <div className="flex-1 h-px bg-[#D9D4CC]" />
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-[#C8C2B8] bg-white hover:bg-[#F0EDE8] transition-colors text-sm font-medium text-[#1C1C1C] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? 'Connecting…' : 'Continue with Google'}
          </button>

          {/* Sign up link */}
          <p className="text-center text-sm text-[#6B6055] mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#1C1C1C] font-medium underline underline-offset-4 hover:text-[#8B7355] transition-colors">
              Sign Up
            </Link>
          </p>

          <p className="text-center text-[11px] text-[#8B7355] mt-6 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="underline cursor-pointer hover:text-[#1C1C1C] transition-colors">Terms of Service</span>
            {' '}and{' '}
            <span className="underline cursor-pointer hover:text-[#1C1C1C] transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F5' }}>
          <div className="text-[11px] uppercase tracking-widest text-[#8B7355]">Loading…</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}