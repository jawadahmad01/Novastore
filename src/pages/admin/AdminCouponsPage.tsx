import React, { useState, useEffect } from "react";
import { couponService } from "@/src/lib/services/couponService";
import { Coupon } from "@/src/types";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { AdminEmptyState } from "@/src/components/admin/AdminEmptyState";
import { AdminLoadingState } from "@/src/components/admin/AdminLoadingState";
import { useToast } from "@/src/context/ToastContext";
import {
  TicketPercent,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Calendar,
  Percent,
  DollarSign,
} from "lucide-react";

export const AdminCouponsPage: React.FC = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form values
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("10");
  const [minOrderAmount, setMinOrderAmount] = useState("2000");
  const [maxDiscount, setMaxDiscount] = useState("2000");
  const [expiryDate, setExpiryDate] = useState("2026-12-31");
  const [usageLimit, setUsageLimit] = useState("500");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const list = await couponService.getAllCouponsAdmin();
      setCoupons(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("10");
    setMinOrderAmount("2000");
    setMaxDiscount("2000");
    setExpiryDate("2026-12-31");
    setUsageLimit("500");
    setDescription("");
    setIsActive(true);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cpn: Coupon) => {
    setEditingCoupon(cpn);
    setCode(cpn.code);
    setDiscountType(cpn.discountType);
    setDiscountValue(cpn.discountValue.toString());
    setMinOrderAmount(cpn.minOrderAmount ? cpn.minOrderAmount.toString() : "");
    setMaxDiscount(cpn.maxDiscount ? cpn.maxDiscount.toString() : "");
    setExpiryDate(cpn.expiryDate || "");
    setUsageLimit(cpn.usageLimit ? cpn.usageLimit.toString() : "");
    setDescription(cpn.description || "");
    setIsActive(cpn.isActive);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (cpn: Coupon) => {
    try {
      const updated = await couponService.toggleCoupon(cpn.id || cpn.code, !cpn.isActive);
      showToast(`Coupon "${cpn.code}" is now ${updated.isActive ? "Active" : "Disabled"}.`, "info");
      loadCoupons();
    } catch (err: any) {
      showToast(err.message || "Failed to update coupon status", "error");
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast("Coupon code is required.", "error");
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      showToast("Discount value must be greater than 0.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Coupon> = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        expiryDate: expiryDate.trim() || undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        description: description.trim() || `${discountType === "percentage" ? discountValue + "% off" : "Rs. " + discountValue + " off"} store promotion`,
        isActive,
      };

      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon.id || editingCoupon.code, payload);
        showToast(`Coupon "${code}" updated.`, "success");
      } else {
        await couponService.createCoupon(payload);
        showToast(`Coupon "${code}" created successfully.`, "success");
      }

      setIsFormOpen(false);
      loadCoupons();
    } catch (err: any) {
      showToast(err.message || "Failed to save coupon", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;
    setIsDeleting(true);
    try {
      await couponService.deleteCoupon(couponToDelete.id || couponToDelete.code);
      showToast(`Coupon "${couponToDelete.code}" deleted.`, "success");
      setCouponToDelete(null);
      loadCoupons();
    } catch (err: any) {
      showToast(err.message || "Failed to delete coupon", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">
            Promotional Coupons ({coupons.length})
          </h1>
          <p className="text-xs text-stone-500">
            Configure checkout discount codes, percentage vouchers, and minimum spend limits.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Coupon</span>
        </button>
      </div>

      {/* Coupons Grid */}
      {isLoading ? (
        <AdminLoadingState message="Loading coupons..." />
      ) : coupons.length === 0 ? (
        <AdminEmptyState
          icon={TicketPercent}
          title="No coupons created"
          description="Create promotional coupon codes to offer customer discounts at checkout."
          actionLabel="+ Create Coupon"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((cpn) => (
            <div
              key={cpn.id || cpn.code}
              className={`bg-white rounded-3xl border p-5 sm:p-6 space-y-4 shadow-2xs transition-all ${
                cpn.isActive ? "border-stone-200" : "border-stone-200 bg-stone-50/60 opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm sm:text-base text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 tracking-wider">
                      {cpn.code}
                    </span>
                    {cpn.isActive ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-bold">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed pt-1">
                    {cpn.description}
                  </p>
                </div>

                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center shrink-0">
                  {cpn.discountType === "percentage" ? "%" : "Rs"}
                </div>
              </div>

              {/* Specs & Limits */}
              <div className="space-y-1.5 text-[11px] text-stone-600 pt-2 border-t border-stone-100">
                <div className="flex justify-between">
                  <span className="text-stone-400">Discount:</span>
                  <span className="font-bold text-stone-900">
                    {cpn.discountType === "percentage"
                      ? `${cpn.discountValue}% Off`
                      : `Flat Rs. ${cpn.discountValue.toLocaleString()} Off`}
                  </span>
                </div>

                {cpn.minOrderAmount && (
                  <div className="flex justify-between">
                    <span className="text-stone-400">Min. Order Value:</span>
                    <span className="font-semibold text-stone-800">
                      Rs. {cpn.minOrderAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                {cpn.maxDiscount && (
                  <div className="flex justify-between">
                    <span className="text-stone-400">Max Discount Cap:</span>
                    <span className="font-semibold text-stone-800">
                      Rs. {cpn.maxDiscount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-stone-400">Usage Progress:</span>
                  <span className="font-semibold text-stone-800">
                    {cpn.usedCount || 0} / {cpn.usageLimit ? cpn.usageLimit : "Unlimited"}
                  </span>
                </div>

                {cpn.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-stone-400">Expires:</span>
                    <span className="font-semibold text-stone-800">
                      {new Date(cpn.expiryDate).toLocaleDateString("en-PK", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(cpn)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    cpn.isActive
                      ? "bg-stone-100 hover:bg-stone-200 text-stone-700"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {cpn.isActive ? "Disable" : "Enable"}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cpn)}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                    title="Edit Coupon"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCouponToDelete(cpn)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Coupon Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create Promotional Coupon"}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER20"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 font-mono font-bold text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold focus:outline-none focus:border-stone-900"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed PKR Amount (Rs.)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "percentage" ? "10" : "500"}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 font-bold text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Min. Order Amount (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="2000"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Max Discount Cap (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="Optional cap"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Total Redemption Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="500"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description / Badge Copy
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 10% off on your first order"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-stone-900 focus:ring-stone-900 h-4 w-4"
                  />
                  <span className="font-semibold text-stone-800">
                    Active (Can be redeemed at checkout)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!couponToDelete}
        title="Delete Coupon?"
        message={`Are you sure you want to delete coupon code "${couponToDelete?.code}"? Customers will no longer be able to use it at checkout.`}
        confirmLabel="Delete Coupon"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCouponToDelete(null)}
      />
    </div>
  );
};
