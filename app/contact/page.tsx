import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      <div className="border-b border-[#E8E2D9] px-5 lg:px-10 py-12 max-w-[1440px] mx-auto">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-medium">Get in Touch</p>
        <h1 className="text-4xl lg:text-5xl text-[#1C1C1C] leading-none" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}>
          Contact Us
        </h1>
      </div>
      <div className="max-w-3xl mx-auto px-5 lg:px-10 py-12">
        <div className="grid sm:grid-cols-2 gap-5 mb-12">
          {[
            { icon: Mail, title: 'Email', value: 'support@for-store.com', desc: 'We reply within 24 hours' },
            { icon: Phone, title: 'Phone', value: '+91 98765 43210', desc: 'Mon–Sat, 10 AM – 6 PM' },
            { icon: MapPin, title: 'Address', value: 'Mumbai, Maharashtra', desc: 'India' },
            { icon: Clock, title: 'Business Hours', value: 'Mon – Sat', desc: '10:00 AM – 6:00 PM IST' },
          ].map((item, i) => (
            <div key={i} className="border border-[#E8E2D9] p-5">
              <item.icon className="w-5 h-5 text-[#8B7355] mb-3" />
              <h3 className="text-sm font-semibold text-[#1C1C1C] mb-1">{item.title}</h3>
              <p className="text-sm text-[#1C1C1C] font-medium">{item.value}</p>
              <p className="text-[12px] text-[#8B7355] mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-sm text-[#6B6055] font-light leading-relaxed space-y-3">
          <h2 className="text-lg text-[#1C1C1C] font-medium mb-3" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}>How can we help?</h2>
          <p>For order-related queries, please include your order number in the email subject line for faster resolution.</p>
          <p>For custom design support, bulk orders, or partnership inquiries, email us at <strong>business@for-store.com</strong>.</p>
          <p>We typically respond to all queries within 24 hours during business days.</p>
        </div>
      </div>
    </div>
  );
}
