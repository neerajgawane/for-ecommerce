'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AuthSync from '@/components/AuthSync';
import { SessionProvider } from 'next-auth/react';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    // Admin pages: no storefront navbar or footer
    return <SessionProvider><AuthSync />{children}</SessionProvider>;
  }

  return (
    <SessionProvider>
      <AuthSync />
      <Navbar />
      {children}
      {/* Footer */}
      <footer style={{ background: '#1C1C1C' }} className="text-[#FAF8F5] py-16 mt-0">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <h3
                className="text-2xl font-medium tracking-[0.18em] mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                FOR
              </h3>
              <p className="text-[#8B7355] text-sm font-light leading-relaxed">Design your story, wear your art.</p>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold mb-5 uppercase tracking-[0.2em] text-[#FAF8F5]/60">Shop</h4>
              <ul className="space-y-3">
                <li><Link href="/products" className="text-sm text-[#A09485] hover:text-[#FAF8F5] transition-colors font-light">New Arrivals</Link></li>
                <li><Link href="/products" className="text-sm text-[#A09485] hover:text-[#FAF8F5] transition-colors font-light">All Products</Link></li>
                <li><Link href="/studio" className="text-sm text-[#A09485] hover:text-[#FAF8F5] transition-colors font-light">Design Studio</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold mb-5 uppercase tracking-[0.2em] text-[#FAF8F5]/60">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-sm text-[#A09485] hover:text-[#FAF8F5] transition-colors font-light">About</Link></li>
                <li><Link href="/contact" className="text-sm text-[#A09485] hover:text-[#FAF8F5] transition-colors font-light">Contact</Link></li>
                <li><Link href="/faq" className="text-sm text-[#A09485] hover:text-[#FAF8F5] transition-colors font-light">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold mb-5 uppercase tracking-[0.2em] text-[#FAF8F5]/60">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/shipping" className="text-sm text-[#A09485] hover:text-[#FAF8F5] transition-colors font-light">Shipping</Link></li>
                <li><Link href="/returns" className="text-sm text-[#A09485] hover:text-[#FAF8F5] transition-colors font-light">Returns</Link></li>
                <li><Link href="/privacy" className="text-sm text-[#A09485] hover:text-[#FAF8F5] transition-colors font-light">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#FAF8F5]/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#A09485] text-xs font-light tracking-wide">© 2026 FOR. All rights reserved.</p>
            <p className="text-[#A09485] text-xs font-light tracking-[0.2em] uppercase">Design Your Story</p>
          </div>
        </div>
      </footer>
    </SessionProvider>
  );
}
