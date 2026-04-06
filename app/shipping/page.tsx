import { Truck, Package, Clock, MapPin, AlertCircle } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      <div className="border-b border-[#E8E2D9] px-5 lg:px-10 py-12 max-w-[1440px] mx-auto">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-medium">Policies</p>
        <h1 className="text-4xl lg:text-5xl text-[#1C1C1C] leading-none" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}>
          Shipping & Delivery
        </h1>
      </div>
      <div className="max-w-3xl mx-auto px-5 lg:px-10 py-12 space-y-10">
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On all prepaid orders above ₹999' },
            { icon: Clock, title: 'Standard Delivery', desc: '3–5 business days across India' },
            { icon: Package, title: 'Express Delivery', desc: '1–2 business days (additional charges)' },
            { icon: MapPin, title: 'Pan-India Coverage', desc: 'We deliver to 25,000+ PIN codes' },
          ].map((item, i) => (
            <div key={i} className="border border-[#E8E2D9] p-5">
              <item.icon className="w-5 h-5 text-[#8B7355] mb-3" />
              <h3 className="text-sm font-semibold text-[#1C1C1C] mb-1">{item.title}</h3>
              <p className="text-[13px] text-[#6B6055] font-light">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="space-y-5 text-sm text-[#4A4540] leading-relaxed font-light">
          <h2 className="text-lg text-[#1C1C1C] font-medium" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}>Shipping Details</h2>
          <p>All orders are processed within 24 hours of placement. Custom design orders may take an additional 1–2 days for printing before dispatch.</p>
          <p>Once shipped, you will receive a tracking link via email and SMS to monitor your delivery in real-time.</p>
          <p>Cash on Delivery (COD) orders carry an additional charge of ₹49.</p>
          <div className="flex items-start gap-3 border border-[#E8E2D9] bg-[#F0EDE8] p-4 mt-4">
            <AlertCircle className="w-4 h-4 text-[#8B7355] flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#6B6055]">Delivery timelines may vary during festive seasons and sale periods. We&apos;ll keep you updated via email.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
