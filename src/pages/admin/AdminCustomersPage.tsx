import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { customerService, AdminCustomerSummary } from "@/src/lib/services/customerService";
import { AdminEmptyState } from "@/src/components/admin/AdminEmptyState";
import { AdminLoadingState } from "@/src/components/admin/AdminLoadingState";
import {
  Users,
  Search,
  Eye,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Shield,
  UserCheck,
} from "lucide-react";

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<AdminCustomerSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const list = await customerService.getAllCustomers(searchQuery);
      setCustomers(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">
            Customer Directory ({customers.length})
          </h1>
          <p className="text-xs text-stone-500">
            View customer order histories, lifetime value, and delivery destinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-stone-100 rounded-xl text-xs font-bold text-stone-700">
            Pakistan Customer Accounts
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name, email, phone (03xx), city..."
            className="w-full pl-10 pr-3.5 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
          />
        </div>
      </div>

      {/* Main Customers List */}
      {isLoading ? (
        <AdminLoadingState message="Loading customers..." />
      ) : customers.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="No customers found"
          description="No customer records matched your query."
          actionLabel="Clear Search"
          onAction={() => setSearchQuery("")}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Orders</th>
                  <th className="py-3 px-3">Lifetime Spent</th>
                  <th className="py-3 px-3">Account Type</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {c.fullName.charAt(0) || "U"}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/admin/customers/${c.id}`}
                            className="font-bold text-stone-900 hover:text-amber-600 hover:underline line-clamp-1"
                          >
                            {c.fullName}
                          </Link>
                          <p className="text-[11px] text-stone-400">
                            Joined {new Date(c.createdAt).toLocaleDateString("en-PK", { month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-stone-800">{c.email}</p>
                      <p className="text-[11px] text-stone-500 font-mono">{c.phone}</p>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-3 text-stone-600 font-medium">
                      {c.defaultCity ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          <span>{c.defaultCity}</span>
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    {/* Orders */}
                    <td className="py-3.5 px-3 font-bold text-stone-900">
                      {c.orderCount} order(s)
                    </td>

                    {/* Total Spent */}
                    <td className="py-3.5 px-3 font-extrabold text-stone-900">
                      Rs. {c.totalSpent.toLocaleString()}
                    </td>

                    {/* Account Type */}
                    <td className="py-3.5 px-3">
                      {c.role === "ADMIN" ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-stone-900 font-black rounded-md text-[10px] uppercase">
                          Admin
                        </span>
                      ) : c.isRegistered ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded-md text-[10px]">
                          Registered
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 font-medium rounded-md text-[10px]">
                          Guest Buyer
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/customers/${c.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Customers Cards View */}
          <div className="md:hidden space-y-3">
            {customers.map((c) => (
              <div
                key={c.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center">
                      {c.fullName.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-stone-900">{c.fullName}</p>
                      <p className="text-[10px] text-stone-400">{c.email}</p>
                    </div>
                  </div>

                  {c.isRegistered ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded text-[10px]">
                      Registered
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px]">
                      Guest
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Total Spent</span>
                    <span className="font-extrabold text-stone-900">
                      Rs. {c.totalSpent.toLocaleString()} ({c.orderCount} orders)
                    </span>
                  </div>

                  <Link
                    to={`/admin/customers/${c.id}`}
                    className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
