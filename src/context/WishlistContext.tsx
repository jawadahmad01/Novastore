import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/src/types";
import { useCart } from "@/src/context/CartContext";
import { useToast } from "@/src/context/ToastContext";
import { useAuth } from "@/src/context/AuthContext";
import { wishlistService } from "@/src/lib/services/wishlistService";
import { analytics } from "@/src/lib/analytics";

interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  moveToCart: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_STORAGE_KEY = "novastore_wishlist_v1";

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Load / sync wishlist when user logs in
  useEffect(() => {
    if (user?.id) {
      wishlistService.syncGuestWishlistOnLogin(user.id).then((syncedItems) => {
        if (syncedItems && syncedItems.length > 0) {
          setWishlist(syncedItems);
        }
      });
    }
  }, [user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to persist wishlist", e);
    }
  }, [wishlist]);

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlist.some((p) => p.id === productId);
    },
    [wishlist]
  );

  const addToWishlist = useCallback(
    (product: Product) => {
      if (wishlist.some((p) => p.id === product.id)) return;
      setWishlist((prev) => [...prev, product]);
      wishlistService.addToWishlist(product, user?.id);
      analytics.trackWishlistAdd(product);
      showToast(`Saved "${product.title}" to your wishlist.`, "success");
    },
    [wishlist, showToast, user?.id]
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      const item = wishlist.find((p) => p.id === productId);
      setWishlist((prev) => prev.filter((p) => p.id !== productId));
      wishlistService.removeFromWishlist(productId, user?.id);
      if (item) {
        showToast(`Removed "${item.title}" from wishlist.`, "info");
      }
    },
    [wishlist, showToast, user?.id]
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist]
  );

  const moveToCart = useCallback(
    (product: Product) => {
      addItem(product);
      removeFromWishlist(product.id);
    },
    [addItem, removeFromWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        moveToCart,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
