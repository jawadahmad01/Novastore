import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/src/context/CartContext";
import { formatPrice } from "@/src/lib/utils/formatters";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";
import { EmptyState } from "@/src/components/common/LoadingSkeleton";
import { ImageWithFallback } from "@/src/components/common/ImageWithFallback";
import { siteConfig } from "@/src/config/site";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  CheckCircle2,
  Tag,
  X,
  ShieldCheck,
} from "lucide-react";

export const CartPage: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    freeShippingRemaining,
    isFreeShipping,
  } = useCart();

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    setIsApplyingCoupon(true);
    await applyCoupon(promoCodeInput.trim());
    setIsApplyingCoupon(false);
    setPromoCodeInput("");
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs items={[{ label: "Cart" }]} />
        <div className="py-12">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is waiting for something great"
            description="Explore our curated catalog of electronics, apparel, and home essentials with nationwide Cash on Delivery in Pakistan."
            actionText="Start Shopping"
            actionHref="/products"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <Breadcrumbs items={[{ label: "Shopping Cart" }]} />

      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your shopping bag
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-stone-400 hover:text-rose-600 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Shipping Alert Bar */}
      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
        <div className="flex items-center gap-2 text-xs sm:text-sm mb-2">
          <Truck className="w-4 h-4 text-stone-800 shrink-0" />
          {isFreeShipping ? (
            <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              You qualify for FREE shipping nationwide across Pakistan!
            </span>
          ) : (
            <span className="text-stone-700">
              Add <strong className="text-stone-900">{formatPrice(freeShippingRemaining)}</strong> more to your order to unlock <strong>FREE Shipping</strong>.
            </span>
          )}
        </div>

        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isFreeShipping ? "bg-emerald-600" : "bg-stone-900"
            }`}
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Cart Items (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-2xs">
          {items.map((item) => (
            <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
              {/* Image */}
              <Link
                to={`/products/${item.product.slug}`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200"
              >
                <ImageWithFallback
                  src={item.product.thumbnail}
                  alt={item.product.title}
                  category={item.product.category}
                  className="w-full h-full object-cover"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="text-sm sm:text-base font-semibold text-stone-900 hover:text-stone-700 line-clamp-1"
                  >
                    {item.product.title}
                  </Link>

                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                    className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                  <span>{item.product.category}</span>
                  {item.selectedVariant && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-stone-700">{item.selectedVariant.value}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-stone-400">{item.selectedVariant?.sku || item.product.sku}</span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {/* Stepper */}
                  <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-stone-100 text-stone-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-stone-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-stone-100 text-stone-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-stone-400">{formatPrice(item.price)} each</div>
                    <div className="text-sm font-bold text-stone-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="p-4 bg-stone-50/50 flex justify-between items-center text-xs">
            <Link
              to="/products"
              className="text-stone-600 hover:text-stone-900 font-semibold underline"
            >
              ← Continue Shopping
            </Link>

            <span className="text-stone-400">All prices in Pakistani Rupee (PKR)</span>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
            <h2 className="text-base font-bold text-stone-900 tracking-tight pb-3 border-b border-stone-100">
              Order Summary
            </h2>

            {/* Calculations */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon ({appliedCoupon?.code})</span>
                  </span>
                  <span className="font-semibold">-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Shipping Nationwide</span>
                <span className="font-semibold text-stone-900">
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>

              <div className="border-t border-stone-200 pt-3 flex justify-between text-base font-extrabold text-stone-900">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="pt-2">
              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="text-xs text-emerald-900">
                    <p className="font-bold flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{appliedCoupon.code} Applied</span>
                    </p>
                    <p className="text-[11px] text-emerald-700">{appliedCoupon.description}</p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="p-1 text-emerald-600 hover:text-emerald-900 rounded"
                    aria-label="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Have a promo voucher?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder="e.g. WELCOME10"
                      className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs uppercase focus:outline-none focus:border-stone-900 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !promoCodeInput.trim()}
                      className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:opacity-40 transition-colors"
                    >
                      {isApplyingCoupon ? "Applying..." : "Apply"}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Try <strong>WELCOME10</strong> (10% off) or <strong>SAVE500</strong>.
                  </p>
                </form>
              )}
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3.5 px-4 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-md active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust note */}
            <div className="pt-2 text-[11px] text-stone-500 text-center space-y-1">
              <p className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cash on Delivery & Bank Transfer accepted nationwide.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
