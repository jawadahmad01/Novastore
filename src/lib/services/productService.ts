import productsData from "@/src/data/products.json";
import { Product, ProductCategory, FilterState, StockStatusType, ProductVariant } from "@/src/types";
import { supabase, isSupabaseConfigured } from "@/src/lib/supabaseClient";

const PRODUCTS_STORAGE_KEY = "novastore_products_catalog";

export interface AdminProductQueryParams {
  search?: string;
  category?: string;
  stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  publicationStatus?: "all" | "published" | "draft";
  sortBy?:
    | "newest"
    | "oldest"
    | "name_asc"
    | "name_desc"
    | "price_asc"
    | "price_desc"
    | "stock_asc"
    | "stock_desc";
  page?: number;
  limit?: number;
}

function mapDbProductToProduct(dbProd: any, variants: any[] = []): Product {
  return {
    id: dbProd.id,
    slug: dbProd.slug,
    title: dbProd.title,
    description: dbProd.description || "",
    shortDescription: dbProd.short_description || "",
    category: dbProd.category_name,
    subcategory: dbProd.subcategory || undefined,
    brand: dbProd.brand || "NOVA STORE",
    price: Number(dbProd.price),
    compareAtPrice: dbProd.compare_at_price ? Number(dbProd.compare_at_price) : undefined,
    currency: dbProd.currency || "PKR",
    images: dbProd.images && dbProd.images.length > 0 ? dbProd.images : [dbProd.thumbnail],
    thumbnail: dbProd.thumbnail,
    rating: Number(dbProd.rating || 5.0),
    reviewCount: Number(dbProd.review_count || 0),
    sku: dbProd.sku,
    stock: Number(dbProd.stock || 0),
    stockStatus: dbProd.stock_status,
    lowStockThreshold: dbProd.low_stock_threshold || 5,
    trackInventory: dbProd.track_inventory !== false,
    allowBackorders: !!dbProd.allow_backorders,
    tags: dbProd.tags || [],
    featured: !!dbProd.featured,
    bestSeller: !!dbProd.best_seller,
    newArrival: !!dbProd.new_arrival,
    sale: !!dbProd.sale,
    published: dbProd.published !== false,
    archived: !!dbProd.archived,
    deletedAt: dbProd.deleted_at || undefined,
    specifications: Array.isArray(dbProd.specifications) ? dbProd.specifications : [],
    variants: variants.map((v) => ({
      id: v.id,
      name: v.name,
      type: v.type,
      value: v.value,
      priceModifier: Number(v.price_modifier || 0),
      sku: v.sku,
      stock: Number(v.stock || 0),
      image: v.image || undefined,
    })),
    createdAt: dbProd.created_at,
    updatedAt: dbProd.updated_at,
  };
}

