import { Product } from "@/src/types";
import { supabase, isSupabaseConfigured } from "@/src/lib/supabaseClient";
import { productService } from "./productService";

const WISHLIST_STORAGE_KEY = "novastore_wishlist_v1";

/**
 * NOVA STORE — WISHLIST SERVICE
 * 
 * Manages customer wishlist items with real Supabase `wishlist_items` synchronization
 * and guest localStorage fallback.
 */
export const wishlistService = {
  /**
   * Get wishlist for a user (or local fallback for guest)
   */
  async getWishlist(userId?: string): Promise<Product[]> {
    if (isSupabaseConfigured() && userId) {
      try {
        const { data, error } = await supabase
          .from("wishlist_items")
          .select("product_id")
          .eq("user_id", userId);

        if (error) throw error;
        if (!data || data.length === 0) return [];

        const productIds = data.map((item: any) => item.product_id);
        const allProducts: Product[] = await productService.getProducts({});
        return allProducts.filter((p: Product) => productIds.includes(p.id));
      } catch (err) {
        console.warn("Falling back to local wishlist due to backend error:", err);
      }
    }

    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * Add a product to wishlist
   */
  async addToWishlist(product: Product, userId?: string): Promise<void> {
    if (isSupabaseConfigured() && userId) {
      try {
        const { error } = await supabase
          .from("wishlist_items")
          .insert({
            user_id: userId,
            product_id: product.id,
          });

        if (error && error.code !== "23505") { // Ignore unique violation
          throw error;
        }
      } catch (err) {
        console.warn("Failed to persist wishlist item to Supabase:", err);
      }
    }

    // Always keep local storage updated as fallback
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      const items: Product[] = stored ? JSON.parse(stored) : [];
      if (!items.some((p) => p.id === product.id)) {
        items.push(product);
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
      }
    } catch {}
  },

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(productId: string, userId?: string): Promise<void> {
    if (isSupabaseConfigured() && userId) {
      try {
        await supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);
      } catch (err) {
        console.warn("Failed to remove wishlist item from Supabase:", err);
      }
    }

    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const items: Product[] = JSON.parse(stored);
        const filtered = items.filter((p) => p.id !== productId);
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch {}
  },

  /**
   * Sync guest localStorage wishlist to user's Supabase account on login
   */
  async syncGuestWishlistOnLogin(userId: string): Promise<Product[]> {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      const guestItems: Product[] = stored ? JSON.parse(stored) : [];

      if (isSupabaseConfigured() && guestItems.length > 0) {
        for (const item of guestItems) {
          try {
            await supabase.from("wishlist_items").insert({
              user_id: userId,
              product_id: item.id,
            });
          } catch {}
        }
      }

      return await this.getWishlist(userId);
    } catch {
      return [];
    }
  },
};
