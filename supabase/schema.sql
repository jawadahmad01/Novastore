-- ============================================================================
-- NOVA STORE — PRODUCTION POSTGRESQL SCHEMA FOR SUPABASE
-- Single-Vendor E-Commerce Store Architecture
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOM TYPES / ENUMS
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('CUSTOMER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.stock_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('cod', 'bank_transfer', 'card');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('Pending', 'Paid', 'Awaiting Verification', 'Failed', 'Refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.variant_type AS ENUM ('color', 'size', 'storage', 'style');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role public.user_role NOT NULL DEFAULT 'CUSTOMER',
  default_address_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Pakistan',
  province TEXT NOT NULL,
  division TEXT,
  district TEXT,
  tehsil TEXT,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  street_address TEXT NOT NULL,
  house_flat_shop_number TEXT NOT NULL,
  postal_code TEXT,
  delivery_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Circular foreign key for default address
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS fk_profiles_default_address,
  ADD CONSTRAINT fk_profiles_default_address 
  FOREIGN KEY (default_address_id) REFERENCES public.addresses(id) ON DELETE SET NULL;

-- 5. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  icon TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  subcategory TEXT,
  brand TEXT NOT NULL DEFAULT 'NOVA STORE',
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(12, 2) CHECK (compare_at_price >= 0),
  currency TEXT NOT NULL DEFAULT 'PKR',
  images TEXT[] NOT NULL DEFAULT '{}',
  thumbnail TEXT NOT NULL,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  sku TEXT NOT NULL UNIQUE,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_status public.stock_status NOT NULL DEFAULT 'in_stock',
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  track_inventory BOOLEAN NOT NULL DEFAULT TRUE,
  allow_backorders BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
  sale BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  specifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type public.variant_type NOT NULL DEFAULT 'color',
  value TEXT NOT NULL,
  price_modifier NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sku TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, sku)
);

-- 8. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type public.discount_type NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(10, 2),
  start_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  per_customer_limit INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL DEFAULT '',
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  coupon_code TEXT,
  shipping NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping >= 0),
  shipping_method TEXT NOT NULL DEFAULT 'standard',
  tax NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  currency TEXT NOT NULL DEFAULT 'PKR',
  payment_method public.payment_method NOT NULL DEFAULT 'cod',
  payment_status public.payment_status NOT NULL DEFAULT 'Pending',
  order_status public.order_status NOT NULL DEFAULT 'Pending',
  shipping_address JSONB NOT NULL,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  product_image TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL,
  variant_description TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status public.order_status,
  new_status public.order_status NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. COUPON USAGES TABLE
CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  discount_applied NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. WISHLIST ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 14. STORE SETTINGS TABLE (Key-value config)
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 15. ADMIN NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_published_stock ON public.products(published, stock_status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to check if the executing user has the ADMIN role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- Function to handle updated_at timestamps automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
DO $$ BEGIN
  CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Trigger: Automatically create public.profiles row when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role public.user_role := 'CUSTOMER';
BEGIN
  -- Grant ADMIN role automatically to official admin email
  IF NEW.email = 'admin@novastore.pk' THEN
    assigned_role := 'ADMIN';
  END IF;

  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Record order status changes automatically
CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.order_status IS DISTINCT FROM NEW.order_status) THEN
    INSERT INTO public.order_status_history (order_id, previous_status, new_status, changed_by, notes)
    VALUES (
      NEW.id,
      OLD.order_status,
      NEW.order_status,
      auth.uid(),
      'Status changed from ' || OLD.order_status || ' to ' || NEW.order_status
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_status_change();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- 2. ADDRESSES POLICIES
CREATE POLICY "Users can view their own addresses" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create their own addresses" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update their own addresses" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own addresses" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- 3. CATEGORIES POLICIES
CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (active = TRUE OR public.is_admin());

CREATE POLICY "Only admins can manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

-- 4. PRODUCTS POLICIES
CREATE POLICY "Anyone can view published, non-deleted products" ON public.products
  FOR SELECT USING ((published = TRUE AND deleted_at IS NULL) OR public.is_admin());

CREATE POLICY "Only admins can insert/update/delete products" ON public.products
  FOR ALL USING (public.is_admin());

-- 5. PRODUCT VARIANTS POLICIES
CREATE POLICY "Anyone can view variants for published products" ON public.product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_variants.product_id
      AND ((products.published = TRUE AND products.deleted_at IS NULL) OR public.is_admin())
    )
  );

CREATE POLICY "Only admins can manage product variants" ON public.product_variants
  FOR ALL USING (public.is_admin());

-- 6. COUPONS POLICIES
CREATE POLICY "Anyone can query active coupons by code" ON public.coupons
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Only admins can manage coupons" ON public.coupons
  FOR ALL USING (public.is_admin());

-- 7. ORDERS POLICIES
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Anyone can insert orders during checkout" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can update or delete orders" ON public.orders
  FOR ALL USING (public.is_admin());

-- 8. ORDER ITEMS POLICIES
CREATE POLICY "Users can view items for their orders" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Order items can be inserted with checkout order" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can manage order items" ON public.order_items
  FOR ALL USING (public.is_admin());

-- 9. ORDER STATUS HISTORY POLICIES
CREATE POLICY "Users can view status history for their orders" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage order status history" ON public.order_status_history
  FOR ALL USING (public.is_admin());

-- 10. WISHLIST ITEMS POLICIES
CREATE POLICY "Users can manage their own wishlist items" ON public.wishlist_items
  FOR ALL USING (auth.uid() = user_id);

-- 11. STORE SETTINGS POLICIES
CREATE POLICY "Anyone can view public store settings" ON public.store_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify store settings" ON public.store_settings
  FOR ALL USING (public.is_admin());

-- 12. ADMIN NOTIFICATIONS POLICIES
CREATE POLICY "Only admins can view and manage admin notifications" ON public.admin_notifications
  FOR ALL USING (public.is_admin());

-- ============================================================================
-- STORAGE BUCKETS SETUP (Supabase Storage)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('bank-receipts', 'bank-receipts', false),
  ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public Storage Read Access for assets and products
CREATE POLICY "Public images read access" ON storage.objects
  FOR SELECT USING (bucket_id IN ('product-images', 'category-images', 'store-assets'));

CREATE POLICY "Admin upload images access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'category-images', 'store-assets') AND public.is_admin());

CREATE POLICY "Admin delete images access" ON storage.objects
  FOR DELETE USING (bucket_id IN ('product-images', 'category-images', 'store-assets') AND public.is_admin());

CREATE POLICY "Customer bank receipt upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'bank-receipts');

CREATE POLICY "Admin bank receipt read" ON storage.objects
  FOR SELECT USING (bucket_id = 'bank-receipts' AND public.is_admin());
