/**
 * Centralized TypeScript Type Definitions
 * Designed for Supabase compatibility and clean domain boundary segregation.
 */

export type ProductCategory = 
  | "Electronics"
  | "Mobile Accessories"
  | "Home & Lifestyle"
  | "Fashion"
  | "Beauty & Personal Care"
  | "Kitchen"
  | "Sports & Fitness"
  | "Bags & Accessories"
  | "Apparel"
  | "Accessories";

export type StockStatusType = "in_stock" | "low_stock" | "out_of_stock";

export interface ProductVariant {
  id: string;
  name: string;
  type: "color" | "size" | "storage" | "style";
  value: string;
  priceModifier?: number; // Added or subtracted from base price
  sku: string;
  stock: number;
  image?: string;
}

export interface ProductSpecification {
  group?: string;
  name: string;
  value: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  userCity?: string;
  rating: number; // 1 to 5
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  category: ProductCategory | string;
  subcategory?: string;
  brand: string;
  price: number; // In PKR integer (e.g. 4999)
  compareAtPrice?: number; // Original price before discount
  currency: string;
  images: string[];
  thumbnail: string;
  rating: number; // e.g. 4.8
  reviewCount: number;
  sku: string;
  stock: number;
  stockStatus: StockStatusType;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  allowBackorders?: boolean;
  tags: string[];
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  sale: boolean;
  published?: boolean;
  archived?: boolean;
  deletedAt?: string;
  specifications: ProductSpecification[];
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  active: boolean;
  sortOrder?: number;
  productCount?: number;
  createdAt?: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number; // e.g., 10 for 10% or 500 for Rs. 500
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate?: string;
  expiryDate?: string;
  usageLimit?: number;
  usedCount?: number;
  perCustomerLimit?: number;
  description: string;
  isActive: boolean;
  createdAt?: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  city: string;
  province: string;
  country: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  supportHours: string;
  facebookUrl?: string;
  instagramUrl?: string;
  whatsappNumber?: string;
  trackInventoryDefault: boolean;
  lowStockAlertThreshold: number;
}

export interface ShippingSettings {
  standardDeliveryFee: number;
  expressDeliveryFee: number;
  freeShippingThreshold: number;
  estimatedDeliveryStandard: string;
  estimatedDeliveryExpress: string;
  enableFreeShipping: boolean;
  allowCashOnDelivery: boolean;
  citiesWithFastDelivery: string[];
}

export interface PaymentSettings {
  enableCod: boolean;
  enableBankTransfer: boolean;
  enableCardGateway: boolean; // Coming soon placeholder
  bankName: string;
  bankAccountTitle: string;
  bankAccountNumber: string;
  bankIban: string;
  bankBranch: string;
  codInstructions: string;
  bankTransferInstructions: string;
}

export interface TaxSettings {
  taxEnabled: boolean;
  taxRatePercent: number;
  pricesIncludeTax: boolean;
  taxLabel: string;
}

export interface CartItem {
  id: string; // unique item key (productId + variantId)
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  price: number; // final unit price with variant modifier
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  appliedCoupon?: Coupon;
  shipping: number;
  tax: number;
  total: number;
}

export interface Address {
  id?: string;
  label?: string; // e.g. "Home", "Office", "Default"
  isDefault?: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string; // e.g. "Pakistan"
  province: string; // e.g. "Khyber Pakhtunkhwa", "Punjab", etc.
  division?: string; // e.g. "Malakand Division", "Lahore Division"
  district?: string; // e.g. "Lower Dir", "Lahore"
  tehsil?: string; // e.g. "Samar Bagh", "Model Town"
  city: string; // District/Tehsil city name for courier compatibility
  area: string; // Area / Locality / Sector / Colony
  streetAddress: string; // Address Line (e.g. Street 4, Block C)
  houseFlatShopNumber: string; // House/Flat/Shop Number
  postalCode?: string; // Postal code
  deliveryInstructions?: string;
}

export type PaymentMethodType = "cod" | "bank_transfer" | "card";

export type PaymentStatus = 
  | "Pending"
  | "Paid"
  | "Awaiting Verification"
  | "Failed"
  | "Refunded";

export type OrderStatus = 
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  sku: string;
  variantDescription?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    userId?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  shippingMethod: "standard" | "express";
  tax: number;
  total: number;
  currency: string;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: Address;
  paymentReference?: string; // For bank transfer proof
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "CUSTOMER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
  defaultAddress?: Address;
  savedAddresses?: Address[];
  createdAt: string;
}

export interface FilterState {
  category?: ProductCategory | "All";
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: "all" | "in_stock" | "low_stock" | "sale";
  sortBy?: SortOption;
  searchQuery?: string;
  tag?: string;
}

export type SortOption = 
  | "featured"
  | "popularity"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "highest_rated"
  | "bestselling";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
  duration?: number;
}
