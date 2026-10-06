import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/src/components/common/SEO";

interface AdminRouteGuardProps {
  children?: React.ReactNode;
}

/**
 * Route guard component for NOVA STORE Private Admin Area.
 * Blocks unauthenticated users and non-admin customers from accessing /admin routes.
 * 
 * Production Security Notice:
 * Client-side route guards provide UX protection. Production authorization must
 * additionally be enforced on server routes and database RLS (Supabase).
 */
export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-stone-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs tracking-wider uppercase text-stone-400 font-mono">
            Verifying Admin Access...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login with return path
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: "Administrator login required to access NOVA STORE Back Office.",
        }}
        replace
      />
    );
  }

  // Logged in as customer, but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Access Restricted
            </h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              You are signed in as <strong className="text-stone-700">{user?.email}</strong> (Customer).
              The NOVA STORE Administration Dashboard is restricted to authorized store staff.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              to="/account"
              className="w-full py-2.5 px-4 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Customer Account</span>
            </Link>

            <Link
              to="/login"
              className="w-full py-2.5 px-4 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Switch to Admin Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO noIndex title="Admin Back Office" />
      {children ? <>{children}</> : <Outlet />}
    </>
  );
};