export const productService = {
  /**
   * Initializes local storage catalog with baseline JSON data if empty
   */
  _ensureCatalog(): Product[] {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      const seeded: Product[] = (productsData as any[]).map((p) => ({
        ...p,
        published: p.published !== undefined ? p.published : true,
        archived: false,
        trackInventory: p.trackInventory !== undefined ? p.trackInventory : true,
        lowStockThreshold: p.lowStockThreshold || 5,
        stockStatus:
          p.stock <= 0
            ? "out_of_stock"
            : p.stock <= (p.lowStockThreshold || 5)
            ? "low_stock"
            : "in_stock",
      }));
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    } catch {
      return productsData as Product[];
    }
  },

  _saveCatalog(products: Product[]): void {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      window.dispatchEvent(new Event("novastore_catalog_updated"));
    } catch (e) {
      console.error("Failed to save catalog to localStorage", e);
    }
  },

  /**
   * Fetch customer-visible products with optional filters, search, and sorting
   */
  async getProducts(filters?: FilterState, includeDrafts = false): Promise<{ products: Product[]; total: number } | any> {
    let all: Product[] = [];

    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from("products").select("*").is("deleted_at", null);
        if (!includeDrafts) {
          query = query.eq("published", true).eq("archived", false);
        }

        const { data: dbProducts, error } = await query;
        if (!error && dbProducts && dbProducts.length > 0) {
          // Fetch variants for all products
          const productIds = dbProducts.map((p) => p.id);
          const { data: dbVariants } = await supabase
            .from("product_variants")
            .select("*")
            .in("product_id", productIds);

          const variantsByProduct = new Map<string, any[]>();
          (dbVariants || []).forEach((v) => {
            const list = variantsByProduct.get(v.product_id) || [];
            list.push(v);
            variantsByProduct.set(v.product_id, list);
          });

          all = dbProducts.map((p) => mapDbProductToProduct(p, variantsByProduct.get(p.id) || []));
        }
      } catch (err) {
        console.warn("Could not query products from Supabase:", err);
      }
    }

    if (all.length === 0) {
      all = this._ensureCatalog();
    }

    let result = all.filter((p) => {
      if (p.archived) return false;
      if (!includeDrafts && p.published === false) return false;
      return true;
    });

    if (filters) {
      if (filters.category && filters.category !== "All") {
        result = result.filter(
          (p) => String(p.category).toLowerCase() === String(filters.category).toLowerCase()
        );
      }
      if (filters.subcategory) {
        result = result.filter(
          (p) => p.subcategory?.toLowerCase() === filters.subcategory!.toLowerCase()
        );
      }
      if (filters.brand) {
        result = result.filter(
          (p) => p.brand.toLowerCase() === filters.brand!.toLowerCase()
        );
      }
      if (filters.minPrice !== undefined) {
        result = result.filter((p) => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        result = result.filter((p) => p.price <= filters.maxPrice!);
      }
      if (filters.minRating !== undefined && filters.minRating > 0) {
        result = result.filter((p) => p.rating >= filters.minRating!);
      }
      if (filters.availability === "in_stock") {
        result = result.filter((p) => p.stock > 0);
      } else if (filters.availability === "low_stock") {
        result = result.filter((p) => p.stock > 0 && p.stock <= (p.lowStockThreshold || 5));
      } else if (filters.availability === "sale") {
        result = result.filter((p) => p.sale);
      }
      if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase().trim();
        result = result.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            String(p.category).toLowerCase().includes(q) ||
            (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }
      if (filters.tag) {
        result = result.filter((p) => p.tags && p.tags.includes(filters.tag!));
      }

      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "price_asc":
            result.sort((a, b) => a.price - b.price);
            break;
          case "price_desc":
            result.sort((a, b) => b.price - a.price);
            break;
          case "highest_rated":
            result.sort((a, b) => b.rating - a.rating);
            break;
          case "popularity":
            result.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
          case "newest":
            result.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            break;
          case "featured":
          default:
            result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
            break;
        }
      }
    }

    // Support both direct array returns and { products, total } for compatibility
    return result as any;
  },

  /**
   * Find product by URL slug
   */
  async getProductBySlug(slug: string, includeDrafts = false): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: p, error } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .is("deleted_at", null)
          .single();

        if (!error && p) {
          if (!includeDrafts && (!p.published || p.archived)) {
            return null;
          }
          const { data: variants } = await supabase
            .from("product_variants")
            .select("*")
            .eq("product_id", p.id);

          return mapDbProductToProduct(p, variants || []);
        }
      } catch (err) {
        console.warn("Could not fetch product from Supabase:", err);
      }
    }

    const products = this._ensureCatalog();
    const product = products.find(
      (p) =>
        p.slug === slug &&
        !p.archived &&
        (includeDrafts || p.published !== false)
    );
    return product || null;
  },

  /**
   * Find product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: p, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && p) {
          const { data: variants } = await supabase
            .from("product_variants")
            .select("*")
            .eq("product_id", p.id);

          return mapDbProductToProduct(p, variants || []);
        }
      } catch (err) {
        console.warn("Could not fetch product by id from Supabase:", err);
      }
    }

    const products = this._ensureCatalog();
    return products.find((p) => p.id === id) || null;
  },

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const products: Product[] = await this.getProducts({ availability: "all" });
    return products.filter((p) => p.featured).slice(0, limit);
  },

  async getBestSellers(limit = 6): Promise<Product[]> {
    const products: Product[] = await this.getProducts({ availability: "all" });
    return products.filter((p) => p.bestSeller).slice(0, limit);
  },

  async getNewArrivals(limit = 6): Promise<Product[]> {
    const products: Product[] = await this.getProducts({ availability: "all" });
    return [...products]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  async getFlashDeals(limit = 6): Promise<Product[]> {
    const products: Product[] = await this.getProducts({ availability: "all" });
    return products
      .filter((p) => p.sale && p.compareAtPrice && p.compareAtPrice > p.price)
      .slice(0, limit);
  },

  async getRelatedProducts(
    productId: string,
    category: ProductCategory | string,
    limit = 6,
    currentTags: string[] = [],
    brand?: string
  ): Promise<Product[]> {
    const all: Product[] = await this.getProducts();
    const candidates = all.filter((p) => p.id !== productId);

    const scored = candidates.map((p) => {
      let score = 0;
      if (String(p.category) === String(category)) score += 6;
      if (brand && p.brand.toLowerCase() === brand.toLowerCase()) score += 3;
      if (currentTags.length > 0 && p.tags) {
        const shared = p.tags.filter((t) => currentTags.includes(t));
        score += shared.length * 2;
      }
      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.product);
  },

  async searchSuggestions(query: string, limit = 6): Promise<Product[]> {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const all: Product[] = await this.getProducts();
    return all
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          String(p.category).toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      )
      .slice(0, limit);
  },

  getPriceBounds(): { min: number; max: number } {
    const products = this._ensureCatalog().filter((p) => !p.archived && p.published !== false);
    if (products.length === 0) return { min: 0, max: 100000 };
    const prices = products.map((p) => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  },

  getAllCategories(): string[] {
    const set = new Set<string>();
    this._ensureCatalog()
      .filter((p) => !p.archived)
      .forEach((p) => set.add(String(p.category)));
    return Array.from(set);
  },

  getCategoryCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this._ensureCatalog()
      .filter((p) => !p.archived)
      .forEach((p) => {
        const cat = String(p.category);
        counts[cat] = (counts[cat] || 0) + 1;
      });
    return counts;
  },

  getAllBrands(): string[] {
    const set = new Set<string>();
    this._ensureCatalog()
      .filter((p) => !p.archived)
      .forEach((p) => {
        if (p.brand) set.add(p.brand);
      });
    return Array.from(set).sort();
  },

  getSubcategories(category?: ProductCategory | string): string[] {
    const set = new Set<string>();
    this._ensureCatalog()
      .filter((p) => !p.archived && (!category || String(p.category) === String(category)))
      .forEach((p) => {
        if (p.subcategory) set.add(p.subcategory);
      });
    return Array.from(set).sort();
  },

  getTotalCount(): number {
    return this._ensureCatalog().filter((p) => !p.archived).length;
  },

  // ==========================================================================
  // ADMIN METHODS
  // ==========================================================================

  async getAdminProducts(params?: AdminProductQueryParams): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const all: Product[] = await this.getProducts(undefined, true);
    let items = all.filter((p) => !p.archived);

    if (params?.search && params.search.trim().length > 0) {
      const q = params.search.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          String(p.category).toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (params?.category && params.category !== "all") {
      items = items.filter(
        (p) => String(p.category).toLowerCase() === params.category!.toLowerCase()
      );
    }

    if (params?.stockStatus && params.stockStatus !== "all") {
      if (params.stockStatus === "out_of_stock") {
        items = items.filter((p) => p.stock <= 0);
      } else if (params.stockStatus === "low_stock") {
        items = items.filter((p) => p.stock > 0 && p.stock <= (p.lowStockThreshold || 5));
      } else if (params.stockStatus === "in_stock") {
        items = items.filter((p) => p.stock > (p.lowStockThreshold || 5));
      }
    }

    if (params?.publicationStatus && params.publicationStatus !== "all") {
      if (params.publicationStatus === "published") {
        items = items.filter((p) => p.published !== false);
      } else if (params.publicationStatus === "draft") {
        items = items.filter((p) => p.published === false);
      }
    }

    const sortBy = params?.sortBy || "newest";
    switch (sortBy) {
      case "oldest":
        items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "name_asc":
        items.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name_desc":
        items.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "price_asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "stock_asc":
        items.sort((a, b) => a.stock - b.stock);
        break;
      case "stock_desc":
        items.sort((a, b) => b.stock - a.stock);
        break;
      case "newest":
      default:
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    const total = items.length;
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = items.slice((page - 1) * limit, page * limit);

    return {
      products: paginated,
      total,
      page,
      totalPages,
    };
  },

  _calculateStockStatus(stock: number, threshold = 5): StockStatusType {
    if (stock <= 0) return "out_of_stock";
    if (stock <= threshold) return "low_stock";
    return "in_stock";
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const catalog = this._ensureCatalog();

    if (!productData.title?.trim()) {
      throw new Error("Product title is required.");
    }
    if (productData.price === undefined || productData.price < 0) {
      throw new Error("Product price must be 0 or greater.");
    }
    if (!productData.category) {
      throw new Error("Category is required.");
    }

    const baseSlug = (productData.slug || productData.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    let slug = baseSlug;
    let counter = 1;
    while (catalog.some((p) => p.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const stock = Number(productData.stock || 0);
    const threshold = Number(productData.lowStockThreshold || 5);
    const now = new Date().toISOString();
    let createdId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Sync to Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data: dbProd, error } = await supabase
          .from("products")
          .insert({
            slug,
            title: productData.title.trim(),
            description: productData.description || "",
            short_description: productData.shortDescription || "",
            category_name: String(productData.category),
            subcategory: productData.subcategory || null,
            brand: productData.brand || "NOVA STORE",
            price: Math.round(Number(productData.price)),
            compare_at_price: productData.compareAtPrice ? Math.round(Number(productData.compareAtPrice)) : null,
            currency: "PKR",
            images: productData.images && productData.images.length > 0 ? productData.images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"],
            thumbnail: productData.thumbnail || (productData.images && productData.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
            sku: productData.sku || `NV-${Math.floor(1000 + Math.random() * 9000)}`,
            stock,
            low_stock_threshold: threshold,
            stock_status: this._calculateStockStatus(stock, threshold),
            track_inventory: productData.trackInventory !== false,
            allow_backorders: !!productData.allowBackorders,
            tags: productData.tags || [],
            featured: Boolean(productData.featured),
            best_seller: Boolean(productData.bestSeller),
            new_arrival: productData.newArrival !== undefined ? Boolean(productData.newArrival) : true,
            sale: Boolean(productData.sale || (productData.compareAtPrice && productData.compareAtPrice > productData.price)),
            published: productData.published !== false,
            archived: false,
            specifications: (productData.specifications || []) as any,
          })
          .select()
          .single();

        if (error) throw error;
        if (dbProd) {
          createdId = dbProd.id;

          // Insert variants if any
          if (productData.variants && productData.variants.length > 0) {
            const variantRows = productData.variants.map((v) => ({
              product_id: dbProd.id,
              name: v.name,
              type: v.type,
              value: v.value,
              price_modifier: Number(v.priceModifier || 0),
              sku: v.sku,
              stock: Number(v.stock || 0),
              image: v.image || null,
            }));
            await supabase.from("product_variants").insert(variantRows);
          }
        }
      } catch (err) {
        console.warn("Could not insert product into Supabase:", err);
      }
    }

    const newProduct: Product = {
      id: createdId,
      slug,
      title: productData.title.trim(),
      description: productData.description || "",
      shortDescription: productData.shortDescription || "",
      category: productData.category as any,
      subcategory: productData.subcategory || undefined,
      brand: productData.brand || "NOVA STORE",
      price: Math.round(Number(productData.price)),
      compareAtPrice: productData.compareAtPrice ? Math.round(Number(productData.compareAtPrice)) : undefined,
      currency: "PKR",
      images: productData.images && productData.images.length > 0 ? productData.images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"],
      thumbnail: productData.thumbnail || (productData.images && productData.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 0,
      sku: productData.sku || `NV-${Math.floor(1000 + Math.random() * 9000)}`,
      stock,
      lowStockThreshold: threshold,
      stockStatus: this._calculateStockStatus(stock, threshold),
      trackInventory: productData.trackInventory !== undefined ? productData.trackInventory : true,
      allowBackorders: productData.allowBackorders || false,
      tags: productData.tags || [],
      featured: Boolean(productData.featured),
      bestSeller: Boolean(productData.bestSeller),
      newArrival: productData.newArrival !== undefined ? Boolean(productData.newArrival) : true,
      sale: Boolean(productData.sale || (productData.compareAtPrice && productData.compareAtPrice > productData.price)),
      published: productData.published !== undefined ? productData.published : true,
      archived: false,
      specifications: productData.specifications || [],
      variants: productData.variants || [],
      createdAt: now,
      updatedAt: now,
    };

    catalog.unshift(newProduct);
    this._saveCatalog(catalog);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const catalog = this._ensureCatalog();
    const index = catalog.findIndex((p) => p.id === id);

    const current = index !== -1 ? catalog[index] : (await this.getProductById(id))!;
    if (!current) {
      throw new Error(`Product with ID "${id}" not found.`);
    }

    const stock = updates.stock !== undefined ? Number(updates.stock) : current.stock;
    const threshold = updates.lowStockThreshold !== undefined ? Number(updates.lowStockThreshold) : (current.lowStockThreshold || 5);
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.shortDescription !== undefined) dbUpdates.short_description = updates.shortDescription;
        if (updates.category !== undefined) dbUpdates.category_name = String(updates.category);
        if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory;
        if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
        if (updates.price !== undefined) dbUpdates.price = Number(updates.price);
        if (updates.compareAtPrice !== undefined) dbUpdates.compare_at_price = updates.compareAtPrice ? Number(updates.compareAtPrice) : null;
        if (updates.images !== undefined) dbUpdates.images = updates.images;
        if (updates.thumbnail !== undefined) dbUpdates.thumbnail = updates.thumbnail;
        if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
        if (updates.stock !== undefined) {
          dbUpdates.stock = stock;
          dbUpdates.stock_status = this._calculateStockStatus(stock, threshold);
        }
        if (updates.lowStockThreshold !== undefined) dbUpdates.low_stock_threshold = threshold;
        if (updates.trackInventory !== undefined) dbUpdates.track_inventory = updates.trackInventory;
        if (updates.allowBackorders !== undefined) dbUpdates.allow_backorders = updates.allowBackorders;
        if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
        if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
        if (updates.bestSeller !== undefined) dbUpdates.best_seller = updates.bestSeller;
        if (updates.newArrival !== undefined) dbUpdates.new_arrival = updates.newArrival;
        if (updates.published !== undefined) dbUpdates.published = updates.published;
        if (updates.archived !== undefined) dbUpdates.archived = updates.archived;
        if (updates.deletedAt !== undefined) dbUpdates.deleted_at = updates.deletedAt;
        if (updates.specifications !== undefined) dbUpdates.specifications = updates.specifications;

        await supabase.from("products").update(dbUpdates).eq("id", id);

        // Update variants if passed
        if (updates.variants) {
          await supabase.from("product_variants").delete().eq("product_id", id);
          if (updates.variants.length > 0) {
            const variantRows = updates.variants.map((v) => ({
              product_id: id,
              name: v.name,
              type: v.type,
              value: v.value,
              price_modifier: Number(v.priceModifier || 0),
              sku: v.sku,
              stock: Number(v.stock || 0),
              image: v.image || null,
            }));
            await supabase.from("product_variants").insert(variantRows);
          }
        }
      } catch (err) {
        console.warn("Could not update product in Supabase:", err);
      }
    }

    const updated: Product = {
      ...current,
      ...updates,
      id: current.id,
      stock,
      lowStockThreshold: threshold,
      stockStatus: this._calculateStockStatus(stock, threshold),
      updatedAt: now,
    };

    if (updates.images && updates.images.length > 0) {
      if (!updates.thumbnail || !updates.images.includes(updates.thumbnail)) {
        updated.thumbnail = updates.images[0];
      }
    }

    if (updated.compareAtPrice && updated.compareAtPrice > updated.price) {
      updated.sale = true;
    }

    if (index !== -1) {
      catalog[index] = updated;
      this._saveCatalog(catalog);
    }

    return updated;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("products").update({
          archived: true,
          published: false,
          deleted_at: new Date().toISOString(),
        }).eq("id", id);
      } catch (err) {
        console.warn("Could not delete product in Supabase:", err);
      }
    }

    const catalog = this._ensureCatalog();
    const index = catalog.findIndex((p) => p.id === id);

    if (index !== -1) {
      catalog[index] = {
        ...catalog[index],
        archived: true,
        published: false,
        deletedAt: new Date().toISOString(),
      };
      this._saveCatalog(catalog);
    }

    return true;
  },

  async duplicateProduct(id: string): Promise<Product> {
    const original = await this.getProductById(id);
    if (!original) throw new Error("Original product not found");

    const duplicateData: Partial<Product> = {
      ...original,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy`,
      sku: `${original.sku}-CPY`,
      published: false,
    };

    return this.createProduct(duplicateData);
  },

  async togglePublish(id: string, published: boolean): Promise<Product> {
    return this.updateProduct(id, { published });
  },

  async adjustStock(id: string, newStock: number): Promise<Product> {
    if (newStock < 0) throw new Error("Stock cannot be negative");
    return this.updateProduct(id, { stock: newStock });
  },

  /**
   * Deduct product and variant stock upon order placement
   */
  async deductInventoryForOrder(items: Array<{ productId: string; quantity: number; variantDescription?: string }>): Promise<void> {
    for (const item of items) {
      try {
        const prod = await this.getProductById(item.productId);
        if (!prod || !prod.trackInventory) continue;

        const newStock = Math.max(0, prod.stock - item.quantity);
        let updatedVariants = prod.variants;

        if (item.variantDescription && prod.variants && prod.variants.length > 0) {
          updatedVariants = prod.variants.map((v) => {
            if (v.name === item.variantDescription || v.value === item.variantDescription) {
              return { ...v, stock: Math.max(0, v.stock - item.quantity) };
            }
            return v;
          });
        }

        await this.updateProduct(prod.id, {
          stock: newStock,
          variants: updatedVariants,
        });
      } catch (err) {
        console.warn(`Could not deduct inventory for product ${item.productId}:`, err);
      }
    }
  },

  /**
   * Restore inventory upon order cancellation
   */
  async restoreInventoryForOrder(items: Array<{ productId: string; quantity: number; variantDescription?: string }>): Promise<void> {
    for (const item of items) {
      try {
        const prod = await this.getProductById(item.productId);
        if (!prod || !prod.trackInventory) continue;

        const newStock = prod.stock + item.quantity;
        let updatedVariants = prod.variants;

        if (item.variantDescription && prod.variants && prod.variants.length > 0) {
          updatedVariants = prod.variants.map((v) => {
            if (v.name === item.variantDescription || v.value === item.variantDescription) {
              return { ...v, stock: v.stock + item.quantity };
            }
            return v;
          });
        }

        await this.updateProduct(prod.id, {
          stock: newStock,
          variants: updatedVariants,
        });
      } catch (err) {
        console.warn(`Could not restore inventory for product ${item.productId}:`, err);
      }
    }
  },

  async getLowStockProducts(threshold = 5): Promise<Product[]> {
    const all: Product[] = await this.getProducts(undefined, true);
    return all.filter(
      (p) => !p.archived && p.stock <= (p.lowStockThreshold || threshold)
    );
  },
};
