/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  // Hero slider
  const heroSlides = [
    {
      title: "Design Your Story.",
      subtitle: "Wear Your Art.",
      description: "Create custom t-shirts with our design studio. Upload your art and bring your vision to life.",
      cta: "Start Designing",
      ctaLink: "/studio",
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&h=800&fit=crop",
    },
    {
      title: "New Arrivals",
      subtitle: "Fresh Designs",
      description: "Explore our latest collection of custom-designed t-shirts.",
      cta: "Shop Now",
      ctaLink: "/products",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop",
    },
    {
      title: "Custom Prints",
      subtitle: "Your Design, Your Style",
      description: "High-quality printing on premium t-shirts. Fast delivery guaranteed.",
      cta: "Browse Gallery",
      ctaLink: "/products",
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=800&fit=crop",
    },
  ];

  // Auto-advance slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Fetch featured products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setFeaturedProducts(data.products?.slice(0, 8) || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  // Categories
  const categories = [
    {
      name: "Men's T-Shirts",
      image: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=400&h=500&fit=crop",
      link: "/products?gender=men",
    },
    {
      name: "Women's T-Shirts",
      image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=500&fit=crop",
      link: "/products?gender=women",
    },
    {
      name: "Oversized Fit",
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=500&fit=crop",
      link: "/products?fit=oversized",
    },
    {
      name: "Custom Design",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop",
      link: "/studio",
    },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* HERO SLIDER */}
      <section className="relative h-[500px] lg:h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ${index === currentSlide
              ? 'opacity-100 translate-x-0'
              : index < currentSlide
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
              }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
            </div>

            {/* Content */}
            <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
              <div className="max-w-2xl text-white">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4">
                  {slide.title}
                </h1>
                <p className="text-4xl md:text-5xl font-black mb-6">
                  {slide.subtitle}
                </p>
                <p className="text-lg md:text-xl text-gray-200 mb-8">
                  {slide.description}
                </p>
                <Link
                  href={slide.ctaLink}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold hover:bg-gray-100 transition"
                >
                  {slide.cta}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition z-10"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition z-10"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Slider Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 transition-all ${index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 w-2 hover:bg-white/75'
                }`}
            />
          ))}
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-black text-center mb-12 uppercase tracking-wide">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={category.link}
                className="group relative aspect-[3/4] overflow-hidden"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                  <div className="flex items-center gap-2 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition">
                    Shop Now
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-wide">
                  Featured Products
                </h2>
                <p className="text-gray-600 mt-2">Ready-to-wear custom designs</p>
              </div>
              <Link
                href="/products"
                className="hidden md:flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
              >
                View All
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
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

            {/* Mobile View All Button */}
            <div className="md:hidden mt-8 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition"
              >
                View All Products
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* STATS SECTION */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-black mb-2">10K+</div>
              <div className="text-gray-400 uppercase text-sm tracking-wide">
                Designs Created
              </div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">5K+</div>
              <div className="text-gray-400 uppercase text-sm tracking-wide">
                Happy Customers
              </div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">4.8★</div>
              <div className="text-gray-400 uppercase text-sm tracking-wide">
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-black text-center mb-12 uppercase tracking-wide">
            Why Choose FOR?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">∞</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Full Customization</h3>
              <p className="text-gray-600">
                Design your t-shirt exactly how you want. Complete creative freedom.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">★</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Premium Quality</h3>
              <p className="text-gray-600">
                High-quality fabric and printing. Designed to last.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick turnaround time. Get your custom t-shirt in 5-7 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6">
            Ready to Create Your Design?
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 mb-8">
            Start designing your custom t-shirt today. It only takes a few minutes!
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black font-bold text-lg hover:bg-gray-100 transition"
          >
            Start Designing Now
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}