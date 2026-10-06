# NOVA STORE — Modern Lifestyle & Tech Essentials (Pakistan)

NOVA STORE is a single-vendor, direct-to-consumer e-commerce platform built for Pakistani shoppers. It is engineered with **React 18**, **TypeScript**, **Tailwind CSS**, and powered by a backend on **Supabase** (PostgreSQL, Supabase Auth, Row-Level Security, and Storage).

---

## 🌟 Key Architecture & Highlights

- **Single-Vendor Model**: Strictly single-vendor (NOVA STORE direct inventory). Role segregation is strictly bounded to `CUSTOMER` and `ADMIN`. No vendor/merchant marketplace complications.
- **Pakistani E-Commerce Focus**:
  - Currency: Pakistani Rupee (**PKR / Rs.**).
  - Native Payment Methods: **Cash on Delivery (COD)** and **Direct Bank Transfer** (Meezan Bank IBAN proof verification flow). Card gateway adapters prepared for future activation (e.g., PayFast, Safepay, JazzCash, EasyPaisa).
  - Address System: Standardized Pakistani provinces, major cities (Lahore, Karachi, Islamabad, etc.), areas, and phone number validation (`03XX-XXXXXXX`).
- **Supabase Backend**:
  - 13 Relational Tables with Foreign Keys, constraints, and audit triggers.
  - Strict Row Level Security (RLS) ensuring customers cannot view or modify other users' orders or elevate themselves to administrators.
  - Storage Buckets configured for `product-images`, `category-images`, `store-assets`, and secure `bank-receipts`.
- **Search Engine Optimization (SEO)**:
  - Dynamic `<SEO />` component with OpenGraph tags and Schema.org `Product` / `WebStore` JSON-LD structured data.
  - Pre-configured `robots.txt` and `sitemap.xml` with automatic crawlers indexing while shielding admin/account routes.
- **Service Integration Architecture**:
  - Notification & Email Dispatcher (`notificationService.ts`) for order confirmation, order status updates, and admin low-stock alerts.
  - Privacy-Conscious Analytics (`analyticsService.ts`) with GA4/GTM dataLayer events (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`).
  - Pakistani Courier Adapters (`courierService.ts`) for TCS, Leopards, Trax, and CallCourier.
  - HubSpot CRM / Newsletter marketing hooks (`crmService.ts`).
  - Admin Report Exporters (`exportService.ts`) for CSV/JSON analytics.

---

## ⚙️ Environment Variables Configuration

Copy `.env.example` to `.env.local` or configure in your deployment platform (Vercel, Cloudflare, Netlify):

```bash
# Public Supabase Client Config (Client-safe anon key only)
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"

# Store Information
VITE_STORE_NAME="NOVA STORE"
VITE_STORE_CURRENCY="PKR"
```

> **Security Note:** Never add the Supabase `service_role` secret to frontend environment variables. All administrator authorizations are enforced by user credentials, database JWT claims, and RLS policies.

---

## 🚀 Setup & Launch Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Database & Storage Provisioning
1. Create a new project in [Supabase](https://supabase.com).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Paste and run the SQL commands from `supabase/schema.sql` to generate all tables, triggers, and RLS policies.
4. Run `supabase/seed.sql` to populate initial categories, products with variants, discount coupons, and store settings.
5. In **Storage**, ensure the following buckets are active:
   - `product-images` (Public)
   - `category-images` (Public)
   - `store-assets` (Public)
   - `bank-receipts` (Private / Admin viewable)

### 3. Start Development Server
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 User Roles & Credentials

- **Customer Demo Account**:
  - Email: `customer@novastore.pk`
  - Password: `Password123!`
  - Role: `CUSTOMER`
- **Admin Demo Account**:
  - Email: `admin@novastore.pk`
  - Password: `Password123!`
  - Role: `ADMIN` (Access to `/admin` back office)

---

## 📦 Deployment Checklist

- [x] TypeScript compilation verified with 0 errors (`npm run lint` / `tsc --noEmit`).
- [x] Production build bundle verified with Vite (`npm run build`).
- [x] RLS policies audited: Customer cross-access and role escalation prevented.
- [x] Stock deduction and restoration synchronized on order placement/cancellation.
- [x] Robots.txt & Sitemap.xml configured.
