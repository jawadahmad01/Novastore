import React from "react";
import { Link } from "react-router-dom";
import { User, Order } from "@/src/types";
import { formatPrice, formatDate } from "@/src/lib/utils/formatters";
import { useWishlist } from "@/src/context/WishlistContext";
import {
  Package,
  MapPin,
  Heart,
  Truck,
  ArrowRight,
  Clock,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Calendar,
  User as UserIcon,
} from "lucide-react";

interface AccountOverviewProps {
  user: User | null;
  orders: Order[];
  onNavigateTab: (tab: "overview" | "orders" | "addresses" | "profile" | "wishlist") => void;
  onSelectOrder: (order: Order) => void;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({
  user,
  orders,
  onNavigateTab,
  onSelectOrder,
}) => {
  const { wishlistCount } = useWishlist();

  const activeOrders = orders.filter(
    (o) =>
      o.orderStatus === "Pending" ||
      o.orderStatus === "Processing" ||
      o.orderStatus === "Confirmed" ||
      o.orderStatus === "Shipped"
  );

  const defaultAddress =
    user?.savedAddresses?.find((a) => a.isDefault) || user?.savedAddresses?.[0];

  const recentOrders = orders.slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-stone-300 text-[11px] font-semibold border border-white/10">
              Verified Customer
            </span>
            {user?.createdAt && (
              <span className="text-[11px] text-stone-400">
                Member since {formatDate(user.createdAt)}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Assalam-o-Alaikum, {user?.firstName || "Customer"}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
            Manage your recent orders, track nationwide deliveries in real-time, and update your saved Pakistani shipping addresses.
          </p>
        </div>

        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pointer-events-none pr-8">
          <ShoppingBag className="w-48 h-48" />
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div
          onClick={() => onNavigateTab("orders")}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-stone-400 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 mb-3 group-hover:bg-stone-900 group-hover:text-white transition-colors">
            <Package className="w-5 h-5 stroke-[2]" />
          </div>
          <p className="text-xs text-stone-500 font-medium">Total Orders</p>
          <p className="text-2xl font-extrabold text-stone-900 mt-0.5">{orders.length}</p>
        </div>

        {/* Active Orders */}
        <div
          onClick={() => onNavigateTab("orders")}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-stone-400 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Truck className="w-5 h-5 stroke-[2]" />
          </div>
          <p className="text-xs text-stone-500 font-medium">In Transit / Active</p>
          <p className="text-2xl font-extrabold text-stone-900 mt-0.5">{activeOrders.length}</p>
        </div>

        {/* Saved Addresses */}
        <div
          onClick={() => onNavigateTab("addresses")}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-stone-400 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center mb-3 group-hover:bg-stone-900 group-hover:text-white transition-colors">
            <MapPin className="w-5 h-5 stroke-[2]" />
          </div>
          <p className="text-xs text-stone-500 font-medium">Saved Addresses</p>
          <p className="text-2xl font-extrabold text-stone-900 mt-0.5">
            {user?.savedAddresses?.length || 0}
          </p>
        </div>

        {/* Wishlist */}
        <div
          onClick={() => onNavigateTab("wishlist")}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-stone-400 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <Heart className="w-5 h-5 stroke-[2]" />
          </div>
          <p className="text-xs text-stone-500 font-medium">Saved Wishlist</p>
          <p className="text-2xl font-extrabold text-stone-900 mt-0.5">{wishlistCount}</p>
        </div>
      </div>

      {/* Main Content Grid: Recent Orders & Address Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Orders (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h3 className="text-base font-bold text-stone-900">Recent Orders</h3>
            <button
              onClick={() => onNavigateTab("orders")}
              className="text-xs font-semibold text-stone-900 hover:underline flex items-center gap-1"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3 shadow-2xs">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-500">You haven't placed any orders yet.</p>
              <Link
                to="/products"
                className="inline-block px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs hover:border-stone-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-stone-900">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-stone-100 text-stone-800">
                          {ord.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {formatDate(ord.createdAt)} · {ord.items.length}{" "}
                        {ord.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-extrabold text-stone-900">
                        {formatPrice(ord.total)}
                      </p>
                      <button
                        onClick={() => onSelectOrder(ord)}
                        className="text-xs text-stone-600 hover:text-stone-900 font-semibold underline mt-0.5"
                      >
                        Details
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Row */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {ord.items.map((item, idx) => (
                      <img
                        key={idx}
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-200 shrink-0"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Default Address & Quick Links */}
        <div className="space-y-6">
          {/* Default Delivery Address Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Default Address</span>
              </h4>
              <button
                onClick={() => onNavigateTab("addresses")}
                className="text-xs text-stone-600 hover:text-stone-900 font-semibold underline"
              >
                Change
              </button>
            </div>

            {defaultAddress ? (
              <div className="text-xs space-y-1 text-stone-600">
                <p className="font-bold text-stone-900">
                  {defaultAddress.firstName} {defaultAddress.lastName}
                </p>
                <p>
                  {defaultAddress.houseFlatShopNumber}, {defaultAddress.streetAddress}
                </p>
                <p>
                  {defaultAddress.area}, {defaultAddress.city}
                </p>
                <p className="text-stone-500">
                  {defaultAddress.province}, Pakistan
                </p>
                <p className="font-mono text-stone-700 pt-1">{defaultAddress.phone}</p>
              </div>
            ) : (
              <div className="text-xs text-stone-500 py-3 text-center">
                <p>No default address saved.</p>
                <button
                  onClick={() => onNavigateTab("addresses")}
                  className="mt-2 text-xs font-semibold text-stone-900 underline"
                >
                  + Add Address
                </button>
              </div>
            )}
          </div>

          {/* Quick Account Actions */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Quick Shortcuts
            </h4>

            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => onNavigateTab("profile")}
                className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-medium transition-colors flex items-center justify-between"
              >
                <span>Edit Profile & Mobile</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                onClick={() => onNavigateTab("addresses")}
                className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-medium transition-colors flex items-center justify-between"
              >
                <span>Manage Address Book</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                onClick={() => onNavigateTab("wishlist")}
                className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-medium transition-colors flex items-center justify-between"
              >
                <span>View Wishlist ({wishlistCount})</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
