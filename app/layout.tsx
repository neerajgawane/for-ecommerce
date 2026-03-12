import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FOR - Custom T-Shirt Design",
  description: "Design your story, wear your art",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* New LittleBox-Style Navbar */}
        <Navbar />

        {children}

        {/* Footer */}
        <footer className="bg-black text-white py-12 mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-black mb-4">FOR</h3>
                <p className="text-gray-400 text-sm">Design your story, wear your art.</p>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Shop</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="/products" className="hover:text-white transition">New Arrivals</Link></li>
                  <li><Link href="/products" className="hover:text-white transition">All Products</Link></li>
                  <li><Link href="/studio" className="hover:text-white transition">Design Studio</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Company</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                  <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Support</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="/shipping" className="hover:text-white transition">Shipping</Link></li>
                  <li><Link href="/returns" className="hover:text-white transition">Returns</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
              <p>© 2026 FOR. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}