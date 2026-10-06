# NOVA STORE — Supabase Backend Integration (Step 7)

This directory contains the production PostgreSQL schema, Row Level Security (RLS) policies, and seed data for **NOVA STORE** (Single-Vendor E-Commerce Store for Pakistan).

---

## 1. Quick Setup Instructions

### Step 1: Create a Supabase Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project (e.g., `nova-store-pk`).
3. Choose a region closest to your primary user base (e.g., `ap-south-1` Mumbai / Singapore).

### Step 2: Apply the PostgreSQL Schema
1. In your Supabase project dashboard, navigate to the **SQL Editor**.
2. Click **New Query**.
3. Copy the full contents of `supabase/schema.sql` and run the query.
4. Verify that all 13 tables, custom enums, RLS policies, triggers, and storage buckets were created.

### Step 3: Run the Seed Data
1. Open a new query in the **SQL Editor**.
2. Copy the full contents of `supabase/seed.sql` and execute it.
3. This populates categories, initial products with variants/specifications, Pakistani coupons, and store settings.

### Step 4: Configure Environment Variables
In your app root directory or hosting environment, set the following environment variables:

```bash
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

---

## 2. Security & Role Architecture

NOVA STORE is a **single-vendor** store with two strictly defined user roles:
- `CUSTOMER`: Can browse products, manage their personal profile, saved addresses, wishlist, and view their own orders.
- `ADMIN`: Has full CRUD permissions over products, categories, coupons, orders, inventory, settings, and notifications.

### Creating the First Admin User
When a user signs up with the official admin email (`admin@novastore.pk`), the trigger `handle_new_user` automatically assigns the `ADMIN` role.

Alternatively, you can promote any authenticated user to admin via SQL:
```sql
UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'your-admin-email@novastore.pk';
```

---

## 3. Storage Buckets
The schema configures the following storage buckets:
- `product-images` (Public): Product gallery photos and thumbnails.
- `category-images` (Public): Category card banner images.
- `store-assets` (Public): Logos, banners, hero visuals.
- `bank-receipts` (Private): Payment proof screenshots uploaded by customers for bank transfer orders. Accessible only by Store Admins and the uploading customer.
