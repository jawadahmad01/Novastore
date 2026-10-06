import { Category } from "@/src/types";
import { productService } from "./productService";
import { supabase, isSupabaseConfigured } from "@/src/lib/supabaseClient";

const CATEGORIES_STORAGE_KEY = "novastore_categories";

const SEED_CATEGORIES: Category[] = [
  {
    id: "cat_01",
    name: "Electronics",
    slug: "electronics",
    description: "Premium gadgets, smart audio, chargers, smart wearables and tech accessories.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    active: true,
    sortOrder: 1,
  },
  {
    id: "cat_02",
    name: "Mobile Accessories",
    slug: "mobile-accessories",
    description: "Protective cases, fast charging cables, power banks and vehicle mounts.",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
    active: true,
    sortOrder: 2,
  },
  {
    id: "cat_03",
    name: "Home & Lifestyle",
    slug: "home-lifestyle",
    description: "Modern smart lamps, aroma diffusers, organizers, and home comfort essentials.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
    active: true,
    sortOrder: 3,
  },
  {
    id: "cat_04",
    name: "Fashion",
    slug: "fashion",
    description: "Curated apparel, minimalist leather wallets, watches, and daily wear.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    active: true,
    sortOrder: 4,
  },
  {
    id: "cat_05",
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    description: "Personal grooming, skincare tools, wellness accessories, and care essentials.",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80",
    active: true,
    sortOrder: 5,
  },
  {
    id: "cat_06",
    name: "Kitchen",
    slug: "kitchen",
    description: "Smart culinary tools, stainless tumblers, coffee gadgets, and kitchen essentials.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    active: true,
    sortOrder: 6,
  },
  {
    id: "cat_07",
    name: "Sports & Fitness",
    slug: "sports-fitness",
    description: "Fitness trackers, workout gear, insulated hydration flasks, and resistance equipment.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    active: true,
    sortOrder: 7,
  },
  {
    id: "cat_08",
    name: "Bags & Accessories",
    slug: "bags-accessories",
    description: "Water-resistant commuter backpacks, travel organizers, and premium sleeves.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    active: true,
    sortOrder: 8,
  },
];

function mapDbCategoryToCategory(db: any): Category {
  return {
    id: db.id,
    name: db.name,
    slug: db.slug,
    description: db.description || undefined,
    image: db.image || undefined,
    icon: db.icon || undefined,
    active: db.active,
    sortOrder: db.sort_order,
    createdAt: db.created_at,
  };
}

export const categoryService = {
  _ensureCategories(): Category[] {
    try {
      const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(SEED_CATEGORIES));
      return SEED_CATEGORIES;
    } catch {
      return SEED_CATEGORIES;
    }
  },

  _saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch {}
  },

  /**
   * Get all categories with dynamic product counts
   */
  async getCategories(includeInactive = false): Promise<Category[]> {
    let list: Category[] = [];

    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from("categories").select("*");
        if (!includeInactive) {
          query = query.eq("active", true);
        }
        const { data, error } = await query.order("sort_order", { ascending: true });
        if (!error && data && data.length > 0) {
          list = data.map(mapDbCategoryToCategory);
        }
      } catch (err) {
        console.warn("Could not query categories from Supabase:", err);
      }
    }

    if (list.length === 0) {
      const all = this._ensureCategories();
      list = includeInactive ? all : all.filter((c) => c.active);
    }

    const counts = productService.getCategoryCounts();

    const mapped = list.map((cat) => ({
      ...cat,
      productCount: counts[cat.name] || 0,
    }));

    return mapped.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  /**
   * Get category by slug or name
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const list = await this.getCategories(true);
    const match = list.find(
      (c) => c.slug.toLowerCase() === slug.toLowerCase() || c.name.toLowerCase() === slug.toLowerCase()
    );
    return match || null;
  },

  /**
   * Create category
   */
  async createCategory(data: Partial<Category>): Promise<Category> {
    if (!data.name?.trim()) {
      throw new Error("Category name is required.");
    }

    const slug = (data.slug || data.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let createdId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    if (isSupabaseConfigured()) {
      try {
        const { data: dbCat, error } = await supabase
          .from("categories")
          .insert({
            name: data.name.trim(),
            slug,
            description: data.description || null,
            image: data.image || null,
            icon: data.icon || null,
            active: data.active !== undefined ? data.active : true,
            sort_order: data.sortOrder || 0,
          })
          .select()
          .single();

        if (error) throw error;
        if (dbCat) {
          createdId = dbCat.id;
        }
      } catch (err: any) {
        console.warn("Could not insert category in Supabase:", err);
      }
    }

    const newCategory: Category = {
      id: createdId,
      name: data.name.trim(),
      slug,
      description: data.description || "",
      image: data.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      active: data.active !== undefined ? data.active : true,
      sortOrder: data.sortOrder || 1,
      createdAt: new Date().toISOString(),
    };

    const categories = this._ensureCategories();
    categories.push(newCategory);
    this._saveCategories(categories);
    return newCategory;
  },

  /**
   * Update category
   */
  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    if (isSupabaseConfigured()) {
      try {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name.trim();
        if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.image !== undefined) dbUpdates.image = updates.image;
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
        if (updates.active !== undefined) dbUpdates.active = updates.active;
        if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

        await supabase.from("categories").update(dbUpdates).eq("id", id);
      } catch (err) {
        console.warn("Could not update category in Supabase:", err);
      }
    }

    const categories = this._ensureCategories();
    const index = categories.findIndex((c) => c.id === id);

    if (index !== -1) {
      const current = categories[index];
      const updated: Category = {
        ...current,
        ...updates,
        id: current.id,
      };
      categories[index] = updated;
      this._saveCategories(categories);
      return updated;
    }

    return {
      id,
      name: updates.name || "Updated Category",
      slug: updates.slug || "updated",
      active: updates.active !== undefined ? updates.active : true,
      ...updates,
    };
  },

  /**
   * Safe delete category: checks if products still reference it
   */
  async deleteCategory(id: string, force = false): Promise<boolean> {
    const categories = this._ensureCategories();
    const target = categories.find((c) => c.id === id);

    const counts = productService.getCategoryCounts();
    const prodCount = target ? (counts[target.name] || 0) : 0;

    if (prodCount > 0 && !force) {
      throw new Error(
        `Cannot delete "${target?.name || 'category'}" because it still contains ${prodCount} product(s). Please reassign or delete the products first.`
      );
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("categories").delete().eq("id", id);
      } catch (err) {
        console.warn("Could not delete category in Supabase:", err);
      }
    }

    const filtered = categories.filter((c) => c.id !== id);
    this._saveCategories(filtered);
    return true;
  },
};
