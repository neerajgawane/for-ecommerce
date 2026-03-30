'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, SlidersHorizontal, X, ChevronDown, ArrowUpDown } from 'lucide-react';

interface ProductVariant {
  id: string;
  color: string;
  colorName: string;
  size: string;
  frontImage: string;
  backImage: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  printPrice: number;
  category: string;
  gender: string;
  fit: string;
  isActive: boolean;
  isFeatured: boolean;
  variants: ProductVariant[];
}

// ─── Filter Pill ─────────────────────────────────────────────────────────────
function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 text-[11px] tracking-[0.12em] uppercase font-medium border transition-all duration-200 whitespace-nowrap ${
        active
          ? 'bg-[#1C1C1C] text-[#FAF8F5] border-[#1C1C1C]'
          : 'bg-transparent text-[#1C1C1C] border-[#C8C2B8] hover:border-[#1C1C1C]'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const totalPrice = product.basePrice + product.printPrice;
  const frontImage = product.variants?.[0]?.frontImage;
  const backImage = product.variants?.[0]?.backImage;
  const isValidImg = (u?: string) => u && u.trim() !== '' && !u.endsWith('placeholder.png');
  const imgSrc = isValidImg(frontImage) ? frontImage : '';
  const hoverSrc = isValidImg(backImage) ? backImage : imgSrc;
  const colorCount = product.variants ? new Set(product.variants.map((v) => v.color)).size : 0;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div
        className="relative aspect-[3/4] bg-[#F0EDE8] overflow-hidden mb-4"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {imgSrc ? (
          <img
            src={hovered && hoverSrc && hoverSrc !== imgSrc ? hoverSrc : imgSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <ShoppingBag className="w-10 h-10 text-[#C8C2B8]" />
            <span className="text-[10px] tracking-widest uppercase text-[#B5A898]">No Image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isFeatured && (
            <span className="bg-[#8B7355] text-[#FAF8F5] text-[9px] tracking-[0.15em] uppercase font-semibold px-2.5 py-1">
              Featured
            </span>
          )}
          {product.fit === 'oversized' && (
            <span className="bg-[#1C1C1C] text-[#FAF8F5] text-[9px] tracking-[0.15em] uppercase font-semibold px-2.5 py-1">
              Oversized
            </span>
          )}
        </div>

        {/* Quick add overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#1C1C1C] text-[#FAF8F5] text-[10px] tracking-[0.18em] uppercase font-semibold py-2.5 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          Quick View
        </div>
      </div>

      {/* Product Info */}
      <div>
        <p className="text-[10px] tracking-[0.18em] uppercase text-[#8B7355] mb-1 font-medium">
          {product.category.replace('-', ' ')}
          {product.gender && product.gender !== 'unisex'
            ? ` · ${product.gender === 'men' ? 'For Him' : 'For Her'}`
            : ''}
        </p>
        <h3 className="text-sm font-medium text-[#1C1C1C] mb-1.5 leading-snug group-hover:text-[#8B7355] transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#1C1C1C]">₹{totalPrice.toLocaleString()}</span>
          {colorCount > 1 && (
            <span className="text-[10px] text-[#8B7355] tracking-wide">{colorCount} colours</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Main Products Page (inner) ───────────────────────────────────────────────
function ProductsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Read URL params on mount
  const urlCategory = searchParams.get('category') || '';
  const urlGender = searchParams.get('gender') || '';
  const urlFeatured = searchParams.get('featured') === 'true';
  const urlSearch = searchParams.get('q') || '';

  // Filter states (initialised from URL)
  const [selectedGender, setSelectedGender] = useState<string[]>(urlGender ? [urlGender] : []);
  const [selectedCategory, setSelectedCategory] = useState<string[]>(urlCategory ? [urlCategory] : []);
  const [selectedSize, setSelectedSize] = useState<string[]>([]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(urlFeatured);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [sortBy, setSortBy] = useState('newest');

  const SORT_OPTIONS = [
    { val: 'newest', label: 'Newest' },
    { val: 'price-low', label: 'Price: Low to High' },
    { val: 'price-high', label: 'Price: High to Low' },
    { val: 'name', label: 'Name: A–Z' },
  ];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Sync URL param changes
  useEffect(() => {
    if (urlGender) setSelectedGender([urlGender]);
    if (urlCategory) setSelectedCategory([urlCategory]);
    if (urlFeatured) setShowFeaturedOnly(true);
    if (urlSearch) setSearchQuery(urlSearch);
  }, [urlGender, urlCategory, urlFeatured, urlSearch]);

  const toggle = (arr: string[], val: string, setter: (a: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const clearFilters = () => {
    setSelectedGender([]);
    setSelectedCategory([]);
    setSelectedSize([]);
    setShowFeaturedOnly(false);
    setSearchQuery('');
    router.push('/products');
  };

  // Filter + sort
  const filtered = products.filter((p) => {
    if (selectedGender.length && !selectedGender.includes((p.gender || '').toLowerCase())) return false;
    if (selectedCategory.length && !selectedCategory.includes((p.category || '').toLowerCase())) return false;
    if (selectedSize.length) {
      const has = (p.variants || []).some((v) => selectedSize.includes(v.size.toUpperCase()));
      if (!has) return false;
    }
    if (showFeaturedOnly && !p.isFeatured) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aP = a.basePrice + a.printPrice;
    const bP = b.basePrice + b.printPrice;
    if (sortBy === 'price-low') return aP - bP;
    if (sortBy === 'price-high') return bP - aP;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const activeFilterCount =
    selectedGender.length + selectedCategory.length + selectedSize.length + (showFeaturedOnly ? 1 : 0);

  // Page title based on active filters
  const pageTitle = (() => {
    if (showFeaturedOnly) return 'New Arrivals';
    if (selectedCategory[0] === 't-shirt') return 'T-Shirts';
    if (selectedCategory[0] === 'hoodie') return 'Hoodies';
    if (selectedGender[0] === 'men') return 'For Him';
    if (selectedGender[0] === 'women') return 'For Her';
    return 'All Products';
  })();

  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Gender */}
      <div>
        <h3 className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#1C1C1C] mb-4">Gender</h3>
        <div className="space-y-2.5">
          {['men', 'women', 'unisex'].map((g) => (
            <label key={g} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => toggle(selectedGender, g, setSelectedGender)}
                className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                  selectedGender.includes(g) ? 'bg-[#1C1C1C] border-[#1C1C1C]' : 'border-[#C8C2B8] group-hover:border-[#1C1C1C]'
                }`}
              >
                {selectedGender.includes(g) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span
                onClick={() => toggle(selectedGender, g, setSelectedGender)}
                className="text-sm capitalize text-[#4A4540] cursor-pointer"
              >
                {g === 'men' ? 'For Him' : g === 'women' ? 'For Her' : 'Unisex'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#1C1C1C] mb-4">Category</h3>
        <div className="space-y-2.5">
          {['t-shirt', 'hoodie', 'sweatshirt', 'polo'].map((c) => (
            <label key={c} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => toggle(selectedCategory, c, setSelectedCategory)}
                className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                  selectedCategory.includes(c) ? 'bg-[#1C1C1C] border-[#1C1C1C]' : 'border-[#C8C2B8] group-hover:border-[#1C1C1C]'
                }`}
              >
                {selectedCategory.includes(c) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span
                onClick={() => toggle(selectedCategory, c, setSelectedCategory)}
                className="text-sm capitalize text-[#4A4540] cursor-pointer"
              >
                {c}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#1C1C1C] mb-4">Size</h3>
        <div className="flex flex-wrap gap-2">
          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
            <button
              key={s}
              onClick={() => toggle(selectedSize, s, setSelectedSize)}
              className={`w-10 h-10 text-[11px] font-medium border transition-all ${
                selectedSize.includes(s)
                  ? 'bg-[#1C1C1C] text-[#FAF8F5] border-[#1C1C1C]'
                  : 'border-[#C8C2B8] text-[#4A4540] hover:border-[#1C1C1C]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* New Arrivals toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
              showFeaturedOnly ? 'bg-[#8B7355] border-[#8B7355]' : 'border-[#C8C2B8] group-hover:border-[#8B7355]'
            }`}
          >
            {showFeaturedOnly && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className="text-sm text-[#4A4540] cursor-pointer"
          >
            New Arrivals only
          </span>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="text-[11px] tracking-widest uppercase font-semibold text-[#8B7355] hover:text-[#1C1C1C] transition-colors flex items-center gap-1.5"
        >
          <X className="w-3 h-3" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="border-b border-[#E8E2D9] px-5 lg:px-10 py-12 max-w-[1440px] mx-auto">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-medium">
          {activeFilterCount > 0
            ? `${sorted.length} result${sorted.length !== 1 ? 's' : ''}`
            : 'Our collection'}
        </p>
        <h1
          className="text-4xl lg:text-5xl text-[#1C1C1C] leading-none"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontWeight: 500,
          }}
        >
          {pageTitle}
        </h1>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 lg:px-10">
        {/* ── Horizontal filter pills (mobile/tablet) + sort (all) ── */}
        <div className="flex items-center gap-2 py-4 border-b border-[#E8E2D9] overflow-x-auto scrollbar-none lg:hidden">
          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 border border-[#C8C2B8] text-[11px] uppercase tracking-widest font-medium text-[#1C1C1C] hover:border-[#1C1C1C] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          {/* Active filter pills */}
          {selectedGender.map((g) => (
            <button key={g} onClick={() => toggle(selectedGender, g, setSelectedGender)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1C1C] text-[#FAF8F5] text-[10px] uppercase tracking-wider font-medium">
              {g === 'men' ? 'For Him' : g === 'women' ? 'For Her' : g}
              <X className="w-2.5 h-2.5" />
            </button>
          ))}
          {selectedCategory.map((c) => (
            <button key={c} onClick={() => toggle(selectedCategory, c, setSelectedCategory)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1C1C] text-[#FAF8F5] text-[10px] uppercase tracking-wider font-medium capitalize">
              {c} <X className="w-2.5 h-2.5" />
            </button>
          ))}
          {showFeaturedOnly && (
            <button onClick={() => setShowFeaturedOnly(false)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#8B7355] text-[#FAF8F5] text-[10px] uppercase tracking-wider font-medium">
              New Arrivals <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        <div className="flex gap-12 pt-8 pb-20">
          {/* ── Desktop Sidebar ────────────────────────────── */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              {/* Sort */}
              <div className="mb-10">
                <h3 className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#1C1C1C] mb-4">Sort By</h3>
                <div className="space-y-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setSortBy(opt.val)}
                      className={`block text-sm w-full text-left transition-colors ${
                        sortBy === opt.val ? 'text-[#1C1C1C] font-semibold' : 'text-[#8B7355] hover:text-[#1C1C1C]'
                      }`}
                    >
                      {sortBy === opt.val && '→ '}{opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[#E8E2D9] mb-10" />
              <FilterSidebar />
            </div>
          </aside>

          {/* ── Products Grid ──────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Desktop sort bar */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <p className="text-sm text-[#8B7355]">
                {sorted.length} product{sorted.length !== 1 ? 's' : ''}
              </p>
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-medium text-[#1C1C1C] hover:text-[#8B7355] transition-colors"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  {SORT_OPTIONS.find((o) => o.val === sortBy)?.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-8 bg-white border border-[#E8E2D9] shadow-lg z-20 min-w-[180px]">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => { setSortBy(opt.val); setSortOpen(false); }}
                        className={`block w-full text-left px-5 py-3 text-[11px] uppercase tracking-wider transition-colors ${
                          sortBy === opt.val ? 'bg-[#F0EDE8] font-semibold' : 'hover:bg-[#F0EDE8]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-5 gap-y-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <div className="aspect-[3/4] bg-[#F0EDE8] animate-pulse mb-4" />
                    <div className="h-3 bg-[#E8E2D9] animate-pulse mb-2 w-3/4" />
                    <div className="h-3 bg-[#E8E2D9] animate-pulse w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <p className="text-[#8B7355] mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="text-xs uppercase tracking-widest underline text-[#1C1C1C]">
                  Retry
                </button>
              </div>
            ) : sorted.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg text-[#8B7355] mb-6">
                  {products.length === 0 ? 'No products yet' : 'No products match your filters'}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-[11px] uppercase tracking-widest font-semibold text-[#1C1C1C] border border-[#1C1C1C] px-6 py-3 hover:bg-[#1C1C1C] hover:text-[#FAF8F5] transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-5 gap-y-12">
                {sorted.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ───────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#FAF8F5] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E2D9]">
              <h2 className="text-sm uppercase tracking-widest font-semibold">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Sort */}
              <div className="mb-8">
                <h3 className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#1C1C1C] mb-4">Sort By</h3>
                <div className="space-y-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setSortBy(opt.val)}
                      className={`block text-sm w-full text-left transition-colors ${
                        sortBy === opt.val ? 'text-[#1C1C1C] font-semibold' : 'text-[#8B7355]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px bg-[#E8E2D9] mb-8" />
              <FilterSidebar />
            </div>
            <div className="px-6 py-4 border-t border-[#E8E2D9]">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3.5 bg-[#1C1C1C] text-[#FAF8F5] text-[11px] uppercase tracking-widest font-semibold"
              >
                View {sorted.length} Product{sorted.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Suspense wrapper (needed for useSearchParams) ────────────────────────────
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F5' }}>
          <div className="text-[11px] uppercase tracking-widest text-[#8B7355]">Loading…</div>
        </div>
      }
    >
      <ProductsPageInner />
    </Suspense>
  );
}