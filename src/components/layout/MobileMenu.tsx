import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/src/config/site";
import { useAuth } from "@/src/context/AuthContext";
import { useWishlist } from "@/src/context/WishlistContext";
import {
  X,
  ChevronRight,
  ShoppingBag,
  Heart,
  User,
  Phone,
  HelpCircle,
  ShieldCheck,
  Tag,
  Sparkles,
} from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistCount } = useWishlist();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-250">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <Link to="/" onClick={onClose} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
              N
            </div>
            <span className="font-extrabold text-base tracking-tight text-stone-900 font-mono">
              {siteConfig.brand.name}
            </span>
          </Link>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 -mr-2 text-stone-500 hover:text-stone-900 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Main Store Categories */}
          <div>
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Catalog
            </p>
            <div className="space-y-1">
              <Link
                to="/products"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-stone-900 hover:bg-stone-50"
              >
                <span>All Products</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/products?category=Electronics"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                <span>Electronics</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/products?category=Mobile%20Accessories"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                <span>Mobile Accessories</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/products?category=Home%20%26%20Lifestyle"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                <span>Home & Lifestyle</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/products?category=Fashion"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                <span>Fashion</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/products?category=Beauty%20%26%20Personal%20Care"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                <span>Beauty & Personal Care</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/products?category=Kitchen"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                <span>Kitchen</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/products?category=Sports%20%26%20Fitness"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                <span>Sports & Fitness</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/products?category=Bags%20%26%20Accessories"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                <span>Bags & Accessories</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            </div>
          </div>

          {/* Highlights & Promotions */}
          <div>
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Featured
            </p>
            <div className="space-y-1">
              <Link
                to="/deals"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-700 bg-rose-50/60 hover:bg-rose-50"
              >
                <Tag className="w-4 h-4 text-rose-600" />
                <span>Deals & Offers</span>
              </Link>
              <Link
                to="/new-arrivals"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-50"
              >
                <Sparkles className="w-4 h-4 text-stone-600" />
                <span>New Arrivals</span>
              </Link>
              <Link
                to="/wishlist"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-50"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-stone-600" />
                  <span>My Wishlist</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="text-xs bg-stone-100 text-stone-800 px-2 py-0.5 rounded-full font-semibold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Customer Service & Contact */}
          <div>
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Help & Information
            </p>
            <div className="space-y-1">
              <Link
                to="/contact"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contact Customer Care</span>
              </Link>
              <Link
                to="/faq"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </Link>
              <Link
                to="/shipping"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Shipping & Delivery Policy</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Area with Account details */}
        <div className="p-4 border-t border-stone-100 bg-stone-50">
          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-stone-800 truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="flex gap-2">
                <Link
                  to="/account"
                  onClick={onClose}
                  className="flex-1 py-2 text-center text-xs font-medium bg-stone-900 text-white rounded-lg"
                >
                  My Account
                </Link>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="px-3 py-2 text-xs font-medium border border-stone-200 bg-white rounded-lg text-rose-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="flex-1 py-2.5 text-center text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex-1 py-2.5 text-center text-xs font-semibold border border-stone-300 bg-white text-stone-800 rounded-lg hover:bg-stone-100"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
