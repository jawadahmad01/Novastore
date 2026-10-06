import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { X } from "lucide-react";

export const AdminLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col antialiased text-stone-900">
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Fixed Sidebar */}
        <div className="hidden lg:block shrink-0 sticky top-0 h-screen">
          <AdminSidebar />
        </div>

        {/* Mobile Slide-out Drawer */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Slideover Panel */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-stone-900 text-stone-200 z-10 shadow-2xl">
              <div className="absolute top-3 right-3 z-20">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800"
                  aria-label="Close admin menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <AdminSidebar onCloseMobile={() => setIsMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-stone-50/50">
          <AdminHeader onToggleMobileMenu={() => setIsMobileOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
