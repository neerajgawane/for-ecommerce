'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const passwordReqs = [
    { test: formData.password.length >= 8, text: 'At least 8 characters' },
    { test: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { test: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
    { test: /[0-9]/.test(formData.password), text: 'One number' },
  ];
  const isPasswordValid = passwordReqs.every((r) => r.test);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password does not meet requirements.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed. Please try again.');
        setIsLoading(false);
        return;
      }

      router.push('/login?registered=true');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
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
            Join the community
          </p>
          <h2 className="text-4xl text-[#FAF8F5] leading-[1.15]"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}>
            Create something<br /><em>uniquely yours.</em>
          </h2>
          <p className="text-base text-[#6B6055] mt-5 leading-relaxed font-light">
            Sign up to save wishlists, design custom tees, and track your orders.
          </p>
        </div>
        <p className="text-[11px] text-[#4A4540] tracking-wider">© 2025 FOR. All rights reserved.</p>
      </div>

      {/* Right panel — sign up */}
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
            Create account
          </h1>
          <p className="text-sm text-[#6B6055] mb-8 font-light">
            Join FOR to start designing custom t-shirts.
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Signup form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="signup-name" className="block text-[11px] uppercase tracking-widest text-[#8B7355] mb-2 font-medium">
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3.5 border border-[#C8C2B8] bg-white text-[#1C1C1C] text-sm placeholder:text-[#B0A898] focus:outline-none focus:border-[#8B7355] transition-colors"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-[11px] uppercase tracking-widest text-[#8B7355] mb-2 font-medium">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 border border-[#C8C2B8] bg-white text-[#1C1C1C] text-sm placeholder:text-[#B0A898] focus:outline-none focus:border-[#8B7355] transition-colors"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-[11px] uppercase tracking-widest text-[#8B7355] mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 border border-[#C8C2B8] bg-white text-[#1C1C1C] text-sm placeholder:text-[#B0A898] focus:outline-none focus:border-[#8B7355] transition-colors"
                  autoComplete="new-password"
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

              {/* Password requirements */}
              {formData.password && (
                <div className="mt-3 space-y-1.5">
                  {passwordReqs.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      {req.test ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-[#C8C2B8]" />
                      )}
                      <span className={req.test ? 'text-green-700' : 'text-[#8B7355]'}>{req.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm" className="block text-[11px] uppercase tracking-widest text-[#8B7355] mb-2 font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="signup-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 border border-[#C8C2B8] bg-white text-[#1C1C1C] text-sm placeholder:text-[#B0A898] focus:outline-none focus:border-[#8B7355] transition-colors"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8B7355] hover:text-[#1C1C1C] transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1.5 text-[11px] text-red-600">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className="w-full py-4 bg-[#1C1C1C] text-[#FAF8F5] text-sm font-medium tracking-widest uppercase hover:bg-[#333] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-[#D9D4CC]" />
            <span className="text-[10px] uppercase tracking-widest text-[#A89E90] font-medium">or</span>
            <div className="flex-1 h-px bg-[#D9D4CC]" />
          </div>

          {/* Google Sign Up */}
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

          {/* Login link */}
          <p className="text-center text-sm text-[#6B6055] mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-[#1C1C1C] font-medium underline underline-offset-4 hover:text-[#8B7355] transition-colors">
              Log In
            </Link>
          </p>

          <p className="text-center text-[11px] text-[#8B7355] mt-6 leading-relaxed">
            By creating an account, you agree to our{' '}
            <span className="underline cursor-pointer hover:text-[#1C1C1C] transition-colors">Terms of Service</span>
            {' '}and{' '}
            <span className="underline cursor-pointer hover:text-[#1C1C1C] transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F5' }}>
          <div className="text-[11px] uppercase tracking-widest text-[#8B7355]">Loading…</div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}