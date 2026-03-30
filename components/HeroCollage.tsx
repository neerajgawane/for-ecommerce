'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const collageItems = [
  {
    label: 'For Her',
    image: '/for-her-model.png',
    link: '/products?gender=women',
    posStyle: { top: '6%', left: '3%' },
    width: '190px',
    rotate: '-3.5deg',
    labelSide: 'br' as const,
  },
  {
    label: 'For Him',
    image: '/for-him-model.png',
    link: '/products?gender=men',
    posStyle: { top: '5%', right: '3%' },
    width: '200px',
    rotate: '3deg',
    labelSide: 'bl' as const,
  },
  {
    label: 'Hoodies',
    image: '/hero-genz.png',
    link: '/products?category=hoodies',
    posStyle: { bottom: '5%', left: '5%' },
    width: '185px',
    rotate: '2.5deg',
    labelSide: 'tr' as const,
  },
  {
    label: 'New Drop',
    image: '/for-coming-soon.png',
    link: '/products',
    posStyle: { bottom: '4%', right: '4%' },
    width: '180px',
    rotate: '-2deg',
    labelSide: 'tl' as const,
  },
];

export default function HeroCollage() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: '#F5F2EC',
        height: 'clamp(540px, 72vh, 740px)',
      }}
    >
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(28,28,28,0.09) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      {/* Scattered images */}
      {collageItems.map((item) => (
        <Link
          key={item.label}
          href={item.link}
          className="absolute"
          style={{
            ...item.posStyle,
            width: item.width,
            transform: `rotate(${item.rotate})`,
            transition: 'transform 0.32s cubic-bezier(.22,1,.36,1)',
            zIndex: 2,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = 'rotate(0deg) scale(1.05)';
            el.style.zIndex = '10';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = `rotate(${item.rotate})`;
            el.style.zIndex = '2';
          }}
        >
          {/* Photo card */}
          <div
            style={{
              background: '#fff',
              padding: '5px',
              boxShadow: '0 8px 30px rgba(28,28,28,0.14)',
            }}
          >
            <img
              src={item.image}
              alt={item.label}
              style={{
                width: '100%',
                height: '215px',
                objectFit: 'cover',
                objectPosition: 'top center',
                display: 'block',
              }}
            />
          </div>

          {/* Label with arrow — each side has unique position so they never overlap */}
          <div
            className="absolute flex items-center gap-1 whitespace-nowrap"
            style={{
              ...(item.labelSide === 'br' ? { bottom: '-24px', right: '0' } : {}),
              ...(item.labelSide === 'bl' ? { bottom: '-24px', left: '0' } : {}),
              ...(item.labelSide === 'tr' ? { top: '-24px', right: '0' } : {}),
              ...(item.labelSide === 'tl' ? { top: '-24px', left: '0' } : {}),
              color: '#1C1C1C',
            }}
          >
            {(item.labelSide === 'bl' || item.labelSide === 'tl') && (
              <span style={{ fontSize: '14px', lineHeight: 1 }}>
                {item.labelSide === 'bl' ? '↘' : '↗'}
              </span>
            )}
            <span
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {item.label}
            </span>
            {(item.labelSide === 'br' || item.labelSide === 'tr') && (
              <span style={{ fontSize: '14px', lineHeight: 1 }}>
                {item.labelSide === 'br' ? '↙' : '↖'}
              </span>
            )}
          </div>
        </Link>
      ))}

      {/* Center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ zIndex: 5, pointerEvents: 'none' }}
      >
        <p
          style={{
            fontSize: '10px',
            letterSpacing: '0.42em',
            textTransform: 'uppercase',
            fontWeight: 500,
            color: '#8B7355',
            marginBottom: '14px',
          }}
        >
          Spring · 2026
        </p>

        <h1
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontWeight: 700,
            fontSize: 'clamp(68px, 10vw, 132px)',
            color: '#1C1C1C',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            margin: 0,
          }}
        >
          FRESH
        </h1>
        <h1
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontWeight: 400,
            fontStyle: 'italic',
            fontSize: 'clamp(60px, 9vw, 118px)',
            color: '#1C1C1C',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: '22px',
          }}
        >
          drops.
        </h1>

        <p
          style={{
            fontSize: '12px',
            fontWeight: 300,
            color: '#6B6055',
            lineHeight: 1.7,
            textAlign: 'center',
            maxWidth: '200px',
            marginBottom: '30px',
          }}
        >
          New prints. Bold energy.<br />Shop everything FOR.
        </p>

        <Link
          href="/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '9px',
            padding: '13px 34px',
            background: '#1C1C1C',
            color: '#FAF8F5',
            fontSize: '10px',
            letterSpacing: '0.24em',
            fontWeight: 600,
            textTransform: 'uppercase',
            pointerEvents: 'auto',
            textDecoration: 'none',
            transition: 'background 0.22s',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = '#3a3a3a')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = '#1C1C1C')
          }
        >
          Shop Now <ArrowRight size={12} />
        </Link>
      </div>
    </section>
  );
}
