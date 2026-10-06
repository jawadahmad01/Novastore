import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { AdminNotificationMenu } from "./AdminNotificationMenu";
import {
  Menu,
  Plus,
  ExternalLink,
  Search,
  User as UserIcon,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Toggle & Breadcrumb info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-extrabold text-stone-900 tracking-tight">
            NOVA STORE Admin
          </span>
          <span className="text-stone-300">/</span>
          <span className="text-xs text-stone-500 font-medium">Pakistan Fulfillment</span>
        </div>
      </div>

      {/* Right Tools: Quick Add, Notification Menu, Public Store, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Product */}
        <Link
          to="/admin/products/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Product</span>
        </Link>

        {/* View Public Store */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-stone-200 hover:border-stone-300 text-stone-700 hover:text-stone-900 rounded-xl text-xs font-semibold transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
          <span className="hidden md:inline">View Store</span>
        </Link>

        {/* Live Admin Notifications */}
        <AdminNotificationMenu />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-stone-100 transition-colors text-left"
            aria-label="Admin account menu"
          >
            <div className="w-7 h-7 rounded-full bg-stone-900 text-white font-extrabold text-xs flex items-center justify-center">
              {user?.firstName?.charAt(0) || "A"}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-stone-900 leading-tight">
                {user?.firstName}
              </p>
              <p className="text-[10px] text-amber-600 font-bold uppercase">Administrator</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2 border-b border-stone-100">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Signed in as
                </p>
                <p className="text-xs font-bold text-stone-900 truncate">{user?.email}</p>
              </div>

              <Link
                to="/admin/settings/account"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 font-medium"
              >
                <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                <span>Account Profile</span>
              </Link>

              <Link
                to="/admin/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-stone-500" />
                <span>Store Settings</span>
              </Link>

              <div className="border-t border-stone-100 my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
