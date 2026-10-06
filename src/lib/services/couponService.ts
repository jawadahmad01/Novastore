import { Coupon } from "@/src/types";
import { supabase, isSupabaseConfigured } from "@/src/lib/supabaseClient";

const COUPONS_STORAGE_KEY = "novastore_coupons";

const SEED_COUPONS: Coupon[] = [
  {
    id: "cpn_01",
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 2000,
    maxDiscount: 2000,
    startDate: "2025-01-01",
    expiryDate: "2027-12-31",
    usageLimit: 1000,
    usedCount: 142,
    description: "10% off on your order (min. order Rs. 2,000, max discount Rs. 2,000)",
    isActive: true,
  },
  {
    id: "cpn_02",
    code: "SAVE500",
    discountType: "fixed",
    discountValue: 500,
    minOrderAmount: 4000,
    startDate: "2025-01-01",
    expiryDate: "2027-12-31",
    usageLimit: 500,
    usedCount: 88,
    description: "Flat Rs. 500 discount on orders above Rs. 4,000",
    isActive: true,
  },
  {
    id: "cpn_03",
    code: "NOVA15",
    discountType: "percentage",
    discountValue: 15,
    minOrderAmount: 5000,
    maxDiscount: 3500,
    startDate: "2025-01-01",
    expiryDate: "2027-12-31",
    usageLimit: 300,
    usedCount: 65,
    description: "15% off premium collection on orders over Rs. 5,000",
    isActive: true,
  },
  {
    id: "cpn_04",
    code: "EIDSPECIAL",
    discountType: "fixed",
    discountValue: 1000,
    minOrderAmount: 8000,
    startDate: "2025-01-01",
    expiryDate: "2025-04-30",
    usageLimit: 200,
    usedCount: 200,
    description: "Special seasonal festive promotion (Expired / Max limit reached)",
    isActive: false,
  },
];

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  errorMessage?: string;
}

function mapDbCouponToCoupon(db: any): Coupon {
  return {
    id: db.id,
    code: db.code,
    discountType: db.discount_type,
    discountValue: Number(db.discount_value),
    minOrderAmount: db.min_order_amount ? Number(db.min_order_amount) : undefined,
    maxDiscount: db.max_discount ? Number(db.max_discount) : undefined,
    startDate: db.start_date || undefined,
    expiryDate: db.expiry_date || undefined,
    usageLimit: db.usage_limit || undefined,
    usedCount: Number(db.used_count || 0),
    perCustomerLimit: Number(db.per_customer_limit || 1),
    description: db.description || "",
    isActive: db.is_active !== false,
    createdAt: db.created_at,
  };
}

