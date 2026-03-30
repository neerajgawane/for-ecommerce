import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
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
      <body className={`${playfair.variable} ${inter.variable} antialiased`} style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}