-- ============================================================================
-- NOVA STORE — PRODUCTION SEED DATA FOR SUPABASE
-- Single-Vendor E-Commerce Initial Dataset
-- ============================================================================

-- 1. CATEGORIES SEED
INSERT INTO public.categories (id, name, slug, description, image, icon, active, sort_order)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Electronics', 'electronics', 'Cutting-edge gadgets, audio gear, and personal devices.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', 'Laptop', true, 1),
  ('c1000000-0000-0000-0000-000000000002', 'Mobile Accessories', 'mobile-accessories', 'Premium chargers, wireless pads, and protective cases.', 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80', 'Smartphone', true, 2),
  ('c1000000-0000-0000-0000-000000000003', 'Fashion', 'fashion', 'Curated apparel, footwear, and trend-setting daily essentials.', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80', 'Shirt', true, 3),
  ('c1000000-0000-0000-0000-000000000004', 'Home & Lifestyle', 'home-lifestyle', 'Modern home decor, lighting, organizers, and comfort items.', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', 'Home', true, 4),
  ('c1000000-0000-0000-0000-000000000005', 'Kitchen', 'kitchen', 'Smart culinary tools, kettles, and kitchen accessories.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80', 'Utensils', true, 5),
  ('c1000000-0000-0000-0000-000000000006', 'Sports & Fitness', 'sports-fitness', 'Gym gear, resistance bands, and workout accessories.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80', 'Activity', true, 6),
  ('c1000000-0000-0000-0000-000000000007', 'Bags & Accessories', 'bags-accessories', 'Durable backpacks, travel bags, and leather wallets.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', 'ShoppingBag', true, 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  icon = EXCLUDED.icon,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order;

-- 2. PRODUCTS SEED
INSERT INTO public.products (
  id, slug, title, description, short_description, category_id, category_name, subcategory,
  brand, price, compare_at_price, currency, images, thumbnail, rating, review_count,
  sku, stock, stock_status, low_stock_threshold, track_inventory, allow_backorders,
  tags, featured, best_seller, new_arrival, sale, published, archived, specifications
) VALUES
(
  'a1000000-0000-0000-0000-000000000001',
  'nova-anc-wireless-headphones-pro',
  'Nova SoundPro ANC Wireless Headphones',
  'Engineered for true audiophiles and daily commuters across Pakistan. The Nova SoundPro ANC delivers up to 40dB of active noise cancellation, 45-hour battery life, fast Type-C charging, and high-resolution wireless audio codecs.',
  'Premium ANC Bluetooth headphones with 45-hour battery life and ultra-comfortable ear cushions.',
  'c1000000-0000-0000-0000-000000000001',
  'Electronics',
  'Audio',
  'NovaAudio',
  8499.00,
  11999.00,
  'PKR',
  ARRAY[
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  4.9,
  128,
  'NOVA-AUD-001',
  42,
  'in_stock',
  5,
  true,
  false,
  ARRAY['Audio', 'Bluetooth', 'Noise Cancellation', 'Headphones', 'Bestseller'],
  true,
  true,
  false,
  true,
  true,
  false,
  '[
    {"name": "Bluetooth Version", "value": "5.3 with AAC/aptX"},
    {"name": "Battery Life", "value": "45 Hours (ANC On)"},
    {"name": "Driver Size", "value": "40mm Beryllium"},
    {"name": "Charging Port", "value": "USB-C Fast Charging"}
  ]'::jsonb
),
(
  'a1000000-0000-0000-0000-000000000002',
  'nova-pulse-smartwatch-titanium',
  'Nova Pulse AMOLED Fitness Smartwatch',
  'Stay connected and monitor your health around the clock with the Nova Pulse Smartwatch. Features a vivid 1.43-inch Always-On AMOLED screen, Bluetooth calling with noise reduction microphone, heart rate, SpO2 sensor, and 100+ workout modes.',
  '1.43 inch AMOLED display smartwatch with Bluetooth calling, IP68 water resistance, and 12-day battery life.',
  'c1000000-0000-0000-0000-000000000001',
  'Electronics',
  'Wearables',
  'NovaWear',
  6499.00,
  8999.00,
  'PKR',
  ARRAY[
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  4.8,
  94,
  'NOVA-WAT-002',
  28,
  'in_stock',
  5,
  true,
  false,
  ARRAY['Smartwatch', 'Fitness', 'Wearable', 'AMOLED', 'Health'],
  true,
  true,
  true,
  true,
  true,
  false,
  '[
    {"name": "Display", "value": "1.43\" AMOLED 466x466"},
    {"name": "Battery", "value": "Up to 12 Days"},
    {"name": "Water Resistance", "value": "IP68"},
    {"name": "Compatibility", "value": "Android & iOS"}
  ]'::jsonb
),
(
  'a1000000-0000-0000-0000-000000000003',
  'nova-powercore-65w-gan-charger',
  'Nova PowerCore 65W GaN Fast Charger',
  'High efficiency Gallium Nitride (GaN) fast charger capable of powering laptops, MacBooks, tablets, and smartphones simultaneously. Features 2x USB-C PD ports and 1x USB-A QC 3.0 port with built-in surge protection.',
  '65W GaN fast charger with 3 ports, ideal for laptops, phones, and power banks.',
  'c1000000-0000-0000-0000-000000000002',
  'Mobile Accessories',
  'Chargers',
  'NovaPower',
  3499.00,
  4500.00,
  'PKR',
  ARRAY[
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
  4.9,
  82,
  'NOVA-CHG-003',
  60,
  'in_stock',
  8,
  true,
  false,
  ARRAY['Charger', 'GaN', 'Fast Charging', 'USB-C', 'Power'],
  false,
  true,
  false,
  true,
  true,
  false,
  '[
    {"name": "Output Power", "value": "65W Max Power Delivery 3.0"},
    {"name": "Ports", "value": "2x USB-C, 1x USB-A"},
    {"name": "Protection", "value": "Over-voltage, Thermal Guard"}
  ]'::jsonb
),
(
  'a1000000-0000-0000-0000-000000000004',
  'nova-heavyweight-oversized-tee',
  'Nova Minimal Heavyweight Oversized T-Shirt',
  'Crafted from 100% premium 240 GSM combed cotton. Designed for maximum breathability, relaxed drop-shoulder fit, and everyday comfort in Pakistan’s climate. Pre-shrunk and reactive dyed.',
  'Premium 240 GSM combed cotton oversized streetwear t-shirt with drop shoulders.',
  'c1000000-0000-0000-0000-000000000003',
  'Fashion',
  'Apparel',
  'NovaWear',
  1999.00,
  2800.00,
  'PKR',
  ARRAY[
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
  4.7,
  156,
  'NOVA-TSH-004',
  85,
  'in_stock',
  10,
  true,
  false,
  ARRAY['Fashion', 'T-Shirt', 'Oversized', 'Cotton', 'Summer'],
  true,
  true,
  false,
  true,
  true,
  false,
  '[
    {"name": "Fabric", "value": "100% Combed Cotton 240 GSM"},
    {"name": "Fit", "value": "Relaxed Oversized / Drop Shoulder"},
    {"name": "Care", "value": "Machine wash cold, tumble dry low"}
  ]'::jsonb
),
(
  'a1000000-0000-0000-0000-000000000005',
  'nova-ambience-smart-desk-lamp',
  'Nova Ambience Smart LED Desk Lamp with Wireless Charging Base',
  'Modern architectural desk lamp with 3 color temperatures, stepless dimming, touch slider controls, and integrated 15W Qi fast wireless charging base for your smartphone.',
  'Stepless dimming LED desk lamp with 15W fast wireless phone charging pad.',
  'c1000000-0000-0000-0000-000000000004',
  'Home & Lifestyle',
  'Lighting',
  'NovaLiving',
  4299.00,
  5800.00,
  'PKR',
  ARRAY[
    'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80'
  ],
  'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=600&q=80',
  4.8,
  63,
  'NOVA-LMP-005',
  19,
  'in_stock',
  5,
  true,
  false,
  ARRAY['Home', 'Lighting', 'Lamp', 'Wireless Charger', 'Desk Setup'],
  false,
  false,
  true,
  true,
  true,
  false,
  '[
    {"name": "Wireless Output", "value": "15W Qi Certified"},
    {"name": "Brightness", "value": "800 Lumens Max"},
    {"name": "Color Temp", "value": "3000K - 6000K (Warm to Cool)"}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  stock = EXCLUDED.stock,
  images = EXCLUDED.images,
  thumbnail = EXCLUDED.thumbnail,
  published = EXCLUDED.published;

-- 3. PRODUCT VARIANTS SEED
INSERT INTO public.product_variants (id, product_id, name, type, value, price_modifier, sku, stock)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Matte Obsidian Black', 'color', 'Obsidian Black', 0, 'NOVA-AUD-001-BLK', 25),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Arctic Silver', 'color', 'Arctic Silver', 0, 'NOVA-AUD-001-SLV', 17),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'Medium - Midnight Black', 'size', 'Medium', 0, 'NOVA-TSH-004-M-BLK', 30),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'Large - Midnight Black', 'size', 'Large', 0, 'NOVA-TSH-004-L-BLK', 35),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000004', 'XL - Midnight Black', 'size', 'XL', 0, 'NOVA-TSH-004-XL-BLK', 20)
ON CONFLICT (id) DO NOTHING;

-- 4. COUPONS SEED
INSERT INTO public.coupons (id, code, discount_type, discount_value, min_order_amount, max_discount, description, is_active)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'WELCOME10', 'percentage', 10, 2000, 1500, 'Get 10% off on your first order over Rs. 2,000!', true),
  ('e1000000-0000-0000-0000-000000000002', 'FLAT500', 'fixed', 500, 4500, null, 'Rs. 500 flat discount on orders above Rs. 4,500.', true),
  ('e1000000-0000-0000-0000-000000000003', 'NOVASAVE', 'percentage', 15, 6000, 2500, '15% Mega savings on orders over Rs. 6,000.', true)
ON CONFLICT (code) DO UPDATE SET
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  min_order_amount = EXCLUDED.min_order_amount,
  is_active = EXCLUDED.is_active;

-- 5. STORE SETTINGS SEED
INSERT INTO public.store_settings (key, value)
VALUES
  ('store_general', '{
    "storeName": "NOVA STORE",
    "storeTagline": "Quality, Delivered Across Pakistan",
    "storeEmail": "support@novastore.pk",
    "storePhone": "+92 300 0123456",
    "storeAddress": "Nova Commercial Centre, Main Boulevard, Gulberg III",
    "city": "Lahore",
    "province": "Punjab",
    "country": "Pakistan",
    "currency": "PKR",
    "currencySymbol": "Rs.",
    "locale": "en-PK",
    "supportHours": "Mon-Sat: 9am - 9pm PKT",
    "whatsappNumber": "+923000123456",
    "trackInventoryDefault": true,
    "lowStockAlertThreshold": 5
  }'::jsonb),
  ('store_shipping', '{
    "standardDeliveryFee": 250,
    "expressDeliveryFee": 450,
    "freeShippingThreshold": 3500,
    "estimatedDeliveryStandard": "2 – 4 Business Days",
    "estimatedDeliveryExpress": "1 – 2 Business Days",
    "enableFreeShipping": true,
    "allowCashOnDelivery": true,
    "citiesWithFastDelivery": ["Karachi", "Lahore", "Islamabad", "Rawalpindi"]
  }'::jsonb),
  ('store_payments', '{
    "enableCod": true,
    "enableBankTransfer": true,
    "enableCardGateway": false,
    "bankName": "Meezan Bank Limited",
    "bankAccountTitle": "NOVA COMMERCE RETAILERS",
    "bankAccountNumber": "01020304050607",
    "bankIban": "PK36MEZN0001020304050607",
    "bankBranch": "Gulberg Main Boulevard Branch (0102)",
    "codInstructions": "Pay in cash to our courier partner at your doorstep when your order arrives. Please keep exact change ready.",
    "bankTransferInstructions": "Transfer the total order amount to our business bank account above via mobile banking or ATM. Enter your Transaction Reference ID after completing payment."
  }'::jsonb),
  ('store_tax', '{
    "taxEnabled": false,
    "taxRatePercent": 0,
    "pricesIncludeTax": true,
    "taxLabel": "GST (Included)"
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value;
