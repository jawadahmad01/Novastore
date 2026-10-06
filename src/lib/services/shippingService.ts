import { siteConfig } from "@/src/config/site";

export interface ShippingCalculation {
  cost: number;
  isFree: boolean;
  thresholdRemaining: number;
  estimatedDelivery: string;
  method: "standard" | "express";
}

export const shippingService = {
  /**
   * Calculate shipping rate based on subtotal, destination, and selected speed
   */
  calculateShipping(
    subtotal: number,
    method: "standard" | "express" = "standard",
    province?: string
  ): ShippingCalculation {
    const threshold = siteConfig.shipping.freeShippingThreshold;
    const isFree = subtotal >= threshold;
    const remaining = Math.max(0, threshold - subtotal);

    let cost = 0;
    let estimatedDelivery = siteConfig.shipping.estimatedDeliveryStandard;

    if (method === "express") {
      cost = siteConfig.shipping.expressFlatRate;
      estimatedDelivery = siteConfig.shipping.estimatedDeliveryExpress;
    } else {
      cost = isFree ? 0 : siteConfig.shipping.standardFlatRate;
    }

    // Optional remote province adjustments (e.g. Gilgit-Baltistan or remote Balochistan)
    if (province && (province.includes("Gilgit") || province.includes("Balochistan"))) {
      if (cost > 0) cost += 100; // Small remote surcharge placeholder
      estimatedDelivery = "4 – 6 Business Days";
    }

    return {
      cost,
      isFree: cost === 0,
      thresholdRemaining: remaining,
      estimatedDelivery,
      method,
    };
  },

  getFreeShippingThreshold(): number {
    return siteConfig.shipping.freeShippingThreshold;
  },
};
