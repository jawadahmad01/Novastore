/**
 * NOVA STORE — SUPABASE DATABASE TYPE DEFINITIONS
 * 
 * Strict TypeScript representation of the PostgreSQL schema tables,
 * columns, relationships, views, and stored functions.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRoleDb = "CUSTOMER" | "ADMIN";
export type StockStatusDb = "in_stock" | "low_stock" | "out_of_stock";
export type DiscountTypeDb = "percentage" | "fixed";
export type PaymentMethodDb = "cod" | "bank_transfer" | "card";
export type PaymentStatusDb = "Pending" | "Paid" | "Awaiting Verification" | "Failed" | "Refunded";
export type OrderStatusDb = "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
export type VariantTypeDb = "color" | "size" | "storage" | "style";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; // references auth.users
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          role: UserRoleDb;
          default_address_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          role?: UserRoleDb;
          default_address_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          role?: UserRoleDb;
          default_address_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          is_default: boolean;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          province: string;
          city: string;
          area: string;
          street_address: string;
          house_flat_shop_number: string;
          postal_code: string | null;
          country: string;
          delivery_instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          is_default?: boolean;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          province: string;
          city: string;
          area: string;
          street_address: string;
          house_flat_shop_number: string;
          postal_code?: string | null;
          country?: string;
          delivery_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string | null;
          is_default?: boolean;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          province?: string;
          city?: string;
          area?: string;
          street_address?: string;
          house_flat_shop_number?: string;
          postal_code?: string | null;
          country?: string;
          delivery_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image: string | null;
          icon: string | null;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image?: string | null;
          icon?: string | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image?: string | null;
          icon?: string | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          short_description: string;
          category_id: string | null;
          category_name: string;
          subcategory: string | null;
          brand: string;
          price: number;
          compare_at_price: number | null;
          currency: string;
          images: string[];
          thumbnail: string;
          rating: number;
          review_count: number;
          sku: string;
          stock: number;
          stock_status: StockStatusDb;
          low_stock_threshold: number;
          track_inventory: boolean;
          allow_backorders: boolean;
          tags: string[];
          featured: boolean;
          best_seller: boolean;
          new_arrival: boolean;
          sale: boolean;
          published: boolean;
          archived: boolean;
          deleted_at: string | null;
          specifications: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description: string;
          short_description?: string;
          category_id?: string | null;
          category_name: string;
          subcategory?: string | null;
          brand: string;
          price: number;
          compare_at_price?: number | null;
          currency?: string;
          images?: string[];
          thumbnail: string;
          rating?: number;
          review_count?: number;
          sku: string;
          stock?: number;
          stock_status?: StockStatusDb;
          low_stock_threshold?: number;
          track_inventory?: boolean;
          allow_backorders?: boolean;
          tags?: string[];
          featured?: boolean;
          best_seller?: boolean;
          new_arrival?: boolean;
          sale?: boolean;
          published?: boolean;
          archived?: boolean;
          deleted_at?: string | null;
          specifications?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          short_description?: string;
          category_id?: string | null;
          category_name?: string;
          subcategory?: string | null;
          brand?: string;
          price?: number;
          compare_at_price?: number | null;
          currency?: string;
          images?: string[];
          thumbnail?: string;
          rating?: number;
          review_count?: number;
          sku?: string;
          stock?: number;
          stock_status?: StockStatusDb;
          low_stock_threshold?: number;
          track_inventory?: boolean;
          allow_backorders?: boolean;
          tags?: string[];
          featured?: boolean;
          best_seller?: boolean;
          new_arrival?: boolean;
          sale?: boolean;
          published?: boolean;
          archived?: boolean;
          deleted_at?: string | null;
          specifications?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          type: VariantTypeDb;
          value: string;
          price_modifier: number;
          sku: string;
          stock: number;
          image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          type: VariantTypeDb;
          value: string;
          price_modifier?: number;
          sku: string;
          stock?: number;
          image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          type?: VariantTypeDb;
          value?: string;
          price_modifier?: number;
          sku?: string;
          stock?: number;
          image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: DiscountTypeDb;
          discount_value: number;
          min_order_amount: number;
          max_discount: number | null;
          start_date: string | null;
          expiry_date: string | null;
          usage_limit: number | null;
          used_count: number;
          per_customer_limit: number;
          description: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type?: DiscountTypeDb;
          discount_value: number;
          min_order_amount?: number;
          max_discount?: number | null;
          start_date?: string | null;
          expiry_date?: string | null;
          usage_limit?: number | null;
          used_count?: number;
          per_customer_limit?: number;
          description?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_type?: DiscountTypeDb;
          discount_value?: number;
          min_order_amount?: number;
          max_discount?: number | null;
          start_date?: string | null;
          expiry_date?: string | null;
          usage_limit?: number | null;
          used_count?: number;
          per_customer_limit?: number;
          description?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coupon_usages: {
        Row: {
          id: string;
          coupon_id: string;
          user_id: string | null;
          order_id: string;
          discount_applied: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          coupon_id: string;
          user_id?: string | null;
          order_id: string;
          discount_applied: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          coupon_id?: string;
          user_id?: string | null;
          order_id?: string;
          discount_applied?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          customer_first_name: string;
          customer_last_name: string;
          customer_email: string;
          customer_phone: string;
          subtotal: number;
          discount: number;
          coupon_code: string | null;
          shipping: number;
          shipping_method: string;
          tax: number;
          total: number;
          currency: string;
          payment_method: PaymentMethodDb;
          payment_status: PaymentStatusDb;
          order_status: OrderStatusDb;
          shipping_address: Json;
          payment_reference: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          customer_first_name: string;
          customer_last_name: string;
          customer_email: string;
          customer_phone: string;
          subtotal: number;
          discount?: number;
          coupon_code?: string | null;
          shipping?: number;
          shipping_method?: string;
          tax?: number;
          total: number;
          currency?: string;
          payment_method?: PaymentMethodDb;
          payment_status?: PaymentStatusDb;
          order_status?: OrderStatusDb;
          shipping_address: Json;
          payment_reference?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          customer_first_name?: string;
          customer_last_name?: string;
          customer_email?: string;
          customer_phone?: string;
          subtotal?: number;
          discount?: number;
          coupon_code?: string | null;
          shipping?: number;
          shipping_method?: string;
          tax?: number;
          total?: number;
          currency?: string;
          payment_method?: PaymentMethodDb;
          payment_status?: PaymentStatusDb;
          order_status?: OrderStatusDb;
          shipping_address?: Json;
          payment_reference?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_title: string;
          product_image: string;
          sku: string;
          variant_description: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_title: string;
          product_image: string;
          sku: string;
          variant_description?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_title?: string;
          product_image?: string;
          sku?: string;
          variant_description?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          previous_status: OrderStatusDb | null;
          new_status: OrderStatusDb;
          changed_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          previous_status?: OrderStatusDb | null;
          new_status: OrderStatusDb;
          changed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          previous_status?: OrderStatusDb | null;
          new_status?: OrderStatusDb;
          changed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
      store_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      admin_notifications: {
        Row: {
          id: string;
          title: string;
          message: string;
          type: "info" | "warning" | "success" | "order" | "stock" | "payment";
          read: boolean;
          action_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          message: string;
          type?: "info" | "warning" | "success" | "order" | "stock" | "payment";
          read?: boolean;
          action_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          message?: string;
          type?: "info" | "warning" | "success" | "order" | "stock" | "payment";
          read?: boolean;
          action_url?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRoleDb;
      stock_status: StockStatusDb;
      discount_type: DiscountTypeDb;
      payment_method: PaymentMethodDb;
      payment_status: PaymentStatusDb;
      order_status: OrderStatusDb;
      variant_type: VariantTypeDb;
    };
  };
}
