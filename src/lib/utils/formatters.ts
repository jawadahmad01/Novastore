import { siteConfig } from "@/src/config/site";

/**
 * Format numeric amount into standardized PKR currency display (e.g., Rs. 4,999)
 */
export function formatPrice(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${siteConfig.currency.symbol} 0`;
  }

  // Format with commas according to Pakistani / South Asian or standard numeric formatting
  const formattedNumber = new Intl.NumberFormat(siteConfig.currency.locale, {
    minimumFractionDigits: siteConfig.currency.decimalPlaces,
    maximumFractionDigits: siteConfig.currency.decimalPlaces,
  }).format(amount);

  return `${siteConfig.currency.symbol} ${formattedNumber}`;
}

/**
 * Calculate discount percentage between original price and sale price
 */
export function calculateDiscountPercentage(currentPrice: number, compareAtPrice?: number): number {
  if (!compareAtPrice || compareAtPrice <= currentPrice) return 0;
  return Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100);
}

/**
 * Validate Pakistani phone number format
 * Valid formats:
 * - 03001234567 (11 digits starting with 03)
 * - +923001234567 (13 characters starting with +923)
 * - 0300-1234567 or 0300 1234567
 */
export function isValidPakistaniPhone(phone: string): boolean {
  if (!phone) return false;
  // Clean spaces, hyphens, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  
  // Regex: 03XXXXXXXXX (11 digits) or +923XXXXXXXXX (13 chars) or 923XXXXXXXXX (12 chars)
  const pkPhoneRegex = /^((\+92)|(0092)|(92)|(0))3[0-9]{9}$/;
  return pkPhoneRegex.test(cleanPhone);
}

/**
 * Format Pakistani phone into clean display format (03XX-XXXXXXX)
 */
export function formatPakistaniPhone(phone: string): string {
  if (!phone) return "";
  let clean = phone.replace(/[\s\-\(\)]/g, "");
  if (clean.startsWith("+92")) {
    clean = "0" + clean.slice(3);
  } else if (clean.startsWith("92")) {
    clean = "0" + clean.slice(2);
  }
  if (clean.length === 11 && clean.startsWith("03")) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }
  return phone;
}

/**
 * Format date for order history and reviews
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}
