import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/src/context/CartContext";
import { formatPrice } from "@/src/lib/utils/formatters";
import { ImageWithFallback } from "@/src/components/common/ImageWithFallback";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Truck,
  CheckCircle2,
} from "lucide-react";

export const CartDrawer: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    freeShippingThreshold,
    freeShippingRemaining,
    isFreeShipping,
  } = useCart();

  const navigate = useNavigate();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-stone-800" />
            <h2 className="text-base font-bold text-stone-900">Your Cart</h2>
            <span className="text-xs bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-full">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>

          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Tier Banner */}
        <div className="bg-stone-50 px-5 py-3 border-b border-stone-200/60">
          <div className="flex items-center gap-2 text-xs mb-1.5">
            <Truck className="w-4 h-4 text-stone-700 shrink-0" />
            {isFreeShipping ? (
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                You unlocked FREE shipping nationwide!
              </span>
            ) : (
              <span className="text-stone-700">
                Add <strong className="text-stone-900">{formatPrice(freeShippingRemaining)}</strong> more for <strong>FREE Shipping</strong>
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isFreeShipping ? "bg-emerald-600" : "bg-stone-900"
              }`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-stone-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1">Your cart is waiting for something great</h3>
              <p className="text-xs text-stone-500 max-w-xs mb-6">
                Explore our curated collections of electronics, apparel, and lifestyle gear across Pakistan.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  navigate("/products");
                }}
                className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 flex gap-3.5">
                {/* Thumbnail */}
                <Link
                  to={`/products/${item.product.slug}`}
                  onClick={closeCart}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200"
                >
                  <ImageWithFallback
                    src={item.product.thumbnail}
                    alt={item.product.title}
                    category={item.product.category}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        to={`/products/${item.product.slug}`}
                        onClick={closeCart}
                        className="text-xs sm:text-sm font-medium text-stone-900 hover:text-stone-700 line-clamp-1"
                      >
                        {item.product.title}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                        className="text-stone-400 hover:text-rose-600 transition-colors p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.selectedVariant && (
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Variant: <span className="font-medium text-stone-700">{item.selectedVariant.value}</span>
                      </p>
                    )}

                    <div className="mt-1 font-semibold text-xs text-stone-900">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between mt-2 pt-1">
                    <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-semibold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-xs font-bold text-stone-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Totals & CTA */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 p-5 bg-stone-50/60 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-semibold">-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-stone-900">
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>

              <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-bold text-stone-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  closeCart();
                  navigate("/cart");
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold transition-colors"
              >
                View Full Cart
              </button>

              <button
                onClick={() => {
                  closeCart();
                  navigate("/checkout");
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-center text-stone-400">
              Cash on Delivery & Bank Transfer accepted nationwide.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
