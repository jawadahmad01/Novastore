import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { orderService } from "@/src/lib/services/orderService";
import { Order } from "@/src/types";
import { formatPrice, formatDate } from "@/src/lib/utils/formatters";
import { siteConfig } from "@/src/config/site";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Banknote,
  Building2,
  CreditCard,
  ArrowRight,
  Copy,
  Check,
  Send,
} from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bankRefInput, setBankRefInput] = useState("");
  const [hasCopiedRef, setHasCopiedRef] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      setIsLoading(true);
      try {
        const found = await orderService.getOrderById(orderId);
        setOrder(found);
      } catch (e) {
        console.error("Error loading order", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();

    // Trigger celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0f172a", "#10b981", "#f59e0b", "#3b82f6"],
      });
    } catch {}
  }, [orderId]);

  const handleAttachRef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankRefInput.trim() || !order) return;

    try {
      const updated = await orderService.attachBankReference(order.id, bankRefInput.trim());
      if (updated) {
        setOrder(updated);
        showToast("Bank reference recorded! Our team will verify your payment.", "success");
        setBankRefInput("");
      }
    } catch {
      showToast("Failed to save reference. Please try again.", "error");
    }
  };

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setHasCopiedRef(true);
    showToast("Order number copied!", "info");
    setTimeout(() => setHasCopiedRef(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-500">Loading your order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-stone-500 mb-6">
          We could not find an order matching that identifier.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success Hero Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Thank You! Your Order is Confirmed
        </h1>

        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          We sent a confirmation receipt to{" "}
          <strong className="text-stone-900">{order.customer.email}</strong>. Our courier team will dispatch your parcel promptly.
        </p>

        {/* Order Reference Pill */}
        <div className="inline-flex items-center gap-2 bg-stone-100 px-4 py-2 rounded-xl text-xs font-mono font-bold text-stone-900 border border-stone-200">
          <span>Order #{order.orderNumber}</span>
          <button
            onClick={copyOrderNumber}
            className="text-stone-500 hover:text-stone-900 transition-colors"
            title="Copy order number"
          >
            {hasCopiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Payment Instruction Banner */}
      {order.paymentMethod === "cod" && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5 text-xs text-emerald-950">
          <Banknote className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-emerald-900 mb-0.5">
              Cash on Delivery (COD) Selected
            </h4>
            <p className="leading-relaxed">
              Please keep <strong>{formatPrice(order.total)}</strong> in cash ready at your doorstep. The courier rider will collect this amount upon handing over your parcel.
            </p>
          </div>
        </div>
      )}

      {order.paymentMethod === "bank_transfer" && (
        <div className="p-5 sm:p-6 rounded-2xl bg-blue-50 border border-blue-200 space-y-3 text-xs text-blue-950">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-blue-900 mb-0.5">
                Direct Bank Transfer Instructions
              </h4>
              <p>
                Status: <strong className="text-blue-800">{order.paymentStatus}</strong>. Please transfer{" "}
                <strong>{formatPrice(order.total)}</strong> to our official business account below:
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-blue-200/80 font-mono text-[11px] space-y-1.5 text-stone-800">
            <div className="flex justify-between">
              <span>Bank Name:</span>
              <strong className="text-stone-900">{siteConfig.bankDetails.bankName}</strong>
            </div>
            <div className="flex justify-between">
              <span>Account Title:</span>
              <strong className="text-stone-900">{siteConfig.bankDetails.accountTitle}</strong>
            </div>
            <div className="flex justify-between">
              <span>Account Number:</span>
              <strong className="text-stone-900">{siteConfig.bankDetails.accountNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span>IBAN:</span>
              <strong className="text-stone-900">{siteConfig.bankDetails.iban}</strong>
            </div>
          </div>

          {order.paymentReference ? (
            <p className="text-xs text-emerald-700 font-medium">
              Payment reference submitted: <strong>{order.paymentReference}</strong>. Verification in progress.
            </p>
          ) : (
            <form onSubmit={handleAttachRef} className="pt-2 flex gap-2">
              <input
                type="text"
                value={bankRefInput}
                onChange={(e) => setBankRefInput(e.target.value)}
                placeholder="Enter Raast / Bank Transaction ID"
                className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Submit Slip ID</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Order Details Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-2xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-100">
          Order Summary
        </h3>

        {/* Items */}
        <div className="divide-y divide-stone-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 first:pt-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.productImage}
                  alt={item.productTitle}
                  className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                />
                <div>
                  <p className="text-xs font-semibold text-stone-900">{item.productTitle}</p>
                  <p className="text-[11px] text-stone-500">
                    Qty: {item.quantity} {item.variantDescription ? `· ${item.variantDescription}` : ""}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-stone-900">
                {formatPrice(item.totalPrice)}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-stone-900">{formatPrice(order.subtotal)}</span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount ({order.couponCode || "Coupon"})</span>
              <span className="font-semibold">-{formatPrice(order.discount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-semibold text-stone-900">
              {order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}
            </span>
          </div>

          <div className="border-t border-stone-200 pt-3 flex justify-between text-sm sm:text-base font-extrabold text-stone-900">
            <span>Total Paid / Due</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Delivery Address & Customer Details */}
        <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>Delivery Address</span>
            </p>
            <p className="text-stone-700 font-medium">
              {order.shippingAddress.houseFlatShopNumber}, {order.shippingAddress.streetAddress}
            </p>
            <p className="text-stone-600">
              {order.shippingAddress.area}, {order.shippingAddress.city}, {order.shippingAddress.province}
            </p>
            <p className="text-stone-600 font-mono mt-0.5">{order.shippingAddress.phone}</p>
          </div>

          <div>
            <p className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-stone-400" />
              <span>Courier Delivery</span>
            </p>
            <p className="text-stone-700">
              Speed: {order.shippingMethod === "express" ? "Priority Express (1–2 Days)" : "Standard Delivery (2–4 Days)"}
            </p>
            <p className="text-stone-500 mt-1">
              Estimated delivery: <strong>{siteConfig.shipping.estimatedDeliveryStandard}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link
          to="/products"
          className="w-full sm:w-auto px-6 py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors text-center shadow-sm flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          to="/account/orders"
          className="w-full sm:w-auto px-6 py-3 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors text-center"
        >
          View My Orders
        </Link>
      </div>
    </div>
  );
};
