import { RotateCcw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      <div className="border-b border-[#E8E2D9] px-5 lg:px-10 py-12 max-w-[1440px] mx-auto">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-medium">Policies</p>
        <h1 className="text-4xl lg:text-5xl text-[#1C1C1C] leading-none" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}>
          Returns & Exchanges
        </h1>
      </div>
      <div className="max-w-3xl mx-auto px-5 lg:px-10 py-12 space-y-10">
        <div className="border border-[#E8E2D9] p-6">
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw className="w-5 h-5 text-[#8B7355]" />
            <h2 className="text-lg text-[#1C1C1C] font-medium" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}>7-Day Return Policy</h2>
          </div>
          <p className="text-sm text-[#6B6055] font-light leading-relaxed">We want you to love every purchase. If you&apos;re not completely satisfied, you can return or exchange eligible items within 7 days of delivery.</p>
        </div>

        <div className="space-y-5 text-sm text-[#4A4540] leading-relaxed font-light">
          <h3 className="text-base text-[#1C1C1C] font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-700" /> Eligible for Return</h3>
          <ul className="list-disc list-inside space-y-1.5 ml-1">
            <li>Items with original tags and packaging intact</li>
            <li>Unworn and unwashed products</li>
            <li>Size exchanges for all non-custom items</li>
            <li>Defective or damaged products (full refund)</li>
          </ul>

          <h3 className="text-base text-[#1C1C1C] font-medium flex items-center gap-2 mt-6"><XCircle className="w-4 h-4 text-red-600" /> Not Eligible for Return</h3>
          <ul className="list-disc list-inside space-y-1.5 ml-1">
            <li>Custom-designed t-shirts (made to order)</li>
            <li>Items without original tags</li>
            <li>Worn, washed, or altered items</li>
            <li>Sale items marked as &quot;Final Sale&quot;</li>
          </ul>

          <h3 className="text-base text-[#1C1C1C] font-medium mt-6">Refund Process</h3>
          <p>Once your return is received and inspected, we will process your refund within 5–7 business days. Refunds are issued to the original payment method. For COD orders, store credit will be issued.</p>

          <div className="flex items-start gap-3 border border-[#E8E2D9] bg-[#F0EDE8] p-4 mt-4">
            <AlertCircle className="w-4 h-4 text-[#8B7355] flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#6B6055]">To initiate a return, please email us at <strong>support@for-store.com</strong> with your order number and reason for return.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
