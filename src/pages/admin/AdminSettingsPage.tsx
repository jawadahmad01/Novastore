import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { settingsService } from "@/src/lib/services/settingsService";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import {
  StoreSettings,
  ShippingSettings,
  PaymentSettings,
  TaxSettings,
} from "@/src/types";
import {
  Store,
  Truck,
  CreditCard,
  Receipt,
  UserCheck,
  Save,
  Building2,
  Banknote,
  Shield,
  Sparkles,
  Lock,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL path
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes("/admin/settings/shipping")) return "shipping";
    if (path.includes("/admin/settings/payments")) return "payments";
    if (path.includes("/admin/settings/tax")) return "tax";
    if (path.includes("/admin/settings/account")) return "account";
    return "store";
  };

  const [activeTab, setActiveTab] = useState<"store" | "shipping" | "payments" | "tax" | "account">(
    getTabFromPath()
  );

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab: "store" | "shipping" | "payments" | "tax" | "account") => {
    setActiveTab(tab);
    if (tab === "store") {
      navigate("/admin/settings/store");
    } else {
      navigate(`/admin/settings/${tab}`);
    }
  };

  // State slices
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(
    settingsService.getStoreSettings()
  );
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(
    settingsService.getShippingSettings()
  );
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(
    settingsService.getPaymentSettings()
  );
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(
    settingsService.getTaxSettings()
  );

  const [isSaving, setIsSaving] = useState(false);

  // Save Handlers
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsService.updateStoreSettings(storeSettings);
      showToast("Store profile & branding settings saved.", "success");
    } catch {
      showToast("Failed to save store settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsService.updateShippingSettings(shippingSettings);
      showToast("Delivery rates & thresholds updated.", "success");
    } catch {
      showToast("Failed to save shipping settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsService.updatePaymentSettings(paymentSettings);
      showToast("Payment methods & bank coordinates saved.", "success");
    } catch {
      showToast("Failed to save payment settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsService.updateTaxSettings(taxSettings);
      showToast("Sales tax & GST settings updated.", "success");
    } catch {
      showToast("Failed to save tax settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200 pb-12">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">
          Store & System Configuration
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Configure Pakistani store identity, fulfillment rates, bank transfer accounts, and administrator credentials.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-stone-200 overflow-x-auto shadow-2xs text-xs font-bold">
        {[
          { id: "store", label: "Store Identity", icon: Store },
          { id: "shipping", label: "Shipping & Delivery", icon: Truck },
          { id: "payments", label: "Payment Gateways", icon: CreditCard },
          { id: "tax", label: "Tax & GST", icon: Receipt },
          { id: "account", label: "Admin Account", icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: STORE SETTINGS */}
      {activeTab === "store" && (
        <form onSubmit={handleSaveStore} className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-sm font-bold text-stone-900">General Store Information</h2>
            <p className="text-xs text-stone-500">Public store identity, currency, and contact lines.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Store Name</label>
              <input
                type="text"
                value={storeSettings.storeName}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Store Tagline</label>
              <input
                type="text"
                value={storeSettings.storeTagline}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeTagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Support Email</label>
              <input
                type="email"
                value={storeSettings.storeEmail}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Support Phone / WhatsApp</label>
              <input
                type="text"
                value={storeSettings.storePhone}
                onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">Store Fulfillment Address</label>
              <input
                type="text"
                value={storeSettings.storeAddress}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">City & Province</label>
              <input
                type="text"
                value={`${storeSettings.city}, ${storeSettings.province}`}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 select-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Default Store Currency</label>
              <input
                type="text"
                value={`${storeSettings.currency} (${storeSettings.currencySymbol})`}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 select-none font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Store Settings"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SHIPPING SETTINGS */}
      {activeTab === "shipping" && (
        <form onSubmit={handleSaveShipping} className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-sm font-bold text-stone-900">Delivery & Shipping Rates (Pakistan)</h2>
            <p className="text-xs text-stone-500">Configure nationwide courier dispatch charges and free shipping eligibility.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Standard Delivery Fee (PKR)</label>
              <input
                type="number"
                min="0"
                value={shippingSettings.standardDeliveryFee}
                onChange={(e) =>
                  setShippingSettings({
                    ...shippingSettings,
                    standardDeliveryFee: Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 font-bold focus:border-stone-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Free Shipping Threshold (PKR)</label>
              <input
                type="number"
                min="0"
                value={shippingSettings.freeShippingThreshold}
                onChange={(e) =>
                  setShippingSettings({
                    ...shippingSettings,
                    freeShippingThreshold: Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 font-bold focus:border-stone-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Standard Delivery Time Estimate</label>
              <input
                type="text"
                value={shippingSettings.estimatedDeliveryStandard}
                onChange={(e) =>
                  setShippingSettings({
                    ...shippingSettings,
                    estimatedDeliveryStandard: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Express Delivery Time Estimate</label>
              <input
                type="text"
                value={shippingSettings.estimatedDeliveryExpress}
                onChange={(e) =>
                  setShippingSettings({
                    ...shippingSettings,
                    estimatedDeliveryExpress: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={shippingSettings.enableFreeShipping}
                onChange={(e) =>
                  setShippingSettings({
                    ...shippingSettings,
                    enableFreeShipping: e.target.checked,
                  })
                }
                className="rounded text-stone-900 focus:ring-stone-900 h-4 w-4"
              />
              <span className="font-semibold text-stone-800">
                Enable Free Shipping banner and checkout threshold calculation
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Shipping Settings"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: PAYMENT SETTINGS */}
      {activeTab === "payments" && (
        <form onSubmit={handleSavePayment} className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-sm font-bold text-stone-900">Payment Methods & Pakistani Banking</h2>
            <p className="text-xs text-stone-500">Configure Cash on Delivery and Direct Bank Transfer IBAN coordinates.</p>
          </div>

          {/* Cash on Delivery Section */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Banknote className="w-5 h-5 text-stone-700" />
                <div>
                  <h3 className="text-xs font-bold text-stone-900">Cash on Delivery (COD)</h3>
                  <p className="text-[11px] text-stone-500">Customer pays cash to courier rider upon parcel receipt.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentSettings.enableCod}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, enableCod: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-stone-900"></div>
              </label>
            </div>
          </div>

          {/* Direct Bank Transfer Section */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-blue-700" />
                <div>
                  <h3 className="text-xs font-bold text-stone-900">Direct Bank Transfer</h3>
                  <p className="text-[11px] text-stone-500">Customer transfers via 1Link / Raast and submits reference code.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentSettings.enableBankTransfer}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, enableBankTransfer: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-stone-900"></div>
              </label>
            </div>

            {paymentSettings.enableBankTransfer && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-xs border-t border-stone-200/80">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={paymentSettings.bankName}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, bankName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Account Title</label>
                  <input
                    type="text"
                    value={paymentSettings.bankAccountTitle}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, bankAccountTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={paymentSettings.bankAccountNumber}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, bankAccountNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">IBAN Number</label>
                  <input
                    type="text"
                    value={paymentSettings.bankIban}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, bankIban: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card Gateway Adapter Notice */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-stone-100 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <CreditCard className="w-4 h-4 text-stone-500" />
              <span>Credit / Debit Card Online Payment (Adapter Architecture)</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Future online card processing (PayFast, Safepay, Stripe) is prepared as a modular adapter and is currently disabled to prevent unverified transactions.
            </p>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Payment Settings"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: TAX SETTINGS */}
      {activeTab === "tax" && (
        <form onSubmit={handleSaveTax} className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-sm font-bold text-stone-900">Sales Tax & GST Calculations</h2>
            <p className="text-xs text-stone-500">Configure general sales tax behavior for store orders.</p>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={taxSettings.taxEnabled}
                onChange={(e) => setTaxSettings({ ...taxSettings, taxEnabled: e.target.checked })}
                className="rounded text-stone-900 focus:ring-stone-900 h-4 w-4"
              />
              <span className="font-bold text-stone-900">
                Enable separate sales tax line item on checkout
              </span>
            </label>

            {taxSettings.taxEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tax Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxSettings.taxRatePercent}
                    onChange={(e) =>
                      setTaxSettings({ ...taxSettings, taxRatePercent: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tax Display Label</label>
                  <input
                    type="text"
                    value={taxSettings.taxLabel}
                    onChange={(e) => setTaxSettings({ ...taxSettings, taxLabel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Tax Settings"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: ADMIN ACCOUNT */}
      {activeTab === "account" && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-sm font-bold text-stone-900">Administrator Account & Privileges</h2>
            <p className="text-xs text-stone-500">Active store manager credentials and backend authentication readiness.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Administrator Name</label>
              <input
                type="text"
                value={`${user?.firstName || "Store"} ${user?.lastName || "Administrator"}`}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-700 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Admin Email Address</label>
              <input
                type="email"
                value={user?.email || "admin@novastore.pk"}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-700 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Assigned Role</label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100">
                <Shield className="w-4 h-4 text-amber-600" />
                <span className="font-extrabold text-stone-900">ADMINISTRATOR (Single-Vendor Owner)</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Active Session Scope</label>
              <input
                type="text"
                value="Full Store Management Access"
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 font-medium"
              />
            </div>
          </div>

          {/* Backend / Supabase Security Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>Production Backend Architecture Note</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900">
              In this development environment, administrator authentication is managed securely through <code>adminAuthService</code>. When deploying to production with Supabase, authentication tokens and roles are verified server-side with Row Level Security (RLS) policies.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
