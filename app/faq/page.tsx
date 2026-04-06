'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  { q: 'How long does delivery take?', a: 'Standard delivery takes 3–5 business days across India. Express delivery (1–2 business days) is available at an additional charge. Custom design orders may take an extra 1–2 days for printing.' },
  { q: 'What is your return policy?', a: 'We offer a 7-day return policy for non-custom items. Items must be unworn, unwashed, and have original tags intact. Custom-designed t-shirts are not eligible for return as they are made to order.' },
  { q: 'How do I track my order?', a: 'Once your order is shipped, you will receive a tracking link via email and SMS. You can also view your order status on the "My Orders" page after signing in.' },
  { q: 'Is Cash on Delivery available?', a: 'Yes, COD is available across India with an additional charge of ₹49. Prepaid orders above ₹999 qualify for free shipping.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, and wallets through our secure Razorpay payment gateway. Cash on Delivery is also available.' },
  { q: 'How does the Design Studio work?', a: 'Our Design Studio lets you upload images, add text, choose fonts and colors, and place your design on a t-shirt mockup. You can design both front and back, choose your size and fit, and add it directly to your cart.' },
  { q: 'What is the quality of your t-shirts?', a: 'We use 100% premium combed cotton (180 GSM) for regular fit and 220 GSM for oversized fit. Our printing uses high-definition DTG (Direct to Garment) technology for vibrant, long-lasting designs.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled within 2 hours of placement, before they enter the printing stage. Please email support@for-store.com with your order number for cancellation requests.' },
  { q: 'Do you sell in bulk?', a: 'Yes! We offer bulk/corporate orders with custom branding. Please email business@for-store.com for bulk pricing and MOQ details.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use 256-bit SSL encryption for all transactions. Payments are processed securely through Razorpay and we never store your card details. Your passwords are hashed using industry-standard bcrypt encryption.' },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      <div className="border-b border-[#E8E2D9] px-5 lg:px-10 py-12 max-w-[1440px] mx-auto">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-medium">Help Center</p>
        <h1 className="text-4xl lg:text-5xl text-[#1C1C1C] leading-none" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}>
          Frequently Asked Questions
        </h1>
      </div>
      <div className="max-w-3xl mx-auto px-5 lg:px-10 py-12">
        <div className="border-t border-[#E8E2D9]">
          {FAQS.map((faq, i) => (
            <div key={i} className="border-b border-[#E8E2D9]">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left group"
              >
                <span className="text-sm font-medium text-[#1C1C1C] group-hover:text-[#8B7355] transition-colors pr-4">{faq.q}</span>
                {openIndex === i ? (
                  <ChevronUp className="w-4 h-4 text-[#8B7355] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#C8C2B8] flex-shrink-0" />
                )}
              </button>
              {openIndex === i && (
                <div className="pb-5 text-sm text-[#6B6055] font-light leading-relaxed -mt-1">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-10 text-center text-sm text-[#6B6055] font-light">
          <p>Can&apos;t find what you&apos;re looking for? Email us at <strong className="text-[#1C1C1C]">support@for-store.com</strong></p>
        </div>
      </div>
    </div>
  );
}
