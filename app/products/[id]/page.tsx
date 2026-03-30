'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Heart, Star, Minus, Plus, ChevronDown, ChevronUp, Truck, RotateCcw, X, Ruler, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface ProductVariant {
  id: string;
  productId: string;
  color: string;
  colorName: string;
  size: string;
  frontImage: string;
  backImage: string;
  stock: number;
  sku: string;
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
  stockCount: number;
  variants: ProductVariant[];
}

// Default sizes if no variants
const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// Size chart data
const SIZE_CHART_DATA = {
  inches: [
    { size: 'S', chest: '36', length: '27', shoulder: '16.5', sleeve: '8' },
    { size: 'M', chest: '38', length: '28', shoulder: '17', sleeve: '8.5' },
    { size: 'L', chest: '40', length: '29', shoulder: '17.5', sleeve: '9' },
    { size: 'XL', chest: '42', length: '30', shoulder: '18', sleeve: '9.5' },
    { size: 'XXL', chest: '44', length: '31', shoulder: '18.5', sleeve: '10' },
  ],
  cm: [
    { size: 'S', chest: '91', length: '69', shoulder: '42', sleeve: '20' },
    { size: 'M', chest: '97', length: '71', shoulder: '43', sleeve: '22' },
    { size: 'L', chest: '102', length: '74', shoulder: '44.5', sleeve: '23' },
    { size: 'XL', chest: '107', length: '76', shoulder: '45.5', sleeve: '24' },
    { size: 'XXL', chest: '112', length: '79', shoulder: '47', sleeve: '25' },
  ],
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [sizeUnit, setSizeUnit] = useState<'inches' | 'cm'>('inches');
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const WISHLIST_KEY = 'for-wishlist';

  // Check localStorage on mount
  useEffect(() => {
    if (!product) return;
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      const items: { id: string }[] = raw ? JSON.parse(raw) : [];
      setWishlistAdded(items.some((i) => i.id === product.id));
    } catch {
      // ignore
    }
  }, [product]);

  // Accordion states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    description: false,
    specifications: false,
    returns: false,
    shipping: false,
  });

  const addItem = useCartStore((state) => state.addItem);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);

        // Auto-select first color if available
        if (data.variants && data.variants.length > 0) {
          const firstColor = data.variants[0].color;
          setSelectedColor(firstColor);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  // Get unique colors from variants
  const availableColors = Array.from(
    new Map(
      (product?.variants || []).map((v) => [v.color, { color: v.color, colorName: v.colorName }])
    ).values()
  );

  // Get available sizes for selected color
  const availableSizes = selectedColor
    ? product?.variants
        ?.filter((v) => v.color === selectedColor)
        ?.map((v) => v.size) || []
    : DEFAULT_SIZES;

  // If no variants, use default sizes
  const displaySizes = availableSizes.length > 0 ? availableSizes : DEFAULT_SIZES;

  // Get current variant based on selected color and size
  const currentVariant = product?.variants?.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const stock = currentVariant?.stock ?? product?.stockCount ?? 50;
  const isOutOfStock = selectedSize && selectedColor ? stock === 0 : false;

  // Check if an image URL is valid (not a missing placeholder)
  const isValidImage = (url: string) => {
    return url && url !== '/placeholder.png' && !url.endsWith('placeholder.png');
  };

  // Get images from selected variant or use fallbacks
  const getDisplayImages = () => {
    const filterImages = (imgs: (string | undefined)[]) => imgs.filter((img): img is string => !!img && !!isValidImage(img));

    if (currentVariant) {
      return filterImages([currentVariant.frontImage, currentVariant.backImage]);
    }
    // If we have a selected color, try to get any variant with that color
    if (selectedColor && product?.variants) {
      const colorVariant = product.variants.find((v) => v.color === selectedColor);
      if (colorVariant) {
        return filterImages([colorVariant.frontImage, colorVariant.backImage]);
      }
    }
    // Fallback: use first variant images
    if (product?.variants && product.variants.length > 0) {
      return filterImages([product.variants[0].frontImage, product.variants[0].backImage]);
    }
    return [];
  };

  const displayImages = getDisplayImages();

  // Toggle accordion section
  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize('');
    setSelectedImage(0);
    setAddedToCart(false);
  };

  // Handle size selection
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setAddedToCart(false);
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    if (!product) return;
    if (isOutOfStock) {
      alert('This item is out of stock');
      return;
    }

    const image = currentVariant?.frontImage || displayImages[0] || '';
    const colorName = currentVariant?.colorName || availableColors.find(c => c.color === selectedColor)?.colorName || selectedColor || 'Default';

    addItem({
      id: `${product.id}-${selectedColor || 'default'}-${selectedSize}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      image: image,
      color: colorName,
      size: selectedSize,
      quantity: quantity,
      basePrice: product.basePrice,
      printPrice: product.printPrice || 0,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Buy now handler
  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    handleAddToCart();
    setTimeout(() => {
      router.push('/cart');
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/products" className="text-sm uppercase tracking-wider underline underline-offset-4 hover:text-gray-600 transition">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = product.basePrice + (product.printPrice || 0);

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Back button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to products</span>
          </Link>
        </div>

        {/* Product detail */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {/* Left: Images */}
            <div className="relative">
              {/* Main image */}
              <div className="aspect-[3/4] bg-gray-50 rounded-sm mb-3 relative overflow-hidden group">
                {displayImages[selectedImage] ? (
                  <img
                    src={displayImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                {/* Wishlist button */}
                <button
                  onClick={() => {
                    if (!product) return;
                    try {
                      const raw = localStorage.getItem(WISHLIST_KEY);
                      const items: { id: string; name: string; category: string; price: number; image?: string; addedAt: number }[] = raw ? JSON.parse(raw) : [];
                      const exists = items.some((i) => i.id === product.id);
                      let updated;
                      if (exists) {
                        updated = items.filter((i) => i.id !== product.id);
                      } else {
                        updated = [...items, {
                          id: product.id,
                          name: product.name,
                          category: product.category,
                          price: product.basePrice + (product.printPrice || 0),
                          image: displayImages[0] || undefined,
                          addedAt: Date.now(),
                        }];
                      }
                      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
                      setWishlistAdded(!exists);
                    } catch {
                      // ignore
                    }
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition shadow-sm"
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${wishlistAdded ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                  />
                </button>
                {/* Navigation arrows for images */}
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : displayImages.length - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelectedImage(selectedImage < displayImages.length - 1 ? selectedImage + 1 : 0)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm rotate-180"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail images */}
              {displayImages.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-16 rounded-sm overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-black' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} view ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product info */}
            <div className="flex flex-col">
              {/* Category */}
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-2">
                {product.category}
              </p>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-1">
                <span className="text-2xl font-bold">₹{totalPrice}</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Inclusive of all taxes</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : i < 5 ? 'fill-yellow-400/50 text-yellow-400/50' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">4.5 (128 reviews)</span>
              </div>

              {/* Free shipping banner */}
              <div className="bg-green-50 border border-green-200 rounded-md px-4 py-2.5 mb-6 flex items-center gap-2">
                <Truck className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-800 font-medium">Free shipping on all prepaid orders</span>
              </div>

              {/* Size selection */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold uppercase tracking-wider">
                    Size{selectedSize && <span className="font-normal text-gray-500 ml-2 normal-case tracking-normal">— {selectedSize}</span>}
                  </p>
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="text-xs uppercase tracking-wider underline underline-offset-4 text-gray-500 hover:text-black transition-colors flex items-center gap-1"
                  >
                    <Ruler className="h-3 w-3" />
                    Size Chart
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {displaySizes.map((size) => {
                    const sizeVariant = product.variants?.find(
                      (v) => v.color === selectedColor && v.size === size
                    );
                    const sizeOutOfStock = sizeVariant ? sizeVariant.stock === 0 : false;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => !sizeOutOfStock && handleSizeSelect(size)}
                        disabled={sizeOutOfStock}
                        className={`min-w-[48px] h-12 px-3 border rounded-sm text-sm font-medium transition-all relative ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : sizeOutOfStock
                              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                              : 'border-gray-300 hover:border-black text-gray-800'
                        }`}
                      >
                        {size}
                        {sizeOutOfStock && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-[calc(100%+4px)] h-px bg-gray-300 rotate-[-45deg] absolute" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color selection */}
              {availableColors.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-wider mb-3">
                    Color
                    {selectedColor && (
                      <span className="font-normal text-gray-500 ml-2 normal-case tracking-normal">
                        — {availableColors.find((c) => c.color === selectedColor)?.colorName || selectedColor}
                      </span>
                    )}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {availableColors.map((colorObj) => (
                      <button
                        key={colorObj.color}
                        type="button"
                        onClick={() => handleColorSelect(colorObj.color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all relative flex items-center justify-center ${
                          selectedColor === colorObj.color
                            ? 'border-black scale-110'
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                        title={colorObj.colorName}
                      >
                        <span
                          className="w-7 h-7 rounded-full block"
                          style={{
                            backgroundColor: colorObj.color,
                            border: colorObj.color === '#FFFFFF' ? '1px solid #e5e7eb' : 'none',
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wider mb-3">Quantity</p>
                <div className="flex items-center border border-gray-300 rounded-sm w-fit">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2.5 hover:bg-gray-50 transition"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-5 py-2.5 font-medium text-sm min-w-[50px] text-center border-l border-r border-gray-300">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    className="px-3 py-2.5 hover:bg-gray-50 transition"
                    disabled={quantity >= stock}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 mb-8">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-4 rounded-sm text-sm font-semibold uppercase tracking-[0.15em] transition-all border-2 ${
                    addedToCart
                      ? 'bg-green-600 text-white border-green-600'
                      : isOutOfStock
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-black border-black hover:bg-gray-50'
                  }`}
                >
                  {addedToCart ? '✓ Added to Cart' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full bg-black text-white py-4 rounded-sm text-sm font-semibold uppercase tracking-[0.15em] hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  Buy It Now
                </button>
              </div>

              {/* Info banners */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-green-50 border border-green-100 rounded-md px-3 py-3 flex items-start gap-2">
                  <RotateCcw className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-green-800">Easy Returns</p>
                    <p className="text-[10px] text-green-600 mt-0.5">7-day return policy</p>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-md px-3 py-3 flex items-start gap-2">
                  <Truck className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-green-800">Fast Delivery</p>
                    <p className="text-[10px] text-green-600 mt-0.5">3-5 business days</p>
                  </div>
                </div>
              </div>

              {/* Collapsible sections */}
              <div className="border-t">
                {/* Description */}
                <div className="border-b">
                  <button
                    onClick={() => toggleSection('description')}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-sm font-semibold uppercase tracking-wider">Description</span>
                    {openSections.description ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  {openSections.description && (
                    <div className="pb-4 text-sm text-gray-600 leading-relaxed">
                      {product.description || `Premium quality ${product.category} made with 100% cotton fabric. Comfortable fit perfect for everyday wear. Features a clean, minimalist design that pairs well with any style.`}
                    </div>
                  )}
                </div>

                {/* Specifications */}
                <div className="border-b">
                  <button
                    onClick={() => toggleSection('specifications')}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-sm font-semibold uppercase tracking-wider">Specifications</span>
                    {openSections.specifications ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  {openSections.specifications && (
                    <div className="pb-4 space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Category</span>
                        <span className="font-medium capitalize">{product.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Color</span>
                        <span className="font-medium">
                          {availableColors.find((c) => c.color === selectedColor)?.colorName || 'Multiple'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Fabric</span>
                        <span className="font-medium">100% Cotton</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Fit</span>
                        <span className="font-medium capitalize">{product.fit || 'Regular'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Gender</span>
                        <span className="font-medium capitalize">{product.gender || 'Unisex'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Stitch</span>
                        <span className="font-medium">Ready to wear</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Easy Returns */}
                <div className="border-b">
                  <button
                    onClick={() => toggleSection('returns')}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-sm font-semibold uppercase tracking-wider">Easy Returns</span>
                    {openSections.returns ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  {openSections.returns && (
                    <div className="pb-4 text-sm text-gray-600 leading-relaxed space-y-2">
                      <p>Eligible for exchange/return under 7-day return policy.</p>
                      <p>Avail store credits on returns.</p>
                      <p className="text-xs text-gray-400">T&C Applied*</p>
                    </div>
                  )}
                </div>

                {/* Shipping */}
                <div className="border-b">
                  <button
                    onClick={() => toggleSection('shipping')}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-sm font-semibold uppercase tracking-wider">Shipping & Delivery</span>
                    {openSections.shipping ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  {openSections.shipping && (
                    <div className="pb-4 text-sm text-gray-600 leading-relaxed space-y-2">
                      <p>Free shipping on all prepaid orders.</p>
                      <p>Standard delivery: 3-5 business days.</p>
                      <p>Express delivery: 1-2 business days (additional charges apply).</p>
                      <p>Cash on Delivery available (₹49 extra).</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSizeChart(false)}
          />
          <div className="relative bg-white rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold uppercase tracking-wider">Size Chart</h2>
              <button
                onClick={() => setShowSizeChart(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Unit toggle */}
            <div className="px-6 pt-4">
              <div className="inline-flex border border-gray-300 rounded-sm overflow-hidden">
                <button
                  onClick={() => setSizeUnit('inches')}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                    sizeUnit === 'inches'
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Inches
                </button>
                <button
                  onClick={() => setSizeUnit('cm')}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                    sizeUnit === 'cm'
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  CM
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="px-6 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Size</th>
                    <th className="text-center py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Chest</th>
                    <th className="text-center py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Length</th>
                    <th className="text-center py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Shoulder</th>
                    <th className="text-center py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Sleeve</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART_DATA[sizeUnit].map((row) => (
                    <tr key={row.size} className="border-b last:border-b-0">
                      <td className="py-3 font-semibold">{row.size}</td>
                      <td className="py-3 text-center text-gray-600">{row.chest}</td>
                      <td className="py-3 text-center text-gray-600">{row.length}</td>
                      <td className="py-3 text-center text-gray-600">{row.shoulder}</td>
                      <td className="py-3 text-center text-gray-600">{row.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* How to measure */}
            <div className="px-6 pb-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">How to Measure</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p><span className="font-medium text-gray-700">Chest:</span> Measure around the fullest part of your chest.</p>
                <p><span className="font-medium text-gray-700">Length:</span> Measure from the highest point of the shoulder to the bottom hem.</p>
                <p><span className="font-medium text-gray-700">Shoulder:</span> Measure from one shoulder edge to the other.</p>
                <p><span className="font-medium text-gray-700">Sleeve:</span> Measure from shoulder seam to the end of sleeve.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}