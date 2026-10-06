/**
 * Provider-Independent Analytics Architecture
 * Ready for Google Analytics 4, Meta Pixel, TikTok Pixel, and server-side tracking.
 * UI components call these abstract methods without being bound to specific vendors.
 */

import { Product, CartItem, Order } from "@/src/types";

export const analytics = {
  /**
   * Track virtual page views
   */
  trackPageView(pageTitle: string, path: string): void {
    if (typeof window !== "undefined") {
      // Future: window.gtag?.('event', 'page_view', { page_title: pageTitle, page_path: path });
    }
  },

  /**
   * Track product view (eCommerce view_item)
   */
  trackProductView(product: Product): void {
    if (typeof window !== "undefined") {
      // Future: window.gtag?.('event', 'view_item', { currency: 'PKR', value: product.price, items: [...] });
    }
  },

  /**
   * Track live search queries
   */
  trackSearch(query: string, resultCount: number): void {
    if (typeof window !== "undefined") {
      // Future: window.gtag?.('event', 'search', { search_term: query, results_count: resultCount });
    }
  },

  /**
   * Track item added to cart
   */
  trackAddToCart(item: CartItem): void {
    if (typeof window !== "undefined") {
      // Future: window.gtag?.('event', 'add_to_cart', { currency: 'PKR', value: item.price * item.quantity, items: [...] });
    }
  },

  /**
   * Track item removed from cart
   */
  trackRemoveFromCart(item: CartItem): void {
    if (typeof window !== "undefined") {
      // Future: window.gtag?.('event', 'remove_from_cart', { currency: 'PKR', value: item.price * item.quantity });
    }
  },

  /**
   * Track checkout initiation
   */
  trackBeginCheckout(items: CartItem[], cartTotal: number): void {
    if (typeof window !== "undefined") {
      // Future: window.gtag?.('event', 'begin_checkout', { currency: 'PKR', value: cartTotal });
    }
  },

  /**
   * Track completed purchase
   */
  trackPurchase(order: Order): void {
    if (typeof window !== "undefined") {
      // Future: window.gtag?.('event', 'purchase', { transaction_id: order.orderNumber, value: order.total, currency: 'PKR' });
    }
  },

  /**
   * Track newsletter signup
   */
  trackNewsletterSignup(email: string, source: string): void {
    if (typeof window !== "undefined") {
      // Future: window.gtag?.('event', 'generate_lead', { lead_type: 'newsletter', source });
    }
  },

  /**
   * Track wishlist addition
   */
  trackWishlistAdd(product: Product): void {
    if (typeof window !== "undefined") {
      // Future: window.gtag?.('event', 'add_to_wishlist', { currency: 'PKR', value: product.price });
    }
  },
};
