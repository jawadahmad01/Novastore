/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastProvider } from "@/src/context/ToastContext";
import { AuthProvider } from "@/src/context/AuthContext";
import { CartProvider } from "@/src/context/CartContext";
import { WishlistProvider } from "@/src/context/WishlistContext";
import { AnnouncementBar } from "@/src/components/layout/AnnouncementBar";
import { Header } from "@/src/components/layout/Header";
import { MobileMenu } from "@/src/components/layout/MobileMenu";
import { Footer } from "@/src/components/layout/Footer";
import { CartDrawer } from "@/src/components/cart/CartDrawer";
import { SearchDrawer } from "@/src/components/search/SearchDrawer";
import { ExitIntentModal } from "@/src/components/modals/ExitIntentModal";

// Customer Storefront Pages
import { HomePage } from "@/src/pages/HomePage";
import { CatalogPage } from "@/src/pages/CatalogPage";
import { ProductDetailPage } from "@/src/pages/ProductDetailPage";
import { CartPage } from "@/src/pages/CartPage";
import { CheckoutPage } from "@/src/pages/CheckoutPage";
import { OrderSuccessPage } from "@/src/pages/OrderSuccessPage";
import { WishlistPage } from "@/src/pages/WishlistPage";
import { AccountPage } from "@/src/pages/AccountPage";
import { LoginPage, RegisterPage, ForgotPasswordPage } from "@/src/pages/AuthPages";
import {
  ContactPage,
  FAQPage,
  AboutPage,
  ShippingPolicyPage,
  ReturnsPolicyPage,
  PrivacyPage,
  TermsPage,
  NotFoundPage,
} from "@/src/pages/StaticPages";

// Admin Back Office Components & Pages
import { AdminRouteGuard } from "@/src/components/admin/AdminRouteGuard";
import { AdminLayout } from "@/src/components/admin/AdminLayout";
import { AdminDashboardPage } from "@/src/pages/admin/AdminDashboardPage";
import { AdminProductsPage } from "@/src/pages/admin/AdminProductsPage";
import { AdminProductFormPage } from "@/src/pages/admin/AdminProductFormPage";
import { AdminOrdersPage } from "@/src/pages/admin/AdminOrdersPage";
import { AdminOrderDetailPage } from "@/src/pages/admin/AdminOrderDetailPage";
import { AdminCustomersPage } from "@/src/pages/admin/AdminCustomersPage";
import { AdminCustomerDetailPage } from "@/src/pages/admin/AdminCustomerDetailPage";
import { AdminCategoriesPage } from "@/src/pages/admin/AdminCategoriesPage";
import { AdminCouponsPage } from "@/src/pages/admin/AdminCouponsPage";
import { AdminSettingsPage } from "@/src/pages/admin/AdminSettingsPage";

// Scroll to top helper on route transitions
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Customer-Facing Storefront Layout Wrapper
const StorefrontLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/50 text-stone-900 selection:bg-stone-900 selection:text-white">
      <ScrollToTop />

      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Primary Sticky Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Slide-over Mobile Navigation */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Search Modal */}
      <SearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Exit Intent Lead Capture */}
      <ExitIntentModal />

      {/* Main Page Body */}
      <div className="flex-1">{children}</div>

      {/* Multi-Column Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                {/* ========================================================= */}
                {/* 1. PRIVATE SINGLE-VENDOR ADMIN BACK OFFICE ROUTES         */}
                {/* Guarded strictly by AdminRouteGuard & role checks         */}
                {/* ========================================================= */}
                <Route
                  path="/admin"
                  element={
                    <AdminRouteGuard>
                      <AdminLayout />
                    </AdminRouteGuard>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  
                  {/* Products */}
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="products/new" element={<AdminProductFormPage />} />
                  <Route path="products/:productId/edit" element={<AdminProductFormPage />} />

                  {/* Orders */}
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />

                  {/* Customers */}
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="customers/:customerId" element={<AdminCustomerDetailPage />} />

                  {/* Categories & Coupons */}
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="coupons" element={<AdminCouponsPage />} />

                  {/* Settings */}
                  <Route path="settings" element={<AdminSettingsPage />} />
                  <Route path="settings/store" element={<AdminSettingsPage />} />
                  <Route path="settings/shipping" element={<AdminSettingsPage />} />
                  <Route path="settings/payments" element={<AdminSettingsPage />} />
                  <Route path="settings/tax" element={<AdminSettingsPage />} />
                  <Route path="settings/account" element={<AdminSettingsPage />} />
                </Route>

                {/* ========================================================= */}
                {/* 2. PUBLIC CUSTOMER STOREFRONT ROUTES                      */}
                {/* ========================================================= */}
                <Route
                  path="/*"
                  element={
                    <StorefrontLayout>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<CatalogPage />} />
                        <Route path="/category/:category" element={<CatalogPage />} />
                        <Route path="/deals" element={<CatalogPage />} />
                        <Route path="/new-arrivals" element={<CatalogPage />} />
                        <Route path="/products/:slug" element={<ProductDetailPage />} />
                        <Route path="/product/:slug" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                        <Route path="/wishlist" element={<WishlistPage />} />

                        {/* Customer Account Routes */}
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/account/orders" element={<AccountPage />} />
                        <Route path="/account/orders/:orderId" element={<AccountPage />} />
                        <Route path="/account/profile" element={<AccountPage />} />
                        <Route path="/account/addresses" element={<AccountPage />} />
                        <Route path="/account/wishlist" element={<AccountPage />} />

                        {/* Customer Auth Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                        {/* Static & Policy Pages */}
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/shipping" element={<ShippingPolicyPage />} />
                        <Route path="/returns" element={<ReturnsPolicyPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/terms" element={<TermsPage />} />

                        {/* 404 Catch-All */}
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </StorefrontLayout>
                  }
                />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
