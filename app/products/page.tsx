'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  basePrice: number;
  printPrice: number;
  isFeatured: boolean;
  variants: Array<{
    id: string;
    frontImage: string;
    backImage: string;
    colorName: string;
  }>;
}

const GENDERS = ['All', 'Men', 'Women', 'Unisex'];
const CATEGORIES = ['All', 'T-Shirt', 'Hoodie', 'Sweatshirt'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState('featured');

  // UI State
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedGender, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory.toLowerCase());
      if (selectedGender !== 'All') params.append('gender', selectedGender.toLowerCase());

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const price = product.basePrice + product.printPrice;
      return price >= priceRange[0] && price <= priceRange[1];
    })
    .sort((a, b) => {
      const priceA = a.basePrice + a.printPrice;
      const priceB = b.basePrice + b.printPrice;

      switch (sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'newest':
          return 0;
        default: // featured
          return b.isFeatured ? 1 : -1;
      }
    });

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedGender('All');
    setSelectedCategory('All');
    setSelectedSizes([]);
    setPriceRange([0, 2000]);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-40 space-y-8">

              {/* Gender Filter */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3">
                  GENDER
                </h3>
                <div className="space-y-2">
                  {GENDERS.map((gender) => (
                    <label
                      key={gender}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="gender"
                        checked={selectedGender === gender}
                        onChange={() => setSelectedGender(gender)}
                        className="w-4 h-4 text-black focus:ring-black"
                      />
                      <span className="text-sm group-hover:text-gray-600 transition">
                        {gender}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3">
                  CATEGORY
                </h3>
                <div className="space-y-2">
                  {CATEGORIES.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="w-4 h-4 text-black focus:ring-black"
                      />
                      <span className="text-sm group-hover:text-gray-600 transition">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3">
                  SIZE
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-2 text-xs font-medium border transition ${selectedSizes.includes(size)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3">
                  PRICE
                </h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3">
                  SORT BY
                </h3>
                <div className="space-y-2">
                  {SORT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="sort"
                        checked={sortBy === option.value}
                        onChange={() => setSortBy(option.value)}
                        className="w-4 h-4 text-black focus:ring-black"
                      />
                      <span className="text-sm group-hover:text-gray-600 transition">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full py-2 text-sm font-medium border border-gray-300 hover:bg-black hover:text-white hover:border-black transition"
              >
                CLEAR ALL
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredProducts.length} products
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                  <p className="mt-4 text-sm text-gray-600">Loading products...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    category={product.category}
                    price={product.basePrice + product.printPrice}
                    frontImage={product.variants[0]?.frontImage || ''}
                    backImage={product.variants[0]?.backImage}
                    isFeatured={product.isFeatured}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setShowFilters(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Mobile Gender */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3">
                  GENDER
                </h3>
                <div className="space-y-2">
                  {GENDERS.map((gender) => (
                    <label key={gender} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender-mobile"
                        checked={selectedGender === gender}
                        onChange={() => setSelectedGender(gender)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Category */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3">
                  CATEGORY
                </h3>
                <div className="space-y-2">
                  {CATEGORIES.map((category) => (
                    <label key={category} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category-mobile"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Sort */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3">
                  SORT BY
                </h3>
                <div className="space-y-2">
                  {SORT_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="sort-mobile"
                        checked={sortBy === option.value}
                        onChange={() => setSortBy(option.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(false)}
              className="w-full mt-6 bg-black text-white py-3 text-sm font-semibold uppercase tracking-wide"
            >
              APPLY FILTERS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}