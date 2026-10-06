/**
 * Centralized Site and Business Configuration
 * Everything is fully configurable for easy rebranding, multi-currency expansion,
 * and localization without code changes in components.
 */

export interface SiteConfig {
  brand: {
    name: string;
    legalName: string;
    tagline: string;
    description: string;
    logoUrl?: string;
    announcement: string;
  };
  market: {
    country: string;
    countryCode: string;
    phoneCode: string;
    provinces: string[];
    majorCities: { [province: string]: string[] };
  };
  currency: {
    code: string;
    symbol: string;
    locale: string;
    decimalPlaces: number;
  };
  contact: {
    email: string;
    supportEmail: string;
    phone: string;
    displayPhone: string;
    address: string;
    businessHours: string;
    whatsappNumber: string;
  };
  bankDetails: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    branchCode: string;
    isPlaceholder: boolean;
    instructions: string;
  };
  shipping: {
    freeShippingThreshold: number;
    standardFlatRate: number;
    expressFlatRate: number;
    estimatedDeliveryStandard: string;
    estimatedDeliveryExpress: string;
  };
  tax: {
    enabled: boolean;
    ratePercentage: number;
    taxLabel: string;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
  };
}

export const siteConfig: SiteConfig = {
  brand: {
    name: "NOVA STORE",
    legalName: "Nova Commerce Retailers Ltd.",
    tagline: "Quality, Delivered Across Pakistan",
    description: "Discover curated electronics, apparel, lifestyle accessories, and modern home essentials with dependable Cash on Delivery and prompt delivery.",
    announcement: "⚡ FREE Shipping nationwide on all orders over Rs. 3,500! Cash on Delivery available.",
  },
  market: {
    country: "Pakistan",
    countryCode: "PK",
    phoneCode: "+92",
    provinces: [
      "Punjab",
      "Sindh",
      "Khyber Pakhtunkhwa",
      "Islamabad Capital Territory",
      "Balochistan",
      "Azad Jammu & Kashmir",
      "Gilgit-Baltistan",
    ],
    majorCities: {
      "Punjab": ["Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Sialkot", "Bahawalpur", "Sargodha", "Sheikhupura"],
      "Sindh": ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Mirpur Khas", "Nawabshah"],
      "Islamabad Capital Territory": ["Islamabad"],
      "Khyber Pakhtunkhwa": ["Peshawar", "Mardan", "Abbottabad", "Swat", "Nowshera", "Kohat"],
      "Balochistan": ["Quetta", "Gwadar", "Turbat", "Khuzdar", "Sibi"],
      "Azad Jammu & Kashmir": ["Muzaffarabad", "Mirpur", "Rawalakot", "Kotli"],
      "Gilgit-Baltistan": ["Gilgit", "Skardu", "Hunza"],
    },
  },
  currency: {
    code: "PKR",
    symbol: "Rs.",
    locale: "en-PK",
    decimalPlaces: 0,
  },
  contact: {
    email: "support@novastore.pk",
    supportEmail: "care@novastore.pk",
    phone: "+92 300 0123456",
    displayPhone: "0300-0123456",
    address: "Nova Commercial Centre, Main Boulevard, Gulberg III, Lahore, Pakistan",
    businessHours: "Monday – Saturday: 9:00 AM – 9:00 PM PKT",
    whatsappNumber: "+923000123456",
  },
  bankDetails: {
    bankName: "[BANK NAME]",
    accountTitle: "[ACCOUNT TITLE]",
    accountNumber: "[ACCOUNT NUMBER]",
    iban: "[IBAN]",
    branchCode: "[BRANCH CODE]",
    isPlaceholder: true,
    instructions: "Please note: These bank details are placeholders for demonstration and will be replaced with real business banking details. Enter your transaction/reference ID after transferring.",
  },
  shipping: {
    freeShippingThreshold: 3500,
    standardFlatRate: 250,
    expressFlatRate: 450,
    estimatedDeliveryStandard: "2 – 4 Business Days",
    estimatedDeliveryExpress: "1 – 2 Business Days (Karachi, Lahore, Islamabad)",
  },
  tax: {
    enabled: false, // In Pakistan, prices in retail are generally inclusive of GST unless calculated at checkout
    ratePercentage: 0,
    taxLabel: "GST (Included)",
  },
  socialLinks: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    youtube: "https://youtube.com",
  },
};
