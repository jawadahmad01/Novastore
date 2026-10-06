/**
 * NOVA STORE — SUPABASE BACKEND CONFIGURATION
 * 
 * Single-vendor store configuration for Supabase PostgreSQL, Authentication,
 * and Cloud Storage. Provides seamless fallback for local/preview development.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  tables: {
    profiles: string;
    addresses: string;
    categories: string;
    products: string;
    productVariants: string;
    orders: string;
    orderItems: string;
    orderStatusHistory: string;
    coupons: string;
    couponUsages: string;
    wishlistItems: string;
    storeSettings: string;
    adminNotifications: string;
  };
  buckets: {
    productImages: string;
    categoryImages: string;
    bankReceipts: string;
    storeAssets: string;
  };
}

const envUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const envAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

// Check if credentials are present and not default placeholders
const isValidSupabaseUrl = (url: string): boolean => {
  if (!url || url.includes("your-project-id.supabase.co") || !url.startsWith("https://")) {
    return false;
  }
  return true;
};

const isValidAnonKey = (key: string): boolean => {
  if (!key || key.includes("your-supabase-anon-key") || key.length < 20) {
    return false;
  }
  return true;
};

const isConfigured = isValidSupabaseUrl(envUrl) && isValidAnonKey(envAnonKey);

export const supabaseConfig: SupabaseConfig = {
  url: isConfigured ? envUrl : "https://placeholder-novastore.supabase.co",
  anonKey: isConfigured ? envAnonKey : "placeholder-anon-key",
  isConfigured,
  tables: {
    profiles: "profiles",
    addresses: "addresses",
    categories: "categories",
    products: "products",
    productVariants: "product_variants",
    orders: "orders",
    orderItems: "order_items",
    orderStatusHistory: "order_status_history",
    coupons: "coupons",
    couponUsages: "coupon_usages",
    wishlistItems: "wishlist_items",
    storeSettings: "store_settings",
    adminNotifications: "admin_notifications",
  },
  buckets: {
    productImages: "product-images",
    categoryImages: "category-images",
    bankReceipts: "bank-receipts",
    storeAssets: "store-assets",
  },
};

/**
 * Returns diagnostic details about Supabase environment status
 */
export const getSupabaseStatus = () => {
  return {
    isConfigured: supabaseConfig.isConfigured,
    url: supabaseConfig.url,
    hasUrl: !!envUrl,
    hasAnonKey: !!envAnonKey,
    mode: supabaseConfig.isConfigured ? "supabase_live" : "local_storage_fallback",
  };
};
