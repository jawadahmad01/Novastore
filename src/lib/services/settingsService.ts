import {
  StoreSettings,
  ShippingSettings,
  PaymentSettings,
  TaxSettings,
} from "@/src/types";
import { supabase, isSupabaseConfigured } from "@/src/lib/supabaseClient";

const STORE_SETTINGS_KEY = "novastore_settings_store";
const SHIPPING_SETTINGS_KEY = "novastore_settings_shipping";
const PAYMENT_SETTINGS_KEY = "novastore_settings_payment";
const TAX_SETTINGS_KEY = "novastore_settings_tax";

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "NOVA STORE",
  storeTagline: "Modern Lifestyle & Everyday Essentials",
  storeEmail: "support@novastore.pk",
  storePhone: "+92 300 111 2233",
  storeAddress: "Plaza 42, M.M. Alam Road, Gulberg III",
  city: "Lahore",
  province: "Punjab",
  country: "Pakistan",
  currency: "PKR",
  currencySymbol: "Rs.",
  locale: "en-PK",
  supportHours: "Monday – Saturday: 10:00 AM – 8:00 PM PKT",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  whatsappNumber: "03001112233",
  trackInventoryDefault: true,
  lowStockAlertThreshold: 5,
};

const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  standardDeliveryFee: 200,
  expressDeliveryFee: 400,
  freeShippingThreshold: 3000,
  estimatedDeliveryStandard: "2–4 business days across Pakistan",
  estimatedDeliveryExpress: "Next business day (Lahore, Karachi, Islamabad)",
  enableFreeShipping: true,
  allowCashOnDelivery: true,
  citiesWithFastDelivery: ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad"],
};

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  enableCod: true,
  enableBankTransfer: true,
  enableCardGateway: false,
  bankName: "Meezan Bank Limited",
  bankAccountTitle: "NOVA STORE DIGITAL (PVT) LTD",
  bankAccountNumber: "02010104829104",
  bankIban: "PK36MEZN0002010104829104",
  bankBranch: "Gulberg III Branch, Lahore (Code: 0201)",
  codInstructions: "Pay in cash directly to the courier rider upon delivery of your parcel.",
  bankTransferInstructions: "Transfer total amount to our bank account. Include your Order Number as payment reference and upload/enter your transaction ID.",
};

const DEFAULT_TAX_SETTINGS: TaxSettings = {
  taxEnabled: false,
  taxRatePercent: 0,
  pricesIncludeTax: true,
  taxLabel: "GST / Sales Tax",
};

export const settingsService = {
  // Store Settings
  getStoreSettings(): StoreSettings {
    try {
      const stored = localStorage.getItem(STORE_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  },

  async updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = this.getStoreSettings();
    const updated = { ...current, ...updates };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("store_settings").upsert({
          key: "store_general",
          value: updated as any,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Could not persist store settings to Supabase:", err);
      }
    }

    localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  },

  // Shipping Settings
  getShippingSettings(): ShippingSettings {
    try {
      const stored = localStorage.getItem(SHIPPING_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SHIPPING_SETTINGS;
    } catch {
      return DEFAULT_SHIPPING_SETTINGS;
    }
  },

  async updateShippingSettings(updates: Partial<ShippingSettings>): Promise<ShippingSettings> {
    const current = this.getShippingSettings();
    const updated = { ...current, ...updates };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("store_settings").upsert({
          key: "store_shipping",
          value: updated as any,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Could not persist shipping settings to Supabase:", err);
      }
    }

    localStorage.setItem(SHIPPING_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  },

  // Payment Settings
  getPaymentSettings(): PaymentSettings {
    try {
      const stored = localStorage.getItem(PAYMENT_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_PAYMENT_SETTINGS;
    } catch {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  },

  async updatePaymentSettings(updates: Partial<PaymentSettings>): Promise<PaymentSettings> {
    const current = this.getPaymentSettings();
    const updated = { ...current, ...updates };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("store_settings").upsert({
          key: "store_payments",
          value: updated as any,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Could not persist payment settings to Supabase:", err);
      }
    }

    localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  },

  // Tax Settings
  getTaxSettings(): TaxSettings {
    try {
      const stored = localStorage.getItem(TAX_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_TAX_SETTINGS;
    } catch {
      return DEFAULT_TAX_SETTINGS;
    }
  },

  async updateTaxSettings(updates: Partial<TaxSettings>): Promise<TaxSettings> {
    const current = this.getTaxSettings();
    const updated = { ...current, ...updates };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("store_settings").upsert({
          key: "store_tax",
          value: updated as any,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Could not persist tax settings to Supabase:", err);
      }
    }

    localStorage.setItem(TAX_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  },
};
