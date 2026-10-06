import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { siteConfig } from "@/src/config/site";
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";
import { useAuth } from "@/src/context/AuthContext";
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  ChevronDown,
  LogOut,
  Package,
  UserCheck,
  LayoutDashboard,
} from "lucide-react";

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenMobileMenu }) => {
  const { itemCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const navigate = useNavigate();

  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const categories = [
    { name: "Electronics", path: "/products?category=Electronics" },
    { name: "Mobile Accessories", path: "/products?category=Mobile%20Accessories" },
    { name: "Home & Lifestyle", path: "/products?category=Home%20%26%20Lifestyle" },
    { name: "Fashion", path: "/products?category=Fashion" },
    { name: "Beauty & Personal Care", path: "/products?category=Beauty%20%26%20Personal%20Care" },
    { name: "Kitchen", path: "/products?category=Kitchen" },
    { name: "Sports & Fitness", path: "/products?category=Sports%20%26%20Fitness" },
    { name: "Bags & Accessories", path: "/products?category=Bags%20%26%20Accessories" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-20 gap-2 sm:gap-4">
          {/* Mobile Menu Button + Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Hamburger for Mobile */}
            <button
              onClick={onOpenMobileMenu}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 text-stone-700 hover:text-stone-900 rounded-xl hover:bg-stone-100 active:bg-stone-200 transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Brand Logo & Name */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold tracking-tighter text-xs sm:text-sm group-hover:bg-stone-800 transition-colors shadow-xs">
                N
              </div>
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-stone-900 font-mono select-none">
                {siteConfig.brand.name}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs xl:text-sm font-medium tracking-normal transition-colors rounded-lg ${
                  isActive
                    ? "text-stone-900 bg-stone-100 font-semibold"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                }`
              }
            >
              All Products
            </NavLink>

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="px-3 py-1.5 text-xs xl:text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg flex items-center gap-1 transition-colors"
                aria-expanded={isCategoriesOpen}
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoriesOpen ? "rotate-180" : ""}`} />
              </button>

              {isCategoriesOpen && (
                <div className="absolute top-full left-0 w-56 bg-white border border-stone-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {categories.map((cat) => (
                    <Link
                      key={cat.name}
                      to={cat.path}
                      onClick={() => setIsCategoriesOpen(false)}
                      className="block px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <div className="border-t border-stone-100 my-1 pt-1">
                    <Link
                      to="/products"
                      onClick={() => setIsCategoriesOpen(false)}
                      className="block px-4 py-2 text-xs font-bold text-stone-900 hover:bg-stone-50 transition-colors"
                    >
                      View All Categories →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/deals"
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs xl:text-sm font-medium tracking-normal transition-colors rounded-lg ${
                  isActive
                    ? "text-stone-900 bg-stone-100 font-semibold"
                    : "text-rose-700 hover:text-rose-900 hover:bg-rose-50/50"
                }`
              }
            >
              Deals & Offers
            </NavLink>

            <NavLink
              to="/new-arrivals"
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs xl:text-sm font-medium tracking-normal transition-colors rounded-lg ${
                  isActive
                    ? "text-stone-900 bg-stone-100 font-semibold"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                }`
              }
            >
              New Arrivals
            </NavLink>
          </nav>

          {/* Right Action Icons: Search, Wishlist, Account, Cart */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              aria-label="Search catalog"
              className="p-2 sm:px-3 sm:py-2 text-stone-700 hover:text-stone-900 rounded-xl hover:bg-stone-100 active:bg-stone-200 flex items-center gap-2 transition-colors touch-manipulation min-w-[40px] min-h-[40px] justify-center"
            >
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />
              <span className="hidden md:inline text-xs text-stone-400 font-normal">Search...</span>
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              aria-label={`Wishlist (${wishlistCount} items)`}
              className="relative p-2 text-stone-700 hover:text-stone-900 rounded-xl hover:bg-stone-100 active:bg-stone-200 transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.8]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account Trigger / Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  onBlur={() => setTimeout(() => setIsAccountOpen(false), 200)}
                  aria-label="Account menu"
                  className="flex items-center gap-1 p-2 text-stone-700 hover:text-stone-900 rounded-xl hover:bg-stone-100 active:bg-stone-200 transition-colors touch-manipulation min-w-[40px] min-h-[40px] justify-center"
                >
                  <UserCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-700 stroke-[2]" />
                  <span className="hidden sm:inline text-xs font-semibold max-w-[80px] truncate">
                    {user?.firstName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
                </button>
              ) : (
                <Link
                  to="/login"
                  aria-label="Sign in to account"
                  className="p-2 text-stone-700 hover:text-stone-900 rounded-xl hover:bg-stone-100 active:bg-stone-200 transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  <UserIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.8]" />
                </Link>
              )}

              {/* Account Dropdown Menu */}
              {isAccountOpen && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-[11px] text-stone-400 font-medium">Signed in as</p>
                    <p className="text-xs font-bold text-stone-900 truncate">{user?.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-amber-900 bg-amber-50/80 hover:bg-amber-100 font-bold border-b border-stone-100 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-amber-700" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <Link
                    to="/account"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 font-medium"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                    <span>My Account</span>
                  </Link>

                  <Link
                    to="/account/orders"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 font-medium"
                  >
                    <Package className="w-3.5 h-3.5 text-stone-500" />
                    <span>Order History</span>
                  </Link>

                  <div className="border-t border-stone-100 my-1" />

                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              aria-label={`Shopping cart with ${itemCount} items`}
              className="relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 bg-stone-900 text-white rounded-xl hover:bg-stone-800 active:scale-95 transition-all shadow-xs touch-manipulation min-w-[42px] min-h-[40px] justify-center ml-0.5"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              <span className="text-xs font-bold hidden sm:inline">Cart</span>
              <span className="w-5 h-5 rounded-full bg-white text-stone-900 text-[11px] font-extrabold flex items-center justify-center -ml-0.5">
                {itemCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
