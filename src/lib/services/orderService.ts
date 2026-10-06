import { Order, OrderStatus, PaymentStatus, OrderItem } from "@/src/types";
import { supabase, isSupabaseConfigured } from "@/src/lib/supabaseClient";
import { productService } from "./productService";

const ORDERS_STORAGE_KEY = "novastore_orders";

// Seed realistic Pakistani e-commerce orders for rich admin demonstration
const SEED_ORDERS: Order[] = [
  {
    id: "ord_demo_01",
    orderNumber: "NV-89104",
    customer: {
      firstName: "Hamza",
      lastName: "Khan",
      email: "customer@novastore.pk",
      phone: "0300-8451920",
      userId: "usr_seed_hamza_01",
    },
    items: [
      {
        productId: "prod_01",
        productTitle: "Wireless Noise-Cancelling Headphones Pro",
        productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        sku: "NV-AUD-001-BLK",
        variantDescription: "Midnight Black",
        quantity: 1,
        unitPrice: 12999,
        totalPrice: 12999,
      },
      {
        productId: "prod_03",
        productTitle: "65W GaN Fast Charger Multi-Port",
        productImage: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
        sku: "NV-PWR-003",
        quantity: 1,
        unitPrice: 3499,
        totalPrice: 3499,
      },
    ],
    subtotal: 16498,
    discount: 500,
    couponCode: "SAVE500",
    shipping: 0,
    shippingMethod: "standard",
    tax: 0,
    total: 15998,
    currency: "PKR",
    paymentMethod: "cod",
    paymentStatus: "Pending",
    orderStatus: "Processing",
    shippingAddress: {
      firstName: "Hamza",
      lastName: "Khan",
      email: "customer@novastore.pk",
      phone: "0300-8451920",
      province: "Punjab",
      city: "Lahore",
      area: "DHA Phase 5, Sector C",
      streetAddress: "Main Boulevard, Lane 4",
      houseFlatShopNumber: "House 184-C",
      postalCode: "54792",
      country: "Pakistan",
      deliveryInstructions: "Call before arrival",
    },
    notes: "Internal: Customer called to confirm evening delivery window.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "ord_demo_02",
    orderNumber: "NV-73412",
    customer: {
      firstName: "Ayesha",
      lastName: "Malik",
      email: "ayesha.malik@gmail.com",
      phone: "0321-4455667",
    },
    items: [
      {
        productId: "prod_02",
        productTitle: "Smart Fitness Watch Ultra GPS",
        productImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        sku: "NV-WTC-002-SLV",
        variantDescription: "Silver Edition",
        quantity: 1,
        unitPrice: 8999,
        totalPrice: 8999,
      },
    ],
    subtotal: 8999,
    discount: 0,
    shipping: 0,
    shippingMethod: "standard",
    tax: 0,
    total: 8999,
    currency: "PKR",
    paymentMethod: "bank_transfer",
    paymentStatus: "Awaiting Verification",
    orderStatus: "Pending",
    shippingAddress: {
      firstName: "Ayesha",
      lastName: "Malik",
      email: "ayesha.malik@gmail.com",
      phone: "0321-4455667",
      province: "Sindh",
      city: "Karachi",
      area: "Clifton Block 4",
      streetAddress: "Sea View Road, Near Dolmen Mall",
      houseFlatShopNumber: "Apartment 7-B",
      postalCode: "75600",
      country: "Pakistan",
      deliveryInstructions: "Leave with building reception.",
    },
    paymentReference: "MEEZAN-FT-9912048",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "ord_demo_03",
    orderNumber: "NV-62981",
    customer: {
      firstName: "Bilal",
      lastName: "Ahmed",
      email: "bilal.ahmed@yahoo.com",
      phone: "0333-7788990",
    },
    items: [
      {
        productId: "prod_04",
        productTitle: "Ergonomic Aluminium Laptop Stand",
        productImage: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80",
        sku: "NV-ACC-004",
        quantity: 2,
        unitPrice: 4299,
        totalPrice: 8598,
      },
    ],
    subtotal: 8598,
    discount: 859,
    couponCode: "WELCOME10",
    shipping: 0,
    shippingMethod: "standard",
    tax: 0,
    total: 7739,
    currency: "PKR",
    paymentMethod: "cod",
    paymentStatus: "Pending",
    orderStatus: "Shipped",
    shippingAddress: {
      firstName: "Bilal",
      lastName: "Ahmed",
      email: "bilal.ahmed@yahoo.com",
      phone: "0333-7788990",
      province: "Islamabad Capital Territory",
      city: "Islamabad",
      area: "Sector F-10/2",
      streetAddress: "Street 28, House 14",
      houseFlatShopNumber: "House 14",
      postalCode: "44000",
      country: "Pakistan",
    },
    notes: "Dispatched via TCS Tracking # 7719204821",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "ord_demo_04",
    orderNumber: "NV-51203",
    customer: {
      firstName: "Usman",
      lastName: "Tariq",
      email: "usman.tariq@outlook.com",
      phone: "0345-1239874",
    },
    items: [
      {
        productId: "prod_05",
        productTitle: "Minimalist Leather Cardholder Wallet",
        productImage: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
        sku: "NV-WAL-005-BRN",
        variantDescription: "Cognac Brown",
        quantity: 1,
        unitPrice: 2499,
        totalPrice: 2499,
      },
      {
        productId: "prod_06",
        productTitle: "Nordic Touch Bedside Atmosphere Lamp",
        productImage: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
        sku: "NV-LMP-006",
        quantity: 1,
        unitPrice: 5499,
        totalPrice: 5499,
      },
    ],
    subtotal: 7998,
    discount: 0,
    shipping: 0,
    shippingMethod: "standard",
    tax: 0,
    total: 7998,
    currency: "PKR",
    paymentMethod: "bank_transfer",
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    shippingAddress: {
      firstName: "Usman",
      lastName: "Tariq",
      email: "usman.tariq@outlook.com",
      phone: "0345-1239874",
      province: "Punjab",
      city: "Rawalpindi",
      area: "Bahria Town Phase 4",
      streetAddress: "Civic Center Blvd, Plaza 19",
      houseFlatShopNumber: "Suite 302",
      postalCode: "46000",
      country: "Pakistan",
    },
    paymentReference: "HBL-TRX-1092841",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

function mapDbOrderToOrder(dbOrder: any, items: any[] = []): Order {
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    customer: {
      firstName: dbOrder.customer_first_name,
      lastName: dbOrder.customer_last_name,
      email: dbOrder.customer_email,
      phone: dbOrder.customer_phone,
      userId: dbOrder.user_id || undefined,
    },
    items: items.map((it) => ({
      productId: it.product_id,
      productTitle: it.product_title,
      productImage: it.product_image,
      sku: it.sku,
      variantDescription: it.variant_description || undefined,
      quantity: Number(it.quantity),
      unitPrice: Number(it.unit_price),
      totalPrice: Number(it.total_price),
    })),
    subtotal: Number(dbOrder.subtotal),
    discount: Number(dbOrder.discount || 0),
    couponCode: dbOrder.coupon_code || undefined,
    shipping: Number(dbOrder.shipping || 0),
    shippingMethod: dbOrder.shipping_method as any || "standard",
    tax: Number(dbOrder.tax || 0),
    total: Number(dbOrder.total),
    currency: dbOrder.currency || "PKR",
    paymentMethod: dbOrder.payment_method,
    paymentStatus: dbOrder.payment_status,
    orderStatus: dbOrder.order_status,
    shippingAddress: typeof dbOrder.shipping_address === "string" ? JSON.parse(dbOrder.shipping_address) : dbOrder.shipping_address,
    paymentReference: dbOrder.payment_reference || undefined,
    notes: dbOrder.notes || undefined,
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at,
  };
}

export const orderService = {
  _ensureSeed(): void {
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(SEED_ORDERS));
      }
    } catch {}
  },

  _saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      window.dispatchEvent(new Event("novastore_orders_updated"));
    } catch (e) {
      console.error("Failed to save orders to localStorage", e);
    }
  },

  /**
   * Retrieve all saved orders from local persistence / Supabase
   */
  getAllOrders(): Order[] {
    this._ensureSeed();
    try {
      const data = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  /**
   * Asynchronous order fetch with Supabase synchronization
   */
  async getAllOrdersAsync(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data: dbOrders, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && dbOrders && dbOrders.length > 0) {
          const orderIds = dbOrders.map((o) => o.id);
          const { data: dbItems } = await supabase
            .from("order_items")
            .select("*")
            .in("order_id", orderIds);

          const itemsByOrder = new Map<string, any[]>();
          (dbItems || []).forEach((it) => {
            const list = itemsByOrder.get(it.order_id) || [];
            list.push(it);
            itemsByOrder.set(it.order_id, list);
          });

          const mapped = dbOrders.map((o) => mapDbOrderToOrder(o, itemsByOrder.get(o.id) || []));
          this._saveOrders(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn("Could not query orders from Supabase:", err);
      }
    }

    return this.getAllOrders();
  },

  async getOrderById(idOrNumber: string): Promise<Order | null> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from("orders").select("*");
        if (idOrNumber.startsWith("NV-")) {
          query = query.eq("order_number", idOrNumber);
        } else {
          query = query.eq("id", idOrNumber);
        }

        const { data: dbOrder, error } = await query.single();
        if (!error && dbOrder) {
          const { data: dbItems } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", dbOrder.id);

          return mapDbOrderToOrder(dbOrder, dbItems || []);
        }
      } catch (err) {
        console.warn("Could not fetch order from Supabase:", err);
      }
    }

    const orders = this.getAllOrders();
    const match = orders.find(
      (o) => o.id === idOrNumber || o.orderNumber.toLowerCase() === idOrNumber.toLowerCase()
    );
    return match || null;
  },

  async getOrdersByUser(userEmailOrId: string): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data: dbOrders, error } = await supabase
          .from("orders")
          .select("*")
          .or(`customer_email.ilike.${userEmailOrId},user_id.eq.${userEmailOrId}`)
          .order("created_at", { ascending: false });

        if (!error && dbOrders && dbOrders.length > 0) {
          const orderIds = dbOrders.map((o) => o.id);
          const { data: dbItems } = await supabase
            .from("order_items")
            .select("*")
            .in("order_id", orderIds);

          const itemsByOrder = new Map<string, any[]>();
          (dbItems || []).forEach((it) => {
            const list = itemsByOrder.get(it.order_id) || [];
            list.push(it);
            itemsByOrder.set(it.order_id, list);
          });

          return dbOrders.map((o) => mapDbOrderToOrder(o, itemsByOrder.get(o.id) || []));
        }
      } catch (err) {
        console.warn("Could not query user orders from Supabase:", err);
      }
    }

    const orders = this.getAllOrders();
    const cleanKey = userEmailOrId.toLowerCase().trim();
    return orders.filter(
      (o) =>
        o.customer.email.toLowerCase() === cleanKey ||
        o.customer.userId === userEmailOrId
    );
  },

  async createOrder(
    orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">
  ): Promise<Order> {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `NV-${randomDigits}`;
    const now = new Date().toISOString();
    let createdId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Sync to Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data: dbOrder, error } = await supabase
          .from("orders")
          .insert({
            order_number: orderNumber,
            user_id: orderData.customer.userId || null,
            customer_first_name: orderData.customer.firstName,
            customer_last_name: orderData.customer.lastName || "",
            customer_email: orderData.customer.email,
            customer_phone: orderData.customer.phone,
            subtotal: orderData.subtotal,
            discount: orderData.discount || 0,
            coupon_code: orderData.couponCode || null,
            shipping: orderData.shipping || 0,
            shipping_method: orderData.shippingMethod || "standard",
            tax: orderData.tax || 0,
            total: orderData.total,
            currency: orderData.currency || "PKR",
            payment_method: orderData.paymentMethod as any,
            payment_status: orderData.paymentStatus as any,
            order_status: orderData.orderStatus as any,
            shipping_address: orderData.shippingAddress as any,
            payment_reference: orderData.paymentReference || null,
            notes: orderData.notes || null,
          })
          .select()
          .single();

        if (error) throw error;

        if (dbOrder) {
          createdId = dbOrder.id;

          // Insert order items
          if (orderData.items && orderData.items.length > 0) {
            const itemRows = orderData.items.map((it) => ({
              order_id: dbOrder.id,
              product_id: it.productId,
              product_title: it.productTitle,
              product_image: it.productImage || "",
              sku: it.sku || "",
              variant_description: it.variantDescription || null,
              quantity: it.quantity,
              unit_price: it.unitPrice,
              total_price: it.totalPrice,
            }));
            await supabase.from("order_items").insert(itemRows);
          }

          // Track coupon usage if present
          if (orderData.couponCode) {
            try {
              const { data: couponData } = await supabase
                .from("coupons")
                .select("id, used_count")
                .ilike("code", orderData.couponCode)
                .single();

              if (couponData) {
                await supabase.from("coupon_usages").insert({
                  coupon_id: couponData.id,
                  user_id: orderData.customer.userId || null,
                  order_id: dbOrder.id,
                  discount_applied: orderData.discount || 0,
                });

                await supabase.from("coupons").update({
                  used_count: (couponData.used_count || 0) + 1,
                }).eq("id", couponData.id);
              }
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Could not insert order into Supabase:", err);
      }
    }

    const newOrder: Order = {
      ...orderData,
      id: createdId,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };

    const orders = this.getAllOrders();
    orders.unshift(newOrder);
    this._saveOrders(orders);

    // Auto-deduct inventory
    if (orderData.items && orderData.items.length > 0) {
      productService.deductInventoryForOrder(orderData.items).catch(() => {});
    }

    return newOrder;
  },

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const orders = this.getAllOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);

    if (index === -1) throw new Error("Order not found");

    const order = orders[index];
    if (order.orderStatus === "Shipped" || order.orderStatus === "Delivered") {
      throw new Error(`Cannot cancel order #${order.orderNumber} because it is already ${order.orderStatus.toLowerCase()}.`);
    }

    if (order.orderStatus === "Cancelled") {
      throw new Error("Order is already cancelled.");
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("orders").update({
          order_status: "Cancelled",
          notes: reason ? `${order.notes ? order.notes + " | " : ""}Cancellation reason: ${reason}` : order.notes,
        }).eq("id", order.id);
      } catch (err) {
        console.warn("Could not cancel order in Supabase:", err);
      }
    }

    const updatedOrder: Order = {
      ...order,
      orderStatus: "Cancelled",
      notes: reason ? `${order.notes ? order.notes + " | " : ""}Cancellation reason: ${reason}` : order.notes,
      updatedAt: new Date().toISOString(),
    };

    orders[index] = updatedOrder;
    this._saveOrders(orders);

    // Auto-restore inventory
    if (order.items && order.items.length > 0) {
      productService.restoreInventoryForOrder(order.items).catch(() => {});
    }

    return updatedOrder;
  },

  async attachBankReference(orderId: string, referenceNumber: string): Promise<Order | null> {
    const orders = this.getAllOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);

    if (index === -1) return null;

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("orders").update({
          payment_reference: referenceNumber,
          payment_status: "Awaiting Verification",
        }).eq("id", orders[index].id);
      } catch (err) {
        console.warn("Could not attach bank reference in Supabase:", err);
      }
    }

    orders[index] = {
      ...orders[index],
      paymentReference: referenceNumber,
      paymentStatus: "Awaiting Verification",
      updatedAt: new Date().toISOString(),
    };

    this._saveOrders(orders);
    return orders[index];
  },

  // ==========================================================================
  // ADMIN METHODS
  // ==========================================================================

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminNote?: string
  ): Promise<Order> {
    const orders = this.getAllOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);

    if (index === -1) throw new Error("Order not found");

    const current = orders[index];
    const now = new Date().toISOString();

    if (current.orderStatus === "Delivered" && newStatus === "Pending") {
      throw new Error("A delivered order cannot be reverted to pending directly.");
    }

    let updatedPaymentStatus = current.paymentStatus;
    if (newStatus === "Delivered" && current.paymentMethod === "cod" && current.paymentStatus === "Pending") {
      updatedPaymentStatus = "Paid";
    }

    const updatedNotes = adminNote
      ? `${current.notes ? current.notes + "\n" : ""}[${new Date().toLocaleDateString()}] ${adminNote}`
      : current.notes;

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("orders").update({
          order_status: newStatus as any,
          payment_status: updatedPaymentStatus as any,
          notes: updatedNotes || null,
        }).eq("id", current.id);
      } catch (err) {
        console.warn("Could not update order status in Supabase:", err);
      }
    }

    const updated: Order = {
      ...current,
      orderStatus: newStatus,
      paymentStatus: updatedPaymentStatus,
      notes: updatedNotes,
      updatedAt: now,
    };

    orders[index] = updated;
    this._saveOrders(orders);
    return updated;
  },

  async updatePaymentStatus(
    orderId: string,
    newPaymentStatus: PaymentStatus,
    adminNote?: string
  ): Promise<Order> {
    const orders = this.getAllOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);

    if (index === -1) throw new Error("Order not found");

    const current = orders[index];
    const now = new Date().toISOString();

    const updatedNotes = adminNote
      ? `${current.notes ? current.notes + "\n" : ""}[${new Date().toLocaleDateString()}] Payment updated to ${newPaymentStatus}: ${adminNote}`
      : current.notes;

    let newOrderStatus = current.orderStatus;
    if (newPaymentStatus === "Paid" && current.orderStatus === "Pending") {
      newOrderStatus = "Confirmed";
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("orders").update({
          payment_status: newPaymentStatus as any,
          order_status: newOrderStatus as any,
          notes: updatedNotes || null,
        }).eq("id", current.id);
      } catch (err) {
        console.warn("Could not update payment status in Supabase:", err);
      }
    }

    const updated: Order = {
      ...current,
      paymentStatus: newPaymentStatus,
      orderStatus: newOrderStatus,
      notes: updatedNotes,
      updatedAt: now,
    };

    orders[index] = updated;
    this._saveOrders(orders);
    return updated;
  },

  async addOrderNote(orderId: string, note: string): Promise<Order> {
    const orders = this.getAllOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (index === -1) throw new Error("Order not found");

    const current = orders[index];
    const updatedNotes = `${current.notes ? current.notes + "\n" : ""}[Admin Note - ${new Date().toLocaleDateString()}]: ${note}`;

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("orders").update({
          notes: updatedNotes,
        }).eq("id", current.id);
      } catch (err) {}
    }

    orders[index] = {
      ...current,
      notes: updatedNotes,
      updatedAt: new Date().toISOString(),
    };

    this._saveOrders(orders);
    return orders[index];
  },

  getAdminStats() {
    const orders = this.getAllOrders();

    const totalOrders = orders.length;
    const totalSales = orders
      .filter((o) => o.orderStatus !== "Cancelled")
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders.filter(
      (o) => o.orderStatus === "Pending" || o.orderStatus === "Confirmed"
    ).length;

    const completedOrders = orders.filter((o) => o.orderStatus === "Delivered").length;
    const pendingVerifications = orders.filter(
      (o) => o.paymentMethod === "bank_transfer" && o.paymentStatus === "Awaiting Verification"
    ).length;

    const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    return {
      totalOrders,
      totalSales,
      pendingOrders,
      completedOrders,
      pendingVerifications,
      avgOrderValue,
    };
  },
};
