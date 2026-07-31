'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

/* ─── slide data ────────────────────────────────────────────── */
interface Slide {
  image: string;
  heading: string;
  subheading: string;
  cta: string;
  link: string;
}

interface TabData {
  label: string;
  slides: Slide[];
}

const TABS: TabData[] = [
  {
    label: "Men's",
    slides: [
      {
        image: '/slides/mens-1.png',
        heading: 'For Him',
        subheading: 'New Streetwear Collection',
        cta: 'Shop Men',
        link: '/products?gender=men',
      },
      {
        image: '/slides/mens-2.png',
        heading: 'New Season',
        subheading: 'Premium Essentials',
        cta: 'Explore Now',
        link: '/products?gender=men',
      },
    ],
  },
  {
    label: "Women's",
    slides: [
      {
        image: '/slides/womens-1.png',
        heading: 'For Her',
        subheading: 'Trendy. Fresh. Essential.',
        cta: 'Shop Women',
        link: '/products?gender=women',
      },
      {
        image: '/slides/womens-2.png',
        heading: 'Bold & Beautiful',
        subheading: 'The Oversized Collection',
        cta: 'Shop Now',
        link: '/products?gender=women',
      },
    ],
  },
  {
    label: 'New Arrivals',
    slides: [
      {
        image: '/slides/newarrivals-1.png',
        heading: 'Fresh Drops',
        subheading: 'Curated For You',
        cta: 'View All',
        link: '/products?featured=true',
      },
    ],
  },
];

const AUTOPLAY_MS = 4500;

export default function HeroCollage() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSlides = TABS[activeTab].slides;
  const currentSlide = currentSlides[activeSlide];

  /* ─ Reset progress bar ─ */
  const startProgress = useCallback(() => {
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    const interval = 30; // ms
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (interval / AUTOPLAY_MS) * 100;
        return next >= 100 ? 100 : next;
      });
    }, interval);
  }, []);

  /* ─ Auto-advance slides ─ */
  const scheduleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    startProgress();
    timerRef.current = setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveSlide((prev) => {
          const nextSlide = (prev + 1) % currentSlides.length;
          // If we wrap back to 0, also advance the tab
          if (nextSlide === 0) {
            setActiveTab((prevTab) => (prevTab + 1) % TABS.length);
          }
          return nextSlide;
        });
        setIsAnimating(false);
      }, 500);
    }, AUTOPLAY_MS);
  }, [currentSlides.length, startProgress]);

  useEffect(() => {
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [activeTab, activeSlide, scheduleNext]);

  /* ─ Tab click ─ */
  const handleTabClick = (idx: number) => {
    if (idx === activeTab) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setIsAnimating(true);
    setTimeout(() => {
      setActiveTab(idx);
      setActiveSlide(0);
      setIsAnimating(false);
    }, 400);
  };

  /* ─ Prev / Next ─ */
  const goSlide = (dir: -1 | 1) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setIsAnimating(true);
    setTimeout(() => {
      setActiveSlide((prev) => {
        let next = prev + dir;
        if (next < 0) next = currentSlides.length - 1;
        if (next >= currentSlides.length) next = 0;
        return next;
      });
      setIsAnimating(false);
    }, 400);
  };

  return (
    <section className="relative w-full overflow-hidden" style={{ height: 'clamp(360px, 65vh, 720px)' }}>

      {/* ── Background image with crossfade ──────────────── */}
      <div
        className="absolute inset-0 transition-opacity duration-700 ease-in-out"
        style={{ opacity: isAnimating ? 0 : 1 }}
      >
        <img
          src={currentSlide.image}
          alt={currentSlide.heading}
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center top' }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      </div>

      {/* ── FRESH DROPS floating tag ─────────────────────── */}
      <div
        className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-20"
        style={{
          padding: '5px 16px',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '100px',
        }}
      >
        <span
          style={{
            fontSize: '9px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: '#fff',
            fontFamily: "var(--font-inter), system-ui, sans-serif",
          }}
        >
          ✦&nbsp; Fresh Drops &nbsp;✦
        </span>
      </div>

      {/* ── Tab navigation (bottom-left) ────────────────── */}
      <div className="absolute bottom-16 sm:bottom-8 left-4 sm:left-6 lg:left-12 z-20 flex items-center gap-0.5 sm:gap-1 max-w-[calc(100%-2rem)] overflow-x-auto scrollbar-none">
        {TABS.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => handleTabClick(idx)}
            className="relative px-2.5 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] lg:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-semibold transition-all duration-300 flex-shrink-0"
            style={{
              color: idx === activeTab ? '#fff' : 'rgba(255,255,255,0.55)',
              background: idx === activeTab ? 'rgba(255,255,255,0.12)' : 'transparent',
              backdropFilter: idx === activeTab ? 'blur(8px)' : 'none',
              borderRadius: '6px',
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
          >
            {tab.label}
            {/* Active tab progress bar */}
            {idx === activeTab && (
              <span
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  overflow: 'hidden',
                }}
              >
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: '#fff',
                    transition: 'width 30ms linear',
                  }}
                />
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Slide dots (bottom-center) ──────────────────── */}
      {currentSlides.length > 1 && (
        <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
          {currentSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                if (progressRef.current) clearInterval(progressRef.current);
                setIsAnimating(true);
                setTimeout(() => {
                  setActiveSlide(idx);
                  setIsAnimating(false);
                }, 400);
              }}
              className="transition-all duration-300"
              style={{
                width: idx === activeSlide ? '20px' : '6px',
                height: '6px',
                borderRadius: '100px',
                background: idx === activeSlide ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Prev / Next arrows (right side) ──────────────── */}
      {currentSlides.length > 1 && (
        <div className="absolute bottom-16 sm:bottom-8 right-4 sm:right-6 lg:right-12 z-20 flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => goSlide(-1)}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => goSlide(1)}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
            }}
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* ── Text overlay (left-aligned) ─────────────────── */}
      <div
        className="absolute inset-0 flex flex-col justify-center z-10 px-4 sm:px-6 lg:px-12"
        style={{ maxWidth: '600px' }}
      >
        <div
          className="transition-all duration-700 ease-out"
          style={{
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating ? 'translateY(30px)' : 'translateY(0)',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '16px',
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
          >
            {TABS[activeTab].label} Collection
          </p>

          <h1
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
              fontWeight: 700,
              fontSize: 'clamp(42px, 7vw, 80px)',
              color: '#fff',
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              margin: '0 0 12px 0',
            }}
          >
            {currentSlide.heading}
          </h1>

          <p
            style={{
              fontSize: 'clamp(14px, 1.5vw, 18px)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.6,
              marginBottom: '32px',
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
          >
            {currentSlide.subheading}
          </p>

          <Link
            href={currentSlide.link}
            className="inline-flex items-center gap-2 sm:gap-2.5 transition-all duration-300"
            style={{
              padding: '11px 24px',
              background: '#fff',
              color: '#1C1C1C',
              fontSize: '10px',
              letterSpacing: '0.18em',
              fontWeight: 600,
              textTransform: 'uppercase',
              textDecoration: 'none',
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#1C1C1C';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#fff';
              (e.currentTarget as HTMLElement).style.color = '#1C1C1C';
            }}
          >
            {currentSlide.cta} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
