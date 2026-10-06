import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderService } from "@/src/lib/services/orderService";
import { productService } from "@/src/lib/services/productService";
import { customerService } from "@/src/lib/services/customerService";
import { Order, Product } from "@/src/types";
import { AdminStatCard } from "@/src/components/admin/AdminStatCard";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import {
  DollarSign,
  ShoppingCart,
  Clock,
  Package,
  AlertTriangle,
  Users,
  Plus,
  ArrowRight,
  Eye,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Edit,
  Tag,
  TicketPercent,
  Settings,
} from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    completedOrders: 0,
    pendingVerifications: 0,
    avgOrderValue: 0,
  });

  const [productCount, setProductCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [timeFilter, setTimeFilter] = useState<"today" | "7days" | "30days" | "12months">("7days");

  useEffect(() => {
    const loadDashboardData = async () => {
      const ordStats = orderService.getAdminStats();
      setStats(ordStats);

      const allOrders = orderService.getAllOrders();
      setRecentOrders(allOrders.slice(0, 5));

      const lowStock = await productService.getLowStockProducts(5);
      setLowStockProducts(lowStock.slice(0, 5));

      setProductCount(productService.getTotalCount());
      const customers = await customerService.getAllCustomers();
      setCustomerCount(customers.length);
    };

    loadDashboardData();

    const handleUpdate = () => loadDashboardData();
    window.addEventListener("novastore_orders_updated", handleUpdate);
    window.addEventListener("novastore_catalog_updated", handleUpdate);

    return () => {
      window.removeEventListener("novastore_orders_updated", handleUpdate);
      window.removeEventListener("novastore_catalog_updated", handleUpdate);
    };
  }, []);

  // Deterministic sales chart data based on timeframe
  const chartDatasets = {
    today: [
      { label: "00:00", sales: 8500, orders: 1 },
      { label: "04:00", sales: 0, orders: 0 },
      { label: "08:00", sales: 12999, orders: 1 },
      { label: "12:00", sales: 24500, orders: 2 },
      { label: "16:00", sales: 18900, orders: 2 },
      { label: "20:00", sales: 32000, orders: 3 },
    ],
    "7days": [
      { label: "Mon", sales: 24999, orders: 2 },
      { label: "Tue", sales: 41200, orders: 4 },
      { label: "Wed", sales: 31800, orders: 3 },
      { label: "Thu", sales: 54900, orders: 5 },
      { label: "Fri", sales: 68500, orders: 6 },
      { label: "Sat", sales: 82000, orders: 7 },
      { label: "Sun", sales: 74200, orders: 6 },
    ],
    "30days": [
      { label: "Week 1", sales: 185000, orders: 18 },
      { label: "Week 2", sales: 242000, orders: 24 },
      { label: "Week 3", sales: 298000, orders: 31 },
      { label: "Week 4", sales: 345000, orders: 36 },
    ],
    "12months": [
      { label: "Jan", sales: 420000, orders: 45 },
      { label: "Feb", sales: 510000, orders: 54 },
      { label: "Mar", sales: 680000, orders: 72 },
      { label: "Apr", sales: 790000, orders: 85 },
      { label: "May", sales: 620000, orders: 68 },
      { label: "Jun", sales: 850000, orders: 94 },
    ],
  };

  const activeChart = chartDatasets[timeFilter];
  const maxSalesVal = Math.max(...activeChart.map((d) => d.sales), 1000);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-900 text-white p-6 sm:p-7 rounded-3xl shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-400 text-stone-950 rounded-md text-[10px] font-black uppercase tracking-wider">
              Single-Vendor Store
            </span>
            <span className="text-xs text-stone-400 font-mono">
              Fulfillment: Pakistan
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            NOVA STORE Overview
          </h1>
          <p className="text-xs text-stone-400">
            Real-time management for orders, inventory, customers, and fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/admin/products/new"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-stone-700"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>View Orders</span>
          </Link>
        </div>
      </div>

      {/* Top 6 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <AdminStatCard
          title="Total Sales"
          value={`Rs. ${stats.totalSales.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: "+18%", isPositive: true }}
          description="Gross revenue"
        />

        <AdminStatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          trend={{ value: "+12%", isPositive: true }}
          description="Placed orders"
        />

        <AdminStatCard
          title="Pending Action"
          value={stats.pendingOrders}
          icon={Clock}
          highlight={stats.pendingOrders > 0}
          description={`${stats.pendingVerifications} bank transfer verification`}
        />

        <AdminStatCard
          title="Catalog Items"
          value={productCount}
          icon={Package}
          description="Active products"
        />

        <AdminStatCard
          title="Low Stock"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          highlight={lowStockProducts.length > 0}
          description={lowStockProducts.length > 0 ? "Requires restock" : "Inventory healthy"}
        />

        <AdminStatCard
          title="Customers"
          value={customerCount}
          icon={Users}
          description="Registered & buyers"
        />
      </div>

      {/* Sales Overview Chart Section */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 tracking-tight">
                Sales & Revenue Analytics
              </h2>
              <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-bold">
                PKR (Rs.)
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Average Order Value:{" "}
              <strong className="text-stone-900">
                Rs. {stats.avgOrderValue.toLocaleString()}
              </strong>{" "}
              • {stats.completedOrders} Orders Delivered
            </p>
          </div>

          {/* Timeframe filters */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            {(
              [
                { id: "today", label: "Today" },
                { id: "7days", label: "7 Days" },
                { id: "30days", label: "30 Days" },
                { id: "12months", label: "12 Months" },
              ] as const
            ).map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeFilter(tf.id)}
                className={`px-3 py-1.5 rounded-lg transition-all text-[11px] font-bold ${
                  timeFilter === tf.id
                    ? "bg-white text-stone-900 shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lightweight Responsive SVG/CSS Bar Graph */}
        <div className="pt-2">
          <div className="h-64 w-full flex items-end gap-2 sm:gap-6 pt-6 pb-2 border-b border-stone-200">
            {activeChart.map((bar, i) => {
              const heightPercent = Math.max(Math.round((bar.sales / maxSalesVal) * 100), 6);
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[10px] py-1 px-2 rounded-md font-mono whitespace-nowrap pointer-events-none mb-1 shadow-sm">
                    Rs. {bar.sales.toLocaleString()} ({bar.orders} ord)
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[48px] bg-stone-900 group-hover:bg-amber-400 rounded-t-xl transition-all duration-300 relative"
                  />
                  <span className="text-[11px] font-semibold text-stone-500 group-hover:text-stone-900">
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Low Stock Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Latest Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight">
                Recent Customer Orders
              </h2>
              <p className="text-xs text-stone-500">Live order fulfillment stream</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-stone-900 hover:text-amber-600 flex items-center gap-1 transition-colors"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-400">
              No orders placed yet.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 rounded-xl px-2 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-stone-900">
                        {ord.orderNumber}
                      </span>
                      <StatusBadge type="order" status={ord.orderStatus} size="sm" />
                      <StatusBadge type="payment" status={ord.paymentStatus} size="sm" />
                    </div>
                    <p className="text-xs text-stone-600 truncate">
                      {ord.customer.firstName} {ord.customer.lastName} • {ord.items.length} item(s) •{" "}
                      <span className="text-stone-400">
                        {new Date(ord.createdAt).toLocaleDateString("en-PK", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-xs font-extrabold text-stone-900">
                      Rs. {ord.total.toLocaleString()}
                    </span>
                    <Link
                      to={`/admin/orders/${ord.id}`}
                      className="p-1.5 bg-stone-100 hover:bg-stone-900 hover:text-white rounded-lg text-stone-700 transition-colors text-xs font-semibold flex items-center gap-1"
                      title="View Order Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="sm:hidden text-[11px]">View</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Column: Low Stock Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* Low Stock Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-stone-900">
                  Low Stock Inventory
                </h3>
              </div>
              <Link
                to="/admin/products?stockStatus=low_stock"
                className="text-[11px] font-semibold text-stone-500 hover:text-stone-900"
              >
                View All
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400 space-y-1">
                <p className="font-semibold text-emerald-700">Inventory Healthy</p>
                <p className="text-[11px]">All products have sufficient stock.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="w-9 h-9 rounded-xl object-cover bg-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {p.title}
                        </p>
                        <p className="text-[10px] text-stone-500 font-mono">
                          SKU: {p.sku}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          p.stock <= 0
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.stock} left
                      </span>
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-lg"
                        title="Edit stock"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100">
              Quick Shortcuts
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/admin/products/new"
                className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/70 text-stone-800 font-bold flex flex-col gap-1 transition-colors"
              >
                <Plus className="w-4 h-4 text-amber-600" />
                <span>Add Product</span>
              </Link>

              <Link
                to="/admin/categories"
                className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/70 text-stone-800 font-bold flex flex-col gap-1 transition-colors"
              >
                <Tag className="w-4 h-4 text-blue-600" />
                <span>Categories</span>
              </Link>

              <Link
                to="/admin/coupons"
                className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/70 text-stone-800 font-bold flex flex-col gap-1 transition-colors"
              >
                <TicketPercent className="w-4 h-4 text-purple-600" />
                <span>Coupons</span>
              </Link>

              <Link
                to="/admin/settings"
                className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/70 text-stone-800 font-bold flex flex-col gap-1 transition-colors"
              >
                <Settings className="w-4 h-4 text-stone-600" />
                <span>Store Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
