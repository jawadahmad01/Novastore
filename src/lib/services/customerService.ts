import { User, Order } from "@/src/types";
import { orderService } from "./orderService";
import { supabase, isSupabaseConfigured } from "@/src/lib/supabaseClient";

const REGISTERED_USERS_KEY = "novastore_registered_users";

export interface AdminCustomerSummary {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate?: string;
  isRegistered: boolean;
  createdAt: string;
  role: string;
  defaultCity?: string;
}

export const customerService = {
  /**
   * Aggregate all customers (registered accounts + guest buyers from orders)
   */
  async getAllCustomers(search?: string): Promise<AdminCustomerSummary[]> {
    const customerMap = new Map<string, AdminCustomerSummary>();

    // 1. Fetch from Supabase profiles if configured
    if (isSupabaseConfigured()) {
      try {
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, email, first_name, last_name, phone, role, created_at");

        if (!error && profiles) {
          profiles.forEach((p) => {
            const email = p.email.toLowerCase();
            customerMap.set(email, {
              id: p.id,
              fullName: `${p.first_name} ${p.last_name}`.trim() || email.split("@")[0],
              email: p.email,
              phone: p.phone || "—",
              orderCount: 0,
              totalSpent: 0,
              isRegistered: true,
              createdAt: p.created_at,
              role: p.role,
              defaultCity: undefined,
            });
          });
        }
      } catch (err) {
        console.warn("Could not query profiles from Supabase:", err);
      }
    }

    // 2. Supplement from local registered users
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_KEY);
      if (raw) {
        const records = JSON.parse(raw);
        records.forEach((r: any) => {
          const u: User = r.user;
          const email = u.email.toLowerCase();
          if (!customerMap.has(email)) {
            customerMap.set(email, {
              id: u.id,
              fullName: `${u.firstName} ${u.lastName}`.trim(),
              email: u.email,
              phone: u.phone || "—",
              orderCount: 0,
              totalSpent: 0,
              isRegistered: true,
              createdAt: u.createdAt,
              role: u.role || "CUSTOMER",
              defaultCity: u.defaultAddress?.city || u.savedAddresses?.[0]?.city || undefined,
            });
          }
        });
      }
    } catch {}

    // 3. Populate order metrics
    const allOrders = orderService.getAllOrders();

    allOrders.forEach((ord) => {
      const email = ord.customer.email.toLowerCase();
      const existing = customerMap.get(email);

      if (existing) {
        existing.orderCount += 1;
        if (ord.orderStatus !== "Cancelled") {
          existing.totalSpent += ord.total;
        }
        if (!existing.lastOrderDate || new Date(ord.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = ord.createdAt;
        }
        if (existing.phone === "—" && ord.customer.phone) {
          existing.phone = ord.customer.phone;
        }
        if (!existing.defaultCity && ord.shippingAddress.city) {
          existing.defaultCity = ord.shippingAddress.city;
        }
      } else {
        // Guest customer record
        customerMap.set(email, {
          id: `gst_${Math.abs(email.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`,
          fullName: `${ord.customer.firstName} ${ord.customer.lastName}`.trim(),
          email: ord.customer.email,
          phone: ord.customer.phone || "—",
          orderCount: 1,
          totalSpent: ord.orderStatus !== "Cancelled" ? ord.total : 0,
          lastOrderDate: ord.createdAt,
          isRegistered: false,
          createdAt: ord.createdAt,
          role: "CUSTOMER",
          defaultCity: ord.shippingAddress.city,
        });
      }
    });

    let list = Array.from(customerMap.values());

    // Search filter
    if (search && search.trim().length > 0) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.defaultCity && c.defaultCity.toLowerCase().includes(q))
      );
    }

    // Sort by total spent / newest
    list.sort((a, b) => b.totalSpent - a.totalSpent || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list;
  },

  /**
   * Get customer details and their order history by ID or email
   */
  async getCustomerDetails(customerIdOrEmail: string): Promise<{
    customer: AdminCustomerSummary | null;
    orders: Order[];
    user?: User;
  }> {
    const all = await this.getAllCustomers();
    const clean = customerIdOrEmail.toLowerCase().trim();

    const customer = all.find(
      (c) => c.id === customerIdOrEmail || c.email.toLowerCase() === clean
    ) || null;

    if (!customer) {
      return { customer: null, orders: [] };
    }

    const orders = await orderService.getOrdersByUser(customer.email);

    let fullUser: User | undefined;
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_KEY);
      if (raw) {
        const records = JSON.parse(raw);
        const match = records.find((r: any) => r.user.email.toLowerCase() === customer.email.toLowerCase());
        if (match) fullUser = match.user;
      }
    } catch {}

    return {
      customer,
      orders,
      user: fullUser,
    };
  },

  getTotalCustomerCount(): number {
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_KEY);
      if (raw) {
        return JSON.parse(raw).length;
      }
    } catch {}
    return 1;
  },
};
