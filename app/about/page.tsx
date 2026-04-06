import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const values = [
    { num: '01', title: 'Craftsmanship', desc: 'Every piece is made with meticulous attention to detail, using premium fabrics and printing techniques that stand the test of time.' },
    { num: '02', title: 'Self-Expression', desc: 'We believe clothing is a canvas. Our platform empowers you to design t-shirts that tell your unique story.' },
    { num: '03', title: 'Sustainability', desc: 'We source responsibly, minimize waste, and believe that quality over quantity is the future of fashion.' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      {/* Hero */}
      <div className="bg-[#1C1C1C] py-20 lg:py-28 px-5 lg:px-10">
        <div className="max-w-[1440px] mx-auto">
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#8B7355] mb-4 font-medium">Our Story</p>
          <h1
            className="text-5xl lg:text-6xl text-[#FAF8F5] leading-[1.1] max-w-2xl"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
          >
            Design your story, <em>wear your art.</em>
          </h1>
          <p className="text-base text-[#A09485] mt-6 max-w-xl leading-relaxed font-light">
            FOR was born from a simple idea — that everyone has a story worth wearing. We combine premium quality with creative freedom to help you express yourself through custom apparel.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-20 px-5 lg:px-10 max-w-[1440px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <p className="text-[11px] tracking-[0.25em] uppercase text-[#8B7355] mb-3 font-medium">Our Mission</p>
            <h2
              className="text-3xl lg:text-4xl text-[#1C1C1C] leading-tight mb-6"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
            >
              Making custom apparel accessible to everyone
            </h2>
          </div>
          <div className="space-y-4 text-[#6B6055] text-base leading-relaxed font-light">
            <p>We believe that fashion should be personal. That&apos;s why we built FOR — a platform that puts the power of design in your hands, regardless of your design experience.</p>
            <p>From our design studio to our premium printing process, every step is crafted to ensure you get exactly what you envision. No compromises on quality, no limits on creativity.</p>
            <p>Based in India, we&apos;re committed to delivering exceptional custom apparel with fast shipping across the country.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-5 lg:px-10" style={{ background: '#F0EDE8' }}>
        <div className="max-w-[1440px] mx-auto">
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#8B7355] mb-3 font-medium text-center">What We Stand For</p>
          <h2
            className="text-3xl lg:text-4xl text-[#1C1C1C] leading-tight mb-14 text-center"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
          >
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
            {values.map((v) => (
              <div key={v.num}>
                <span className="text-[11px] tracking-[0.3em] text-[#8B7355] uppercase font-semibold block mb-4">{v.num}</span>
                <h3
                  className="text-xl text-[#1C1C1C] mb-3 leading-snug"
                  style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
                >
                  {v.title}
                </h3>
                <p className="text-sm text-[#6B6055] leading-relaxed font-light">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5 lg:px-10" style={{ background: '#FAF8F5' }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#8B7355] mb-4 font-medium">Join us</p>
          <h2
            className="text-4xl lg:text-5xl text-[#1C1C1C] mb-6 leading-[1.1]"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
          >
            Ready to create <em>your story?</em>
          </h2>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2.5 px-10 py-4 text-xs tracking-[0.18em] uppercase font-semibold bg-[#1C1C1C] text-[#FAF8F5] hover:bg-[#333] transition-colors duration-300"
          >
            Open Design Studio <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}