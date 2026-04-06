export default function PrivacyPage() {
  const lastUpdated = 'April 1, 2026';

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      <div className="border-b border-[#E8E2D9] px-5 lg:px-10 py-12 max-w-[1440px] mx-auto">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-medium">Legal</p>
        <h1 className="text-4xl lg:text-5xl text-[#1C1C1C] leading-none" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}>
          Privacy Policy
        </h1>
        <p className="text-sm text-[#8B7355] mt-3 font-light">Last updated: {lastUpdated}</p>
      </div>
      <div className="max-w-3xl mx-auto px-5 lg:px-10 py-12 space-y-8 text-sm text-[#4A4540] leading-relaxed font-light">
        <section>
          <h2 className="text-lg text-[#1C1C1C] font-medium mb-3" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}>Information We Collect</h2>
          <p>We collect personal information that you provide when creating an account, placing orders, or contacting us. This includes your name, email address, phone number, shipping address, and payment details.</p>
          <p className="mt-2">We also automatically collect certain technical information, including your IP address, browser type, device information, and browsing activity on our website.</p>
        </section>

        <section>
          <h2 className="text-lg text-[#1C1C1C] font-medium mb-3" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}>How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1.5 ml-1">
            <li>To process and deliver your orders</li>
            <li>To communicate order updates, shipping notifications, and customer support</li>
            <li>To personalize your shopping experience</li>
            <li>To improve our products and services</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg text-[#1C1C1C] font-medium mb-3" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}>Data Security</h2>
          <p>We implement industry-standard security measures to protect your personal information. All payment transactions are processed through Razorpay with 256-bit SSL encryption. We do not store your credit card or debit card details on our servers.</p>
          <p className="mt-2">Your passwords are hashed using bcrypt and are never stored in plain text. We use JWT-based authentication with secure, HTTP-only session tokens.</p>
        </section>

        <section>
          <h2 className="text-lg text-[#1C1C1C] font-medium mb-3" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}>Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-1 mt-2">
            <li><strong>Razorpay</strong> — for payment processing</li>
            <li><strong>Google OAuth</strong> — for social login</li>
            <li><strong>Cloudinary</strong> — for image hosting</li>
            <li><strong>Supabase</strong> — for database hosting</li>
          </ul>
          <p className="mt-2">We do not sell or share your personal data with advertisers or marketing companies.</p>
        </section>

        <section>
          <h2 className="text-lg text-[#1C1C1C] font-medium mb-3" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}>Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data at any time. To exercise these rights, please contact us at <strong>support@for-store.com</strong>.</p>
        </section>

        <section>
          <h2 className="text-lg text-[#1C1C1C] font-medium mb-3" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}>Contact</h2>
          <p>For any privacy-related inquiries, please reach out to us at <strong>support@for-store.com</strong>.</p>
        </section>
      </div>
    </div>
  );
}
