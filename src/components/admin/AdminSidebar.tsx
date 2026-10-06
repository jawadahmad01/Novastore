import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingCart,
  Users,
  Tags,
  TicketPercent,
  Settings,
  ExternalLink,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logout();
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Products",
      path: "/admin/products",
      icon: Package,
      children: [
        { label: "All Products", path: "/admin/products" },
        { label: "Add Product", path: "/admin/products/new" },
      ],
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      label: "Customers",
      path: "/admin/customers",
      icon: Users,
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: Tags,
    },
    {
      label: "Coupons & Deals",
      path: "/admin/coupons",
      icon: TicketPercent,
    },
    {
      label: "Store Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 h-full bg-stone-900 text-stone-300 flex flex-col justify-between border-r border-stone-800 selection:bg-amber-500 selection:text-stone-900">
      {/* Brand Header */}
      <div className="p-5 border-b border-stone-800/80">
        <Link
          to="/admin/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-white text-stone-900 font-black text-lg flex items-center justify-center tracking-tighter shadow-md group-hover:scale-105 transition-transform">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-sm tracking-tight">
                NOVA STORE
              </span>
              <span className="px-1.5 py-0.5 bg-amber-400 text-stone-950 font-black text-[9px] uppercase tracking-wider rounded">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-stone-400">Single-Vendor Back Office</p>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-extrabold tracking-wider uppercase text-stone-400">
          Store Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.path} className="space-y-0.5">
              <NavLink
                to={item.path}
                end={item.exact}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-amber-400 text-stone-950 shadow-xs font-bold"
                      : "text-stone-300 hover:text-white hover:bg-stone-800/80"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 stroke-[2]" />
                  <span>{item.label}</span>
                </div>
                {item.children && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </NavLink>
            </div>
          );
        })}

        {/* Quick Add Product Shortcut */}
        <div className="pt-4 px-1">
          <Link
            to="/admin/products/new"
            onClick={onCloseMobile}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-400/20 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Footer Navigation & User Profile */}
      <div className="p-3 border-t border-stone-800 space-y-2 bg-stone-950/40">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-stone-400" />
            <span>View Public Store</span>
          </div>
          <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-400">
            Live
          </span>
        </Link>

        <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">
              {user?.firstName?.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-stone-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
