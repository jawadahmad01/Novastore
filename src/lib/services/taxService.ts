import { siteConfig } from "@/src/config/site";

export interface TaxCalculation {
  taxAmount: number;
  ratePercentage: number;
  isIncludedInPrice: boolean;
  label: string;
}

export const taxService = {
  /**
   * Calculate applicable taxes for cart subtotal
   */
  calculateTax(subtotal: number): TaxCalculation {
    if (!siteConfig.tax.enabled || siteConfig.tax.ratePercentage === 0) {
      return {
        taxAmount: 0,
        ratePercentage: 0,
        isIncludedInPrice: true,
        label: siteConfig.tax.taxLabel,
      };
    }

    const taxAmount = Math.round((subtotal * siteConfig.tax.ratePercentage) / 100);

    return {
      taxAmount,
      ratePercentage: siteConfig.tax.ratePercentage,
      isIncludedInPrice: false,
      label: `${siteConfig.tax.taxLabel} (${siteConfig.tax.ratePercentage}%)`,
    };
  },
};