export const couponService = {
  _ensureCoupons(): Coupon[] {
    try {
      const stored = localStorage.getItem(COUPONS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(SEED_COUPONS));
      return SEED_COUPONS;
    } catch {
      return SEED_COUPONS;
    }
  },

  _saveCoupons(coupons: Coupon[]): void {
    try {
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
    } catch {}
  },

  /**
   * Validate coupon code against current subtotal
   */
  async validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
    if (!code || code.trim().length === 0) {
      return { valid: false, discountAmount: 0, errorMessage: "Please enter a coupon code." };
    }

    const cleanCode = code.trim().toUpperCase();
    let found: Coupon | null = null;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("coupons")
          .select("*")
          .ilike("code", cleanCode)
          .single();

        if (!error && data) {
          found = mapDbCouponToCoupon(data);
        }
      } catch (err) {
        console.warn("Could not validate coupon via Supabase:", err);
      }
    }

    if (!found) {
      const coupons = this._ensureCoupons();
      found = coupons.find((c) => c.code.toUpperCase() === cleanCode) || null;
    }

    if (!found || !found.isActive) {
      return {
        valid: false,
        discountAmount: 0,
        errorMessage: `Coupon "${cleanCode}" is invalid or has been disabled.`,
      };
    }

    // Check expiry
    if (found.expiryDate) {
      const expiry = new Date(found.expiryDate);
      if (expiry.getTime() < Date.now()) {
        return {
          valid: false,
          discountAmount: 0,
          errorMessage: `Coupon "${cleanCode}" has expired.`,
        };
      }
    }

    // Check usage limits
    if (found.usageLimit && found.usedCount && found.usedCount >= found.usageLimit) {
      return {
        valid: false,
        discountAmount: 0,
        errorMessage: `Coupon "${cleanCode}" has reached its maximum redemption limit.`,
      };
    }

    // Check min order threshold
    if (found.minOrderAmount && subtotal < found.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        errorMessage: `Coupon "${cleanCode}" requires a minimum order of Rs. ${found.minOrderAmount.toLocaleString()}.`,
      };
    }

    let discount = 0;
    if (found.discountType === "percentage") {
      discount = Math.round((subtotal * found.discountValue) / 100);
      if (found.maxDiscount && discount > found.maxDiscount) {
        discount = found.maxDiscount;
      }
    } else {
      discount = found.discountValue;
    }

    discount = Math.min(discount, subtotal);

    return {
      valid: true,
      coupon: found,
      discountAmount: discount,
    };
  },

  getFeaturedPromotions(): Coupon[] {
    return this._ensureCoupons().filter((c) => c.isActive);
  },

  // ==========================================================================
  // ADMIN METHODS
  // ==========================================================================

  async getAllCouponsAdmin(): Promise<Coupon[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("coupons")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(mapDbCouponToCoupon);
        }
      } catch (err) {
        console.warn("Could not query coupons from Supabase:", err);
      }
    }

    return this._ensureCoupons();
  },

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    if (!data.code?.trim()) {
      throw new Error("Coupon code is required.");
    }
    if (!data.discountValue || data.discountValue <= 0) {
      throw new Error("Discount value must be greater than 0.");
    }

    const cleanCode = data.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    let createdId = `cpn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    if (isSupabaseConfigured()) {
      try {
        const { data: dbCoupon, error } = await supabase
          .from("coupons")
          .insert({
            code: cleanCode,
            discount_type: data.discountType || "percentage",
            discount_value: Number(data.discountValue),
            min_order_amount: data.minOrderAmount ? Number(data.minOrderAmount) : 0,
            max_discount: data.maxDiscount ? Number(data.maxDiscount) : null,
            start_date: data.startDate || null,
            expiry_date: data.expiryDate || null,
            usage_limit: data.usageLimit ? Number(data.usageLimit) : null,
            used_count: 0,
            per_customer_limit: data.perCustomerLimit ? Number(data.perCustomerLimit) : 1,
            description: data.description || "",
            is_active: data.isActive !== false,
          })
          .select()
          .single();

        if (error) throw error;
        if (dbCoupon) {
          createdId = dbCoupon.id;
        }
      } catch (err: any) {
        console.warn("Could not insert coupon into Supabase:", err);
      }
    }

    const newCoupon: Coupon = {
      id: createdId,
      code: cleanCode,
      discountType: data.discountType || "percentage",
      discountValue: Number(data.discountValue),
      minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : undefined,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
      startDate: data.startDate || new Date().toISOString().split("T")[0],
      expiryDate: data.expiryDate || undefined,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      usedCount: 0,
      description: data.description || `${data.discountType === "percentage" ? data.discountValue + "% off" : "Rs. " + data.discountValue + " flat discount"} on store orders`,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
    };

    const coupons = this._ensureCoupons();
    coupons.unshift(newCoupon);
    this._saveCoupons(coupons);
    return newCoupon;
  },

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    const cleanCode = updates.code ? updates.code.trim().toUpperCase() : undefined;

    if (isSupabaseConfigured()) {
      try {
        const dbUpdates: any = {};
        if (cleanCode) dbUpdates.code = cleanCode;
        if (updates.discountType) dbUpdates.discount_type = updates.discountType;
        if (updates.discountValue !== undefined) dbUpdates.discount_value = Number(updates.discountValue);
        if (updates.minOrderAmount !== undefined) dbUpdates.min_order_amount = Number(updates.minOrderAmount);
        if (updates.maxDiscount !== undefined) dbUpdates.max_discount = updates.maxDiscount ? Number(updates.maxDiscount) : null;
        if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
        if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
        if (updates.usageLimit !== undefined) dbUpdates.usage_limit = updates.usageLimit ? Number(updates.usageLimit) : null;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

        await supabase.from("coupons").update(dbUpdates).eq("id", id);
      } catch (err) {
        console.warn("Could not update coupon in Supabase:", err);
      }
    }

    const coupons = this._ensureCoupons();
    const index = coupons.findIndex((c) => c.id === id || c.code === id);

    if (index !== -1) {
      const current = coupons[index];
      const updated: Coupon = {
        ...current,
        ...updates,
        code: cleanCode || current.code,
        id: current.id,
      };
      coupons[index] = updated;
      this._saveCoupons(coupons);
      return updated;
    }

    return {
      id,
      code: cleanCode || "COUPON",
      discountType: "percentage",
      discountValue: 10,
      description: "",
      isActive: true,
      ...updates,
    };
  },

  async deleteCoupon(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("coupons").delete().eq("id", id);
      } catch (err) {
        console.warn("Could not delete coupon in Supabase:", err);
      }
    }

    const coupons = this._ensureCoupons();
    const filtered = coupons.filter((c) => c.id !== id && c.code !== id);
    this._saveCoupons(filtered);
    return true;
  },

  async toggleCoupon(id: string, isActive: boolean): Promise<Coupon> {
    return this.updateCoupon(id, { isActive });
  },
};
