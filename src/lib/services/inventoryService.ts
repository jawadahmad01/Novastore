import { Product, ProductVariant } from "@/src/types";

export interface StockStatus {
  inStock: boolean;
  isLowStock: boolean;
  availableQuantity: number;
  label: "In Stock" | "Low Stock" | "Out of Stock";
  displayText: string;
}

export const inventoryService = {
  /**
   * Determine stock availability and badge text
   */
  getStockStatus(product: Product, variant?: ProductVariant): StockStatus {
    const qty = variant ? variant.stock : product.stock;

    if (qty <= 0) {
      return {
        inStock: false,
        isLowStock: false,
        availableQuantity: 0,
        label: "Out of Stock",
        displayText: "Currently out of stock",
      };
    }

    if (qty <= 5) {
      return {
        inStock: true,
        isLowStock: true,
        availableQuantity: qty,
        label: "Low Stock",
        displayText: `Only ${qty} left in stock - order soon`,
      };
    }

    return {
      inStock: true,
      isLowStock: false,
      availableQuantity: qty,
      label: "In Stock",
      displayText: "In Stock & Ready to Ship",
    };
  },

  /**
   * Validate if a requested quantity is available
   */
  canFulfillQuantity(product: Product, requestedQuantity: number, variant?: ProductVariant): boolean {
    const available = variant ? variant.stock : product.stock;
    return requestedQuantity > 0 && requestedQuantity <= available;
  },
};
