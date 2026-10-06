import { CartItem, Product } from "@/src/types";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

/**
 * Privacy-Conscious Analytics Event Dispatcher for NOVA STORE
 * 
 * Supports standard e-commerce events compatible with:
 * - Google Analytics 4 (GA4) / Google Tag Manager
 * - Meta Pixel (Facebook)
 * - Custom Storefront Analytics
 */
export const analyticsService = {
  /**
   * Tracks standard page view
   */
  trackPageView(pagePath: string, pageTitle: string): void {
    if (typeof window === "undefined") return;

    if (window.dataLayer) {
      window.dataLayer.push({
        event: "page_view",
        page_path: pagePath,
        page_title: pageTitle,
      });
    }

    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }
  },

  /**
   * Product detail impression
   */
  trackViewItem(product: Product): void {
    if (typeof window === "undefined") return;

    const payload = {
      item_id: product.id,
      item_name: product.title,
      item_category: String(product.category),
      price: product.price,
      currency: product.currency || "PKR",
    };

    if (window.dataLayer) {
      window.dataLayer.push({
        event: "view_item",
        ecommerce: {
          currency: "PKR",
          value: product.price,
          items: [payload],
        },
      });
    }

    if (window.fbq) {
      window.fbq("track", "ViewContent", {
        content_name: product.title,
        content_ids: [product.id],
        content_type: "product",
        value: product.price,
        currency: "PKR",
      });
    }
  },

  /**
   * Add to cart event
   */
  trackAddToCart(item: CartItem): void {
    if (typeof window === "undefined") return;

    const payload = {
      item_id: item.product.id,
      item_name: item.product.title,
      item_category: String(item.product.category),
      item_variant: item.selectedVariant?.name || item.selectedVariant?.value,
      price: item.price,
      quantity: item.quantity,
    };

    if (window.dataLayer) {
      window.dataLayer.push({
        event: "add_to_cart",
        ecommerce: {
          currency: "PKR",
          value: item.price * item.quantity,
          items: [payload],
        },
      });
    }

    if (window.fbq) {
      window.fbq("track", "AddToCart", {
        content_name: item.product.title,
        content_ids: [item.product.id],
        content_type: "product",
        value: item.price * item.quantity,
        currency: "PKR",
      });
    }
  },

  /**
   * Checkout initiated
   */
  trackBeginCheckout(items: CartItem[], total: number): void {
    if (typeof window === "undefined") return;

    if (window.dataLayer) {
      window.dataLayer.push({
        event: "begin_checkout",
        ecommerce: {
          currency: "PKR",
          value: total,
          items: items.map((it) => ({
            item_id: it.product.id,
            item_name: it.product.title,
            price: it.price,
            quantity: it.quantity,
          })),
        },
      });
    }

    if (window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        num_items: items.length,
        value: total,
        currency: "PKR",
      });
    }
  },

  /**
   * Order completed / Purchase event
   */
  trackPurchase(orderNumber: string, total: number, items: any[], coupon?: string): void {
    if (typeof window === "undefined") return;

    if (window.dataLayer) {
      window.dataLayer.push({
        event: "purchase",
        ecommerce: {
          transaction_id: orderNumber,
          value: total,
          currency: "PKR",
          coupon: coupon || undefined,
          items: items.map((it) => ({
            item_id: it.productId,
            item_name: it.productTitle,
            price: it.unitPrice,
            quantity: it.quantity,
          })),
        },
      });
    }

    if (window.fbq) {
      window.fbq("track", "Purchase", {
        value: total,
        currency: "PKR",
        order_id: orderNumber,
      });
    }
  },

  /**
   * Search queries
   */
  trackSearch(searchTerm: string, resultsCount: number): void {
    if (typeof window === "undefined") return;

    if (window.dataLayer) {
      window.dataLayer.push({
        event: "search",
        search_term: searchTerm,
        results_count: resultsCount,
      });
    }
  },
};
