import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { orderService } from "@/src/lib/services/orderService";
import { Order, OrderStatus, PaymentStatus } from "@/src/types";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { AdminEmptyState } from "@/src/components/admin/AdminEmptyState";
import { AdminLoadingState } from "@/src/components/admin/AdminLoadingState";
import { useToast } from "@/src/context/ToastContext";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Building2,
  Banknote,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export const AdminOrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const statusFilter = searchParams.get("status") || "all";
  const paymentFilter = searchParams.get("payment") || "all";
  const searchQuery = searchParams.get("search") || "";

  const loadOrders = () => {
    setIsLoading(true);
    try {
      let list = orderService.getAllOrders();

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.customer.firstName.toLowerCase().includes(q) ||
            o.customer.lastName.toLowerCase().includes(q) ||
            o.customer.email.toLowerCase().includes(q) ||
            o.customer.phone.toLowerCase().includes(q) ||
            (o.paymentReference && o.paymentReference.toLowerCase().includes(q))
        );
      }

      if (statusFilter !== "all") {
        list = list.filter(
          (o) => o.orderStatus.toLowerCase() === statusFilter.toLowerCase()
        );
      }

      if (paymentFilter !== "all") {
        list = list.filter(
          (o) => o.paymentStatus.toLowerCase() === paymentFilter.toLowerCase()
        );
      }

      setOrders(list);
    } catch {
      showToast("Failed to load orders", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const handleUpdate = () => loadOrders();
    window.addEventListener("novastore_orders_updated", handleUpdate);
    return () => window.removeEventListener("novastore_orders_updated", handleUpdate);
  }, [statusFilter, paymentFilter, searchQuery]);

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val && val !== "all") {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const statusTabs: Array<{ id: string; label: string }> = [
    { id: "all", label: "All Orders" },
    { id: "Pending", label: "Pending" },
    { id: "Confirmed", label: "Confirmed" },
    { id: "Processing", label: "Processing" },
    { id: "Shipped", label: "Shipped" },
    { id: "Delivered", label: "Delivered" },
    { id: "Cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">
            Customer Orders ({orders.length})
          </h1>
          <p className="text-xs text-stone-500">
            Track fulfillment, verify bank transfers, and process shipments across Pakistan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-stone-100 rounded-xl text-xs font-bold text-stone-700">
            Pakistan PKR Orders
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
        {/* Status Scrollable Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => updateParam("status", tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                statusFilter.toLowerCase() === tab.id.toLowerCase()
                  ? "bg-stone-900 text-white shadow-2xs"
                  : "bg-stone-50 hover:bg-stone-100 text-stone-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Payment Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateParam("search", e.target.value)}
              placeholder="Search by order # (e.g. NV-89104), customer name, email, phone, reference..."
              className="w-full pl-10 pr-3.5 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={paymentFilter}
              onChange={(e) => updateParam("payment", e.target.value)}
              className="w-full px-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-stone-900"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Awaiting Verification">Pending Verification (Bank)</option>
              <option value="Pending">Pending (COD)</option>
              <option value="Refunded">Refunded</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Order Content */}
      {isLoading ? (
        <AdminLoadingState message="Loading orders..." />
      ) : orders.length === 0 ? (
        <AdminEmptyState
          icon={ShoppingCart}
          title="No orders found"
          description="No customer orders matched your active filter or search query."
          actionLabel="Clear Filters"
          onAction={() => setSearchParams(new URLSearchParams())}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Payment Method</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Order Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Order Number */}
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/admin/orders/${ord.id}`}
                        className="font-mono font-bold text-stone-900 hover:text-amber-600 hover:underline"
                      >
                        {ord.orderNumber}
                      </Link>
                      <span className="text-[10px] text-stone-400 block font-normal">
                        {ord.items.length} line item(s)
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-stone-900">
                        {ord.customer.firstName} {ord.customer.lastName}
                      </p>
                      <p className="text-[11px] text-stone-500">{ord.shippingAddress.city}, {ord.shippingAddress.province}</p>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 text-stone-600 text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString("en-PK", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-3 font-extrabold text-stone-900">
                      Rs. {ord.total.toLocaleString()}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-stone-700">
                        {ord.paymentMethod === "cod" ? (
                          <>
                            <Banknote className="w-3.5 h-3.5 text-stone-500" />
                            <span>Cash on Delivery</span>
                          </>
                        ) : ord.paymentMethod === "bank_transfer" ? (
                          <>
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Bank Transfer</span>
                          </>
                        ) : (
                          <span>Card</span>
                        )}
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-3">
                      <StatusBadge type="payment" status={ord.paymentStatus} size="sm" />
                    </td>

                    {/* Order Status */}
                    <td className="py-3.5 px-3">
                      <StatusBadge type="order" status={ord.orderStatus} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/orders/${ord.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Orders Cards View */}
          <div className="md:hidden space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-stone-900">
                      {ord.orderNumber}
                    </span>
                    <StatusBadge type="order" status={ord.orderStatus} size="sm" />
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {new Date(ord.createdAt).toLocaleDateString("en-PK", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-stone-900">
                    {ord.customer.firstName} {ord.customer.lastName}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {ord.customer.phone} • {ord.shippingAddress.city}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-stone-900 block">
                      Rs. {ord.total.toLocaleString()}
                    </span>
                    <StatusBadge type="payment" status={ord.paymentStatus} size="sm" />
                  </div>

                  <Link
                    to={`/admin/orders/${ord.id}`}
                    className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <span>View Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
