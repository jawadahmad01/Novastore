import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { orderService } from "@/src/lib/services/orderService";
import { Order } from "@/src/types";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";
import { AccountOverview } from "@/src/components/account/AccountOverview";
import { OrderHistoryList } from "@/src/components/account/OrderHistoryList";
import { OrderDetailView } from "@/src/components/account/OrderDetailView";
import { SavedAddressesManager } from "@/src/components/account/SavedAddressesManager";
import { AccountProfileSettings } from "@/src/components/account/AccountProfileSettings";
import { WishlistPage } from "@/src/pages/WishlistPage";
import { useWishlist } from "@/src/context/WishlistContext";
import {
  LayoutDashboard,
  Package,
  MapPin,
  User as UserIcon,
  Heart,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const AccountPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ orderId?: string }>();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  // Determine active view based on pathname
  const path = location.pathname;

  let currentTab: "overview" | "orders" | "addresses" | "profile" | "wishlist" = "overview";
  if (path.startsWith("/account/orders")) currentTab = "orders";
  else if (path.startsWith("/account/addresses")) currentTab = "addresses";
  else if (path.startsWith("/account/profile")) currentTab = "profile";
  else if (path.startsWith("/account/wishlist")) currentTab = "wishlist";

  // Check if an orderId is specified either in params or in state
  const isOrderDetail = path.startsWith("/account/orders/") && path !== "/account/orders";
  const urlOrderId = isOrderDetail ? path.split("/account/orders/")[1] : null;

  // Load orders
  useEffect(() => {
    const fetchOrders = async () => {
      const email = user?.email || "";
      if (email) {
        const userOrders = await orderService.getOrdersByUser(email);
        setOrders(userOrders.length > 0 ? userOrders : orderService.getAllOrders());
      } else {
        setOrders(orderService.getAllOrders());
      }
    };
    fetchOrders();
  }, [user]);

  // Load specific order if URL has orderId
  useEffect(() => {
    if (urlOrderId) {
      setIsLoadingOrder(true);
      orderService.getOrderById(urlOrderId).then((ord) => {
        setSelectedOrder(ord);
        setIsLoadingOrder(false);
      });
    } else {
      setSelectedOrder(null);
    }
  }, [urlOrderId]);

  const handleSelectOrder = (ord: Order) => {
    setSelectedOrder(ord);
    navigate(`/account/orders/${ord.orderNumber}`);
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
    navigate("/account/orders");
  };

  const handleOrderUpdated = (updated: Order) => {
    setSelectedOrder(updated);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  // Guest view if user is not signed in and has no session
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center mx-auto text-stone-600">
          <UserIcon className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Customer Account Portal
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
            Sign in to check your order tracking timeline, manage your delivery addresses, and view your saved items.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Link
            to="/login"
            className="flex-1 py-3 bg-stone-900 text-white rounded-2xl text-xs sm:text-sm font-bold text-center hover:bg-stone-800 transition-colors shadow-sm"
          >
            Sign In to Account
          </Link>
          <Link
            to="/register"
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs sm:text-sm font-bold text-center transition-colors"
          >
            Create Free Account
          </Link>
        </div>

        <div className="pt-4 border-t border-stone-200 text-left bg-white p-4 rounded-2xl border text-xs text-stone-600 space-y-2">
          <p className="font-bold text-stone-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>NOVA STORE Account Benefits:</span>
          </p>
          <ul className="space-y-1 text-stone-500 text-[11px] list-disc list-inside">
            <li>Track live courier parcels across Pakistan</li>
            <li>1-click address autofill for fast checkout</li>
            <li>Cancel pending orders anytime before dispatch</li>
            <li>Instant re-ordering of favorite essentials</li>
          </ul>
        </div>
      </div>
    );
  }

  const navItems = [
    { key: "overview", label: "Overview", icon: LayoutDashboard, path: "/account" },
    {
      key: "orders",
      label: `Orders (${orders.length})`,
      icon: Package,
      path: "/account/orders",
    },
    {
      key: "addresses",
      label: `Addresses (${user?.savedAddresses?.length || 0})`,
      icon: MapPin,
      path: "/account/addresses",
    },
    { key: "profile", label: "Profile", icon: UserIcon, path: "/account/profile" },
    {
      key: "wishlist",
      label: `Wishlist (${wishlistCount})`,
      icon: Heart,
      path: "/account/wishlist",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Account", href: "/account" },
          {
            label:
              selectedOrder
                ? `Order #${selectedOrder.orderNumber}`
                : currentTab.charAt(0).toUpperCase() + currentTab.slice(1),
          },
        ]}
      />

      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Customer Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Logged in as <strong>{user?.firstName} {user?.lastName}</strong> ({user?.email})
          </p>
        </div>

        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="self-start sm:self-auto px-4 py-2 border border-stone-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Tabbed Layout */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 bg-white rounded-3xl border border-stone-200 p-3 shadow-2xs space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key && !selectedOrder;

            return (
              <button
                key={item.key}
                onClick={() => {
                  setSelectedOrder(null);
                  navigate(item.path);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 stroke-[2]" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-stone-300"}`}
                />
              </button>
            );
          })}
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-1 min-w-0 w-full">
          {/* Detail View of a specific order */}
          {selectedOrder ? (
            <OrderDetailView
              order={selectedOrder}
              onBack={handleBackToOrders}
              onOrderUpdated={handleOrderUpdated}
            />
          ) : isLoadingOrder ? (
            <div className="py-20 text-center text-xs text-stone-500">
              Loading order details...
            </div>
          ) : currentTab === "overview" ? (
            <AccountOverview
              user={user}
              orders={orders}
              onNavigateTab={(tab) => {
                const target = navItems.find((n) => n.key === tab);
                if (target) navigate(target.path);
              }}
              onSelectOrder={handleSelectOrder}
            />
          ) : currentTab === "orders" ? (
            <OrderHistoryList orders={orders} onSelectOrder={handleSelectOrder} />
          ) : currentTab === "addresses" ? (
            <SavedAddressesManager />
          ) : currentTab === "profile" ? (
            <AccountProfileSettings />
          ) : currentTab === "wishlist" ? (
            <WishlistPage />
          ) : null}
        </main>
      </div>
    </div>
  );
};
