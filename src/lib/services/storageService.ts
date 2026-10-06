import { supabase, isSupabaseConfigured } from "@/src/lib/supabaseClient";

/**
 * Storage Service Abstraction for NOVA STORE
 * 
 * Supports uploading images and documents directly to Supabase Storage
 * with automatic fallback to data URLs / object URLs for local offline preview.
 */

export interface ImageUploadResult {
  url: string;
  name: string;
  size?: number;
  bucket?: string;
  path?: string;
}

export const storageService = {
  /**
   * Pre-configured high quality product images for rapid product creation
   */
  getPresetImages(): Array<{ title: string; url: string; category: string }> {
    return [
      {
        title: "Wireless Headphones Studio",
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        category: "Electronics",
      },
      {
        title: "Smart Watch Luxury Black",
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        category: "Electronics",
      },
      {
        title: "Fast Charger Adapter & Cable",
        url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
        category: "Mobile Accessories",
      },
      {
        title: "Aluminium Laptop Stand Desk",
        url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
        category: "Accessories",
      },
      {
        title: "Minimalist Leather Wallet",
        url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
        category: "Fashion",
      },
      {
        title: "Nordic Minimalist Atmosphere Lamp",
        url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
        category: "Home & Lifestyle",
      },
      {
        title: "Insulated Stainless Steel Flask",
        url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
        category: "Sports & Fitness",
      },
      {
        title: "Commuter Waterproof Backpack",
        url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        category: "Bags & Accessories",
      },
      {
        title: "Electric Sonic Toothbrush Set",
        url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80",
        category: "Beauty & Personal Care",
      },
      {
        title: "Pour-Over Glass Coffee Dripper",
        url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
        category: "Kitchen",
      },
    ];
  },

  /**
   * Upload image to Supabase Storage bucket with fallback
   */
  async uploadProductImage(
    fileOrUrl: string | File,
    bucket: "product-images" | "category-images" | "bank-receipts" | "store-assets" = "product-images"
  ): Promise<ImageUploadResult> {
    if (typeof fileOrUrl === "string") {
      return {
        url: fileOrUrl.trim(),
        name: "Image URL",
        bucket,
      };
    }

    // Try Supabase Storage upload
    if (isSupabaseConfigured()) {
      try {
        const ext = fileOrUrl.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = `uploads/${fileName}`;

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, fileOrUrl, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        if (data) {
          const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

          return {
            url: publicUrlData.publicUrl,
            name: fileOrUrl.name,
            size: fileOrUrl.size,
            bucket,
            path: data.path,
          };
        }
      } catch (err) {
        console.warn(`Supabase Storage upload to ${bucket} failed, using local data URL fallback:`, err);
      }
    }

    // Fallback: Convert file to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          name: fileOrUrl.name,
          size: fileOrUrl.size,
          bucket,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrUrl);
    });
  },

  /**
   * Validate image URL format
   */
  isValidImageUrl(url: string): boolean {
    if (!url) return false;
    const clean = url.trim().toLowerCase();
    return (
      clean.startsWith("http://") ||
      clean.startsWith("https://") ||
      clean.startsWith("data:image/") ||
      clean.startsWith("blob:")
    );
  },
};
