import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { CartItem, Product, ProductVariant, Coupon } from "@/src/types";
import { couponService } from "@/src/lib/services/couponService";
import { shippingService } from "@/src/lib/services/shippingService";
import { taxService } from "@/src/lib/services/taxService";
import { analytics } from "@/src/lib/analytics";
import { hubspot } from "@/src/lib/hubspot";
import { useToast } from "@/src/context/ToastContext";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  appliedCoupon: Coupon | null;
  isCartOpen: boolean;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  isFreeShipping: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "novastore_cart_v1";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Cart save failed", e);
    }
  }, [items]);

  // Subtotal calculation
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  // Item count
  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  // Shipping calculation
  const shippingCalculation = useMemo(() => {
    return shippingService.calculateShipping(subtotal, "standard");
  }, [subtotal]);

  // Tax calculation
  const taxCalculation = useMemo(() => {
    return taxService.calculateTax(subtotal);
  }, [subtotal]);

  // Discount calculation based on coupon
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.minOrderAmount && subtotal < appliedCoupon.minOrderAmount) {
      return 0;
    }
    if (appliedCoupon.discountType === "percentage") {
      const calc = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      return appliedCoupon.maxDiscount ? Math.min(calc, appliedCoupon.maxDiscount) : calc;
    }
    return Math.min(appliedCoupon.discountValue, subtotal);
  }, [subtotal, appliedCoupon]);

  // Grand Total
  const total = useMemo(() => {
    return Math.max(0, subtotal - discount + shippingCalculation.cost + taxCalculation.taxAmount);
  }, [subtotal, discount, shippingCalculation.cost, taxCalculation.taxAmount]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addItem = useCallback(
    (product: Product, variant?: ProductVariant, quantity = 1) => {
      // Determine unit price (base price + any variant price modifier)
      const unitPrice = variant?.priceModifier ? product.price + variant.priceModifier : product.price;
      const itemId = variant ? `${product.id}__${variant.id}` : product.id;

      // Available stock
      const availableStock = variant ? variant.stock : product.stock;
      if (availableStock <= 0) {
        showToast(`Sorry, "${product.title}" is out of stock.`, "error");
        return;
      }

      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex((i) => i.id === itemId);

        if (existingIndex > -1) {
          const existing = prevItems[existingIndex];
          const newQty = Math.min(existing.quantity + quantity, availableStock);
          const updated = [...prevItems];
          updated[existingIndex] = {
            ...existing,
            quantity: newQty,
          };
          return updated;
        }

        const newItem: CartItem = {
          id: itemId,
          product,
          selectedVariant: variant,
          quantity: Math.min(quantity, availableStock),
          price: unitPrice,
        };

        return [...prevItems, newItem];
      });

      // Feedback & side-effects
      const itemTitle = variant ? `${product.title} (${variant.value})` : product.title;
      showToast(`Added "${itemTitle}" to your cart.`, "success");
      openCart();

      // Fire analytics
      analytics.trackAddToCart({
        id: itemId,
        product,
        selectedVariant: variant,
        quantity,
        price: unitPrice,
      });
    },
    [openCart, showToast]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      const target = items.find((i) => i.id === itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      if (target) {
        analytics.trackRemoveFromCart(target);
        showToast(`Removed "${target.product.title}" from your cart.`, "info");
      }
    },
    [items, showToast]
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(itemId);
        return;
      }

      setItems((prev) => {
        return prev.map((item) => {
          if (item.id === itemId) {
            const maxStock = item.selectedVariant ? item.selectedVariant.stock : item.product.stock;
            const finalQty = Math.min(quantity, maxStock);
            return { ...item, quantity: finalQty };
          }
          return item;
        });
      });
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const applyCoupon = useCallback(
    async (code: string) => {
      const res = await couponService.validateCoupon(code, subtotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        showToast(`Promo code "${res.coupon.code}" applied! You saved Rs. ${res.discountAmount.toLocaleString()}.`, "success");
        return { success: true, message: `Promo code "${res.coupon.code}" applied!` };
      } else {
        const errorMsg = res.errorMessage || "Invalid coupon code.";
        showToast(errorMsg, "error");
        return { success: false, message: errorMsg };
      }
    },
    [subtotal, showToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast("Promo coupon removed.", "info");
  }, [showToast]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        shipping: shippingCalculation.cost,
        tax: taxCalculation.taxAmount,
        total,
        appliedCoupon,
        isCartOpen,
        freeShippingThreshold: shippingService.getFreeShippingThreshold(),
        freeShippingRemaining: shippingCalculation.thresholdRemaining,
        isFreeShipping: shippingCalculation.isFree,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
