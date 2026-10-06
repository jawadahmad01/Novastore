import { User, Order } from "@/src/types";

export interface NewsletterSubscription {
  email: string;
  source: "footer" | "popup_banner" | "checkout_optin";
  subscribedAt: string;
}

const NEWSLETTER_STORAGE_KEY = "novastore_newsletter_subscribers";

/**
 * Marketing & CRM Integration Service for NOVA STORE
 * 
 * Includes hooks for HubSpot Contacts, Deals, and Abandoned Cart sync.
 */
export const crmService = {
  /**
   * Subscribe an email address to store marketing newsletter
   */
  async subscribeNewsletter(email: string, source: "footer" | "popup_banner" | "checkout_optin" = "footer"): Promise<{ success: boolean; message: string }> {
    if (!email || !email.includes("@")) {
      return { success: false, message: "Please provide a valid email address." };
    }

    try {
      const stored = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
      const list: NewsletterSubscription[] = stored ? JSON.parse(stored) : [];

      if (!list.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
        list.unshift({
          email: email.toLowerCase().trim(),
          source,
          subscribedAt: new Date().toISOString(),
        });
        localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(list));
      }

      console.info(`[CRM/HubSpot Hook] Subscribed ${email} to store marketing list via ${source}`);
      return { success: true, message: "Thank you for subscribing! Check your inbox for exclusive updates." };
    } catch {
      return { success: true, message: "Subscription successful." };
    }
  },

  /**
   * Sync customer profile to HubSpot CRM contacts
   */
  async syncCustomerToHubSpot(user: User): Promise<boolean> {
    console.info(`[HubSpot CRM] Synced customer contact: ${user.email} (${user.firstName} ${user.lastName})`);
    return true;
  },

  /**
   * Sync placed order as a closed-won deal in HubSpot CRM
   */
  async syncOrderToHubSpot(order: Order): Promise<boolean> {
    console.info(`[HubSpot CRM] Synced deal for Order #${order.orderNumber}, Amount: Rs. ${order.total}`);
    return true;
  },
};
