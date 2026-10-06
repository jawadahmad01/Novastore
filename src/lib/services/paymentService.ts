import { PaymentMethodType, PaymentStatus, Order } from "@/src/types";
import { siteConfig } from "@/src/config/site";

export interface PaymentInitializationResult {
  success: boolean;
  paymentMethod: PaymentMethodType;
  initialStatus: PaymentStatus;
  instructionMessage: string;
  transactionReference?: string;
  requiresRedirect?: boolean;
  redirectUrl?: string;
}

export interface BankTransferDetails {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  instructions: string;
}

export const paymentService = {
  /**
   * Get supported payment methods and active status
   */
  getAvailableMethods(): Array<{
    id: PaymentMethodType;
    title: string;
    description: string;
    badge?: string;
    isReady: boolean;
  }> {
    return [
      {
        id: "cod",
        title: "Cash on Delivery (COD)",
        description: "Pay with cash at your doorstep upon receiving your package.",
        badge: "Most Popular in Pakistan",
        isReady: true,
      },
      {
        id: "bank_transfer",
        title: "Direct Bank Transfer / IBFT",
        description: "Transfer directly using Raast, Meezan, HBL, or any Pakistani mobile banking app.",
        badge: "Zero Surcharge",
        isReady: true,
      },
      {
        id: "card",
        title: "Credit / Debit Card (Visa / Mastercard)",
        description: "Secure gateway ready. (Will route to certified payment gateway upon production activation).",
        badge: "Gateway Ready",
        isReady: true,
      },
    ];
  },

  /**
   * Fetch bank account details for direct transfer
   */
  getBankDetails(): BankTransferDetails {
    return {
      bankName: siteConfig.bankDetails.bankName,
      accountTitle: siteConfig.bankDetails.accountTitle,
      accountNumber: siteConfig.bankDetails.accountNumber,
      iban: siteConfig.bankDetails.iban,
      instructions: siteConfig.bankDetails.instructions,
    };
  },

  /**
   * Process and validate payment execution state
   * Crucial: We NEVER claim card or bank transfer is verified/paid without real gateway callback
   */
  async processPayment(
    method: PaymentMethodType,
    orderAmount: number,
    paymentMeta?: {
      bankReference?: string;
      cardHolderName?: string;
      cardLast4?: string;
    }
  ): Promise<PaymentInitializationResult> {
    // Artificial small delay for realistic UX feedback
    await new Promise((resolve) => setTimeout(resolve, 300));

    switch (method) {
      case "cod":
        return {
          success: true,
          paymentMethod: "cod",
          initialStatus: "Pending",
          instructionMessage: `Cash on Delivery confirmed. Please keep Rs. ${orderAmount.toLocaleString()} ready at the time of delivery.`,
        };

      case "bank_transfer":
        return {
          success: true,
          paymentMethod: "bank_transfer",
          initialStatus: "Awaiting Verification",
          transactionReference: paymentMeta?.bankReference || undefined,
          instructionMessage: `Transfer initiated. Please transfer Rs. ${orderAmount.toLocaleString()} to ${siteConfig.bankDetails.bankName}. Our finance team will verify your receipt within 2 hours.`,
        };

      case "card":
        // Card Payment Adapter Abstraction:
        // Production integrations (Stripe, JazzCash, EasyPaisa, PayFast) will initialize a secure token or session here.
        // We do NOT store card numbers and do NOT falsely claim it's "Paid" until the webhook confirms it.
        return {
          success: true,
          paymentMethod: "card",
          initialStatus: "Pending",
          instructionMessage: "Card authorization session prepared. In production, this handshakes with 3D Secure / OTP.",
          transactionReference: `GATEWAY-SESSION-${Date.now().toString(36).toUpperCase()}`,
        };

      default:
        throw new Error("Unsupported payment method");
    }
  },
};
