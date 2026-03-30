'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Heart, User, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useSession, signOut } from 'next-auth/react';

const NAV_LINKS = [
  { label: 'New Arrivals', href: '/products?featured=true' },
  { label: 'T-Shirts', href: '/products?category=t-shirt' },
  { label: 'Hoodies', href: '/products?category=hoodie' },
  {
    label: 'Shop',
    href: '#',
    dropdown: [
      { label: 'For Him', href: '/products?gender=men' },
      { label: 'For Her', href: '/products?gender=women' },
      { label: 'Unisex', href: '/products' },
      { label: 'Oversized', href: '/products?fit=oversized' },
    ],
  },
  { label: 'Custom Design', href: '/studio' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const { data: session } = useSession();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-focus search input
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const userInitial = session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#1C1C1C] text-[#FAF8F5] text-[10px] tracking-[0.25em] text-center py-2 font-medium uppercase">
        Free shipping on orders above ₹999 &nbsp;·&nbsp; New arrivals every week
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-50 bg-[#FAF8F5] transition-shadow duration-300 ${
          scrolled ? 'shadow-[0_1px_12px_rgba(0,0,0,0.07)]' : 'border-b border-[#E8E2D9]'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10">
          <div className="flex items-center justify-between h-14 lg:h-16">

            {/* Logo */}
            <Link
              href="/"
              className="text-xl lg:text-2xl font-bold tracking-[0.18em] uppercase flex-shrink-0"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}
            >
              FOR
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8 ml-10">
              {NAV_LINKS.map((link) =>
                link.dropdown ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setDropdownOpen(link.label)}
                    onMouseLeave={() => setDropdownOpen(null)}
                  >
                    <button className="flex items-center gap-1 text-xs tracking-widest uppercase font-medium text-[#1C1C1C] hover:text-[#8B7355] transition-colors duration-200">
                      {link.label}
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-200 ${
                          dropdownOpen === link.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {dropdownOpen === link.label && (
                      <div className="absolute left-0 top-full pt-2 z-50">
                        <div className="bg-[#FAF8F5] border border-[#E8E2D9] shadow-lg min-w-[160px]">
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setDropdownOpen(null)}
                              className="block px-5 py-3 text-[11px] tracking-widest uppercase font-medium text-[#1C1C1C] hover:bg-[#F0EDE8] hover:text-[#8B7355] transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs tracking-widest uppercase font-medium text-[#1C1C1C] hover:text-[#8B7355] transition-colors duration-200 whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Icons — RIGHT */}
            <div className="flex items-center gap-4 lg:gap-5 ml-auto lg:ml-0">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-[#1C1C1C] hover:text-[#8B7355] transition-colors"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="hidden lg:block text-[#1C1C1C] hover:text-[#8B7355] transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-[18px] h-[18px]" />
              </Link>

              {/* User / Account */}
              {session ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-[#1C1C1C] hover:text-[#8B7355] transition-colors"
                    aria-label="Account menu"
                  >
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-7 h-7 rounded-full object-cover border border-[#E8E2D9]"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#1C1C1C] text-[#FAF8F5] flex items-center justify-center text-[11px] font-bold">
                        {userInitial}
                      </div>
                    )}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-[#FAF8F5] border border-[#E8E2D9] shadow-lg min-w-[180px] z-50">
                      <div className="px-4 py-3 border-b border-[#E8E2D9]">
                        <p className="text-xs font-semibold text-[#1C1C1C] truncate">{session.user?.name || 'User'}</p>
                        <p className="text-[10px] text-[#8B7355] truncate">{session.user?.email}</p>
                      </div>
                      <Link
                        href="/wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-[11px] uppercase tracking-wider font-medium text-[#1C1C1C] hover:bg-[#F0EDE8] transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5" /> Wishlist
                      </Link>
                      <button
                        onClick={() => { signOut({ callbackUrl: '/' }); setUserMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-3 text-[11px] uppercase tracking-wider font-medium text-[#8B7355] hover:bg-[#F0EDE8] transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-[#1C1C1C] hover:text-[#8B7355] transition-colors"
                  aria-label="Sign In"
                >
                  <User className="w-[18px] h-[18px]" />
                </Link>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="relative text-[#1C1C1C] hover:text-[#8B7355] transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="w-[18px] h-[18px]" />
                {mounted && getTotalItems() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#1C1C1C] text-[#FAF8F5] text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {getTotalItems()}
                  </span>
                )}
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden text-[#1C1C1C] ml-1"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-[#E8E2D9] bg-[#FAF8F5]">
            <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-4">
              <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7355]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search t-shirts, hoodies..."
                  className="w-full pl-11 pr-10 py-2.5 text-sm bg-white border border-[#E8E2D9] focus:outline-none focus:border-[#1C1C1C] transition-colors placeholder:text-[#B5A898]"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355] hover:text-[#1C1C1C]"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
              <p className="text-center text-[10px] text-[#B5A898] mt-2 tracking-wider">
                Press Enter to search
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[80vw] max-w-[320px] bg-[#FAF8F5] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E2D9]">
              <span
                className="text-lg font-bold tracking-[0.18em] uppercase"
                style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}
              >
                FOR
              </span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-[#1C1C1C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {session && (
              <div className="flex items-center gap-3 px-6 py-4 bg-[#F0EDE8] border-b border-[#E8E2D9]">
                {session.user?.image ? (
                  <img src={session.user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#1C1C1C] text-[#FAF8F5] flex items-center justify-center text-sm font-bold">
                    {userInitial}
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-[#1C1C1C]">{session.user?.name}</p>
                  <p className="text-[10px] text-[#8B7355]">{session.user?.email}</p>
                </div>
              </div>
            )}

            <nav className="flex flex-col px-6 py-4 gap-0 flex-1 overflow-y-auto">
              {NAV_LINKS.map((link) =>
                link.dropdown ? (
                  <div key={link.label}>
                    <p className="py-3 text-[11px] tracking-widest uppercase font-semibold text-[#8B7355] border-b border-[#E8E2D9]">
                      {link.label}
                    </p>
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="pl-4 py-2.5 block text-sm tracking-wider text-[#4A4540] border-b border-[#F0EDE8] hover:text-[#8B7355] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3 text-[11px] tracking-widest uppercase font-medium text-[#1C1C1C] border-b border-[#E8E2D9] hover:text-[#8B7355] transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            <div className="px-6 py-5 border-t border-[#E8E2D9] flex flex-col gap-3">
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm text-[#1C1C1C] hover:text-[#8B7355] transition-colors"
              >
                <Heart className="w-4 h-4" /> Wishlist
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm text-[#1C1C1C] hover:text-[#8B7355] transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> Cart{' '}
                {mounted && getTotalItems() > 0 && `(${getTotalItems()})`}
              </Link>
              {session ? (
                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2.5 text-sm text-[#8B7355]"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 text-sm text-[#1C1C1C] hover:text-[#8B7355] transition-colors"
                >
                  <User className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}