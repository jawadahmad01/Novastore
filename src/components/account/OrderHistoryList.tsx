import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Order, OrderStatus } from "@/src/types";
import { formatPrice, formatDate } from "@/src/lib/utils/formatters";
import {
  Package,
  Eye,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
} from "lucide-react";

interface OrderHistoryListProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

export const OrderHistoryList: React.FC<OrderHistoryListProps> = ({
  orders,
  onSelectOrder,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-200">
            Delivered
          </span>
        );
      case "Shipped":
        return (
          <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-blue-200">
            Shipped
          </span>
        );
      case "Processing":
        return (
          <span className="bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-amber-200">
            Processing
          </span>
        );
      case "Confirmed":
        return (
          <span className="bg-stone-100 text-stone-800 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-stone-200">
            Confirmed
          </span>
        );
      case "Cancelled":
        return (
          <span className="bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-rose-200">
            Cancelled
          </span>
        );
      case "Pending":
      default:
        return (
          <span className="bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-stone-200">
            Pending
          </span>
        );
    }
  };

  const statuses = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus =
      selectedStatus === "All" ||
      ord.orderStatus.toLowerCase() === selectedStatus.toLowerCase();

    const matchesQuery =
      searchQuery.trim() === "" ||
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      ord.items.some((item) =>
        item.productTitle.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {statuses.map((status) => {
            const count =
              status === "All"
                ? orders.length
                : orders.filter((o) => o.orderStatus.toLowerCase() === status.toLowerCase())
                    .length;

            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedStatus === status
                    ? "bg-stone-900 text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                }`}
              >
                <span>{status}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedStatus === status
                      ? "bg-white/20 text-white"
                      : "bg-white text-stone-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order # or item..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-900">
            {orders.length === 0 ? "No Orders Placed Yet" : "No Matching Orders Found"}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {orders.length === 0
              ? "You haven't placed any orders with NOVA STORE yet. Explore our curated catalog to get started."
              : "Try adjusting your search query or filter to find what you are looking for."}
          </p>
          {orders.length === 0 && (
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs hover:border-stone-300 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-sm text-stone-900">
                      #{ord.orderNumber}
                    </span>
                    {getStatusBadge(ord.orderStatus)}
                    <span className="text-xs text-stone-400">
                      · Payment: <strong className="text-stone-700">{ord.paymentStatus}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Placed on {formatDate(ord.createdAt)} · {ord.items.length}{" "}
                    {ord.items.length === 1 ? "item" : "items"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[11px] text-stone-400">Total Amount</p>
                    <p className="text-sm sm:text-base font-extrabold text-stone-900">
                      {formatPrice(ord.total)}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectOrder(ord)}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>

              {/* Items Preview Strip */}
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                {ord.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 shrink-0 bg-stone-50 p-2.5 rounded-xl border border-stone-100 min-w-[200px]"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productTitle}
                      className="w-11 h-11 rounded-lg object-cover bg-white border border-stone-200 shrink-0"
                    />
                    <div className="text-xs min-w-0 flex-1">
                      <p className="font-semibold text-stone-900 truncate" title={item.productTitle}>
                        {item.productTitle}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Qty: {item.quantity} · {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
