import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderService } from "@/src/lib/services/orderService";
import { productService } from "@/src/lib/services/productService";
import {
  Bell,
  Building2,
  AlertTriangle,
  Clock,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

export const AdminNotificationMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      title: string;
      message: string;
      link: string;
      type: "bank" | "stock" | "order";
      timestamp: string;
    }>
  >([]);

  useEffect(() => {
    const loadNotifications = async () => {
      const orders = orderService.getAllOrders();
      const lowStock = await productService.getLowStockProducts(5);

      const items: Array<{
        id: string;
        title: string;
        message: string;
        link: string;
        type: "bank" | "stock" | "order";
        timestamp: string;
      }> = [];

      // Bank transfer verifications
      orders
        .filter((o) => o.paymentMethod === "bank_transfer" && o.paymentStatus === "Awaiting Verification")
        .forEach((o) => {
          items.push({
            id: `notif_bank_${o.id}`,
            title: "Bank Transfer Verification Required",
            message: `Order #${o.orderNumber} (${o.customer.firstName}) reference: ${o.paymentReference || "Manual submission"}`,
            link: `/admin/orders/${o.id}`,
            type: "bank",
            timestamp: "Action Required",
          });
        });

      // Low stock alerts
      lowStock.forEach((p) => {
        items.push({
          id: `notif_stock_${p.id}`,
          title: p.stock <= 0 ? "Product Out of Stock" : "Low Stock Alert",
          message: `${p.title} has only ${p.stock} units remaining (SKU: ${p.sku})`,
          link: `/admin/products/${p.id}/edit`,
          type: "stock",
          timestamp: p.stock <= 0 ? "Critical" : "Attention",
        });
      });

      // Pending orders
      orders
        .filter((o) => o.orderStatus === "Pending")
        .slice(0, 3)
        .forEach((o) => {
          items.push({
            id: `notif_ord_${o.id}`,
            title: "New Order Received",
            message: `Order #${o.orderNumber} placed for Rs. ${o.total.toLocaleString()}`,
            link: `/admin/orders/${o.id}`,
            type: "order",
            timestamp: "Recent",
          });
        });

      setNotifications(items);
    };

    loadNotifications();

    const refreshHandler = () => loadNotifications();
    window.addEventListener("novastore_orders_updated", refreshHandler);
    window.addEventListener("novastore_catalog_updated", refreshHandler);

    return () => {
      window.removeEventListener("novastore_orders_updated", refreshHandler);
      window.removeEventListener("novastore_catalog_updated", refreshHandler);
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 250)}
        className="relative p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
        aria-label="Admin notifications"
      >
        <Bell className="w-5 h-5 stroke-[1.8]" />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-stone-900 text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 py-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-4 pb-2.5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-stone-900">Notifications</h4>
              <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded-md text-[10px] font-bold">
                {notifications.length}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-medium">Auto-synced</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="font-semibold text-stone-800">All Clear</p>
                <p className="text-[11px] text-stone-400">No pending alerts or low stock warnings.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  to={n.link}
                  onClick={() => setIsOpen(false)}
                  className="p-3 hover:bg-stone-50 transition-colors flex items-start gap-3 block"
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                      n.type === "bank"
                        ? "bg-amber-100 text-amber-800"
                        : n.type === "stock"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {n.type === "bank" && <Building2 className="w-4 h-4" />}
                    {n.type === "stock" && <AlertTriangle className="w-4 h-4" />}
                    {n.type === "order" && <Clock className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {n.title}
                      </p>
                      <span className="text-[10px] font-bold text-amber-700 shrink-0">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="px-4 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <Link
              to="/admin/orders"
              onClick={() => setIsOpen(false)}
              className="text-stone-600 hover:text-stone-900 font-semibold flex items-center gap-1"
            >
              <span>View Orders</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              to="/admin/products"
              onClick={() => setIsOpen(false)}
              className="text-stone-600 hover:text-stone-900 font-semibold flex items-center gap-1"
            >
              <span>View Inventory</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
