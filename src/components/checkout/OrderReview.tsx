import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Address, CartItem, PaymentMethodType } from "@/src/types";
import { formatPrice } from "@/src/lib/utils/formatters";
import { siteConfig } from "@/src/config/site";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building2,
  Banknote,
  MapPin,
  User,
  AlertCircle,
  Lock,
} from "lucide-react";

interface OrderReviewProps {
  address: Address;
  paymentMethod: PaymentMethodType;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  shippingMethod: "standard" | "express";
  tax: number;
  total: number;
  bankReference?: string;
  isSubmitting: boolean;
  onBack: () => void;
  onPlaceOrder: () => void;
}

export const OrderReview: React.FC<OrderReviewProps> = ({
  address,
  paymentMethod,
  items,
  subtotal,
  discount,
  shipping,
  shippingMethod,
  tax,
  total,
  bankReference,
  isSubmitting,
  onBack,
  onPlaceOrder,
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!agreedToTerms) {
      setError("You must agree to the Terms & Conditions before placing your order.");
      return;
    }
    setError("");
    onPlaceOrder();
  };

  const paymentLabels: Record<PaymentMethodType, { name: string; icon: any }> = {
    cod: { name: "Cash on Delivery (COD)", icon: Banknote },
    bank_transfer: { name: "Direct Bank Transfer / IBFT", icon: Building2 },
    card: { name: "Credit / Debit Card (Gateway Ready)", icon: CreditCard },
  };

  const SelectedPaymentIcon = paymentLabels[paymentMethod].icon;

  return (
    <div className="space-y-6">
      {/* 1. Customer & Shipping Summary */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-stone-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            <span>Customer & Delivery Details</span>
          </h3>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-stone-500 hover:text-stone-900 underline font-medium"
          >
            Change
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-stone-400 mb-0.5">Recipient</p>
            <p className="font-semibold text-stone-900 text-sm">
              {address.firstName} {address.lastName}
            </p>
            <p className="text-stone-600 mt-1">{address.email}</p>
            <p className="text-stone-600 font-mono">{address.phone}</p>
          </div>

          <div>
            <p className="text-stone-400 mb-0.5">Shipping Address</p>
            <p className="font-medium text-stone-800">
              {address.houseFlatShopNumber}, {address.streetAddress}
            </p>
            <p className="text-stone-700">
              {address.area}
            </p>
            <p className="text-stone-700 font-medium">
              {address.tehsil ? `${address.tehsil}, ` : ""}{address.district || address.city}
              {address.division ? ` (${address.division})` : ""}
            </p>
            <p className="text-stone-500 text-[11px]">
              {address.province}, {address.country || "Pakistan"} {address.postalCode ? `· ${address.postalCode}` : ""}
            </p>
            {address.deliveryInstructions && (
              <p className="text-stone-500 italic mt-1 bg-stone-50 p-2 rounded">
                Note: "{address.deliveryInstructions}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Payment Method Summary */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-stone-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
            <SelectedPaymentIcon className="w-3.5 h-3.5" />
            <span>Payment Method</span>
          </h3>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-stone-500 hover:text-stone-900 underline font-medium"
          >
            Change
          </button>
        </div>

        <div className="text-xs text-stone-700 flex items-center gap-2">
          <span className="font-bold text-stone-900">{paymentLabels[paymentMethod].name}</span>
          {paymentMethod === "cod" && (
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
              Pay upon parcel delivery
            </span>
          )}
          {paymentMethod === "bank_transfer" && (
            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
              Awaiting verification
            </span>
          )}
        </div>

        {paymentMethod === "bank_transfer" && (
          <div className="bg-stone-50 p-3 rounded-xl text-xs text-stone-600">
            <p className="font-medium text-stone-800 mb-1">
              Beneficiary Bank: {siteConfig.bankDetails.bankName} ({siteConfig.bankDetails.accountTitle})
            </p>
            {bankReference ? (
              <p className="text-stone-600 font-mono">Reference: {bankReference}</p>
            ) : (
              <p className="text-stone-400">
                You can submit your transaction slip or ID after order confirmation.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Items Summary */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-100">
          Order Items ({items.length})
        </h3>

        <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.product.thumbnail}
                  alt={item.product.title}
                  className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-900 truncate">{item.product.title}</p>
                  <p className="text-[11px] text-stone-500">
                    Qty: {item.quantity} {item.selectedVariant ? `· ${item.selectedVariant.value}` : ""}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-stone-900 shrink-0">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Price Breakdown & Agreement */}
      <div className="bg-stone-50 p-5 sm:p-6 rounded-2xl border border-stone-200 space-y-4">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Promotional Discount</span>
              <span className="font-semibold">-{formatPrice(discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-stone-600">
            <span>
              Shipping ({shippingMethod === "express" ? "Priority Express" : "Standard Nationwide"})
            </span>
            <span className="font-semibold text-stone-900">
              {shipping === 0 ? "FREE" : formatPrice(shipping)}
            </span>
          </div>

          <div className="border-t border-stone-200 pt-3 flex justify-between text-base font-extrabold text-stone-900">
            <span>Final Grand Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="pt-2 border-t border-stone-200">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-600 select-none">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (e.target.checked) setError("");
              }}
              className="mt-0.5 rounded text-stone-900 focus:ring-stone-900"
            />
            <span>
              I agree to NOVA STORE's{" "}
              <Link to="/terms" target="_blank" className="text-stone-900 underline font-medium">
                Terms of Service
              </Link>{" "}
              and acknowledge the{" "}
              <Link to="/returns" target="_blank" className="text-stone-900 underline font-medium">
                Return & Refund Policy
              </Link>
              .
            </span>
          </label>

          {error && (
            <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Place Order CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors text-center"
          >
            ← Back to Payment
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Confirming Order...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Place Order ({formatPrice(total)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
