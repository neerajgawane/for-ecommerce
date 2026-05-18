# FOR — Premium Custom T-Shirt E-Commerce Platform

**FOR** is a full-stack e-commerce platform built for Gen-Z audiences, featuring a professional **Custom Design Studio** powered by Fabric.js. Users can design both sides of a t-shirt, preview in real-time, and checkout seamlessly.

---

## ✨ Key Features

### 🎨 Custom Design Studio
- **Dual-Side Design** — Design front and back independently with per-side canvas persistence
- **Fabric.js Canvas** — Add text, upload images, resize, rotate, and position freely
- **Real-Time Mockup Preview** — Clean flat-lay t-shirt mockup with CSS mask + blend color system
- **12 Color Options** — White, Black, Navy, Charcoal, Maroon, Olive, Sky Blue, Pink, Lavender, Mustard, Coral + Custom Color picker
- **Print Area Sizing** — Auto-detects design dimensions (cm) and assigns pricing tiers (Small → Full Chest)
- **Object Containment** — Designs stay within the printable zone
- **Per-Side Undo/Redo** — Independent history stacks for front and back
- **Composite Preview** — Generates realistic t-shirt + design overlay images for cart/checkout
- **Both-Sides Pricing** — Separate print pricing per side with ₹100 surcharge for dual-sided printing

### 🛒 Shopping Experience
- **Product Catalog** — Browse curated t-shirt collections with hover image transitions
- **Wishlist** — Save products for later (persisted per user)
- **Shopping Cart** — Real-time cart with Zustand (persisted in localStorage)
- **Secure Checkout** — Address form, payment method selection (Razorpay / COD)
- **Order Tracking** — Order history with status updates

### 🔐 Authentication
- **NextAuth.js** — Google OAuth + Email/Password credentials
- **Prisma Adapter** — Session management with PostgreSQL
- **Role-Based Access** — User and Admin roles

### 🛠 Admin Panel
- Product management (CRUD)
- Order management and status updates
- Design moderation

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Prisma ORM) |
| **Authentication** | NextAuth.js (Google + Credentials) |
| **Design Engine** | Fabric.js 7 |
| **State Management** | Zustand 5 (persisted) |
| **Payments** | Razorpay SDK |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Fonts** | Playfair Display + Inter (Google Fonts) |
| **Email** | React Email + Nodemailer |
| **Cloud Storage** | Cloudinary |
| **3D Preview** | Three.js / React Three Fiber (coming soon) |

---

## 📁 Project Structure

```
for-tshirts/
├── app/
│   ├── studio/          # Custom Design Studio (Fabric.js)
│   ├── cart/             # Shopping Cart
│   ├── checkout/         # Secure Checkout
│   ├── products/         # Product Catalog
│   ├── login/            # Authentication
│   ├── signup/           # Registration
│   ├── orders/           # Order History
│   ├── wishlist/         # Saved Items
│   ├── admin/            # Admin Dashboard
│   ├── gallery/          # Design Gallery
│   ├── api/
│   │   ├── auth/         # NextAuth API routes
│   │   ├── products/     # Product CRUD API
│   │   ├── designs/      # Design save/load API
│   │   ├── orders/       # Order management API
│   │   ├── checkout/     # Checkout processing
│   │   └── wishlist/     # Wishlist API
│   └── page.tsx          # Landing Page
├── store/
│   └── cartStore.ts      # Zustand cart state
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed-products.ts  # Product seeding
├── public/
│   └── mockups/          # T-shirt mockup assets (front/back)
└── components/           # Shared UI components
```

---

## 🎨 Design Studio Architecture

### Dual-Side Canvas System

```
┌─────────────────────────────────────────────┐
│                Design Studio                 │
├──────────────┬──────────────────────────────┤
│ Left Sidebar │     Canvas Area              │
│              │  ┌────────────────────┐      │
│ • Design Side│  │  White Mockup      │      │
│   [Front|Back]│ │  + CSS Color Mask  │      │
│ • T-Shirt    │  │  + Multiply Blend  │      │
│   Color      │  │                    │      │
│ • Size/Fit   │  │  ┌──────────────┐  │      │
│ • Add Image  │  │  │ Fabric.js    │  │      │
│ • Add Text   │  │  │ Canvas       │  │      │
│              │  │  │ (Design Area)│  │      │
│              │  │  └──────────────┘  │      │
│              │  └────────────────────┘      │
├──────────────┴──────────────────────────────┤
│ State: frontDataRef ←→ backDataRef          │
│ On switch: toJSON() → save → loadFromJSON() │
└─────────────────────────────────────────────┘
```

### Mockup Rendering Pipeline

1. **Base**: White flat-lay t-shirt PNG (`tshirt-white-front.png` / `tshirt-white-back.png`)
2. **Color Layer**: CSS `mask-image` clips solid color to t-shirt silhouette
3. **Texture Layer**: Original mockup overlaid with `mix-blend-mode: multiply` for shadows
4. **Design Layer**: Fabric.js canvas positioned at print area (22% top, 19% left, 62%×55%)

### Composite Preview (for Cart)

```
Offscreen Canvas (400×500px)
├── Fill: #F0EDE8 (background)
├── Temp Canvas: fillRect(tshirtColor) → destination-in(mockup) → colored silhouette
├── Main Canvas: drawImage(coloredShirt) → multiply(mockup) → textured shirt
└── Design overlay: drawImage(fabricCanvas.toDataURL()) at print area coordinates
→ Export as JPEG (0.85 quality) for localStorage efficiency
```

---

## 💰 Pricing Model

| Component | Price |
|-----------|-------|
| Regular Fit T-Shirt | ₹399 |
| Oversized Fit T-Shirt | ₹499 |
| Print — Small (≤10cm) | ₹50 |
| Print — Medium (≤20cm) | ₹100 |
| Print — Large (≤30cm) | ₹150 |
| Print — Full Chest (≤40cm) | ₹200 |
| Both Sides Surcharge | ₹100 |
| Shipping (under ₹999) | ₹79 |
| Shipping (₹999+) | FREE |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials (for social login)

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/for-tshirts.git
cd for-tshirts

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL, auth secrets, etc.

# Generate Prisma client & run migrations
npx prisma generate
npx prisma db push

# Seed products
npx tsx prisma/seed-products.ts

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Razorpay
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."

# Cloudinary
CLOUDINARY_URL="..."
```

---

## 📝 License

This project is private and proprietary.

---

Built with ❤️ by **Neeraj Gawane**
