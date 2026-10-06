import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { customerService, AdminCustomerSummary } from "@/src/lib/services/customerService";
import { Order, User } from "@/src/types";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { AdminLoadingState } from "@/src/components/admin/AdminLoadingState";
import { AdminEmptyState } from "@/src/components/admin/AdminEmptyState";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  MapPin,
  ExternalLink,
  Shield,
  Eye,
} from "lucide-react";

export const AdminCustomerDetailPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<AdminCustomerSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userRecord, setUserRecord] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      setIsLoading(true);
      customerService
        .getCustomerDetails(customerId)
        .then((res) => {
          setCustomer(res.customer);
          setOrders(res.orders);
          setUserRecord(res.user);
        })
        .finally(() => setIsLoading(false));
    }
  }, [customerId]);

  if (isLoading) {
    return <AdminLoadingState message="Loading customer profile..." />;
  }

  if (!customer) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/customers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>
        <AdminEmptyState
          title="Customer Not Found"
          description={`No customer record found matching ID "${customerId}".`}
          actionLabel="View All Customers"
          actionHref="/admin/customers"
        />
      </div>
    );
  }

  const avgOrderValue = customer.orderCount > 0 ? Math.round(customer.totalSpent / customer.orderCount) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/customers"
            className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                {customer.fullName}
              </h1>
              {customer.isRegistered ? (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded-md text-[10px]">
                  Registered Account
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-stone-100 text-stone-600 font-medium rounded-md text-[10px]">
                  Guest Buyer
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{customer.email}</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Total Spent
          </span>
          <p className="text-2xl font-extrabold text-stone-900">
            Rs. {customer.totalSpent.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Lifetime Orders
          </span>
          <p className="text-2xl font-extrabold text-stone-900">
            {customer.orderCount} Orders
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Average Order Value
          </span>
          <p className="text-2xl font-extrabold text-stone-900">
            Rs. {avgOrderValue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Order History */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100 flex items-center justify-between">
            <span>Order History ({orders.length})</span>
            <span className="text-xs font-normal text-stone-500">
              Purchases placed with {customer.email}
            </span>
          </h2>

          {orders.length === 0 ? (
            <p className="py-8 text-center text-xs text-stone-400">
              No orders found for this customer.
            </p>
          ) : (
            <div className="divide-y divide-stone-100">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/70 rounded-xl px-2 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/orders/${ord.id}`}
                        className="font-mono font-bold text-xs text-stone-900 hover:text-amber-600 hover:underline"
                      >
                        {ord.orderNumber}
                      </Link>
                      <StatusBadge type="order" status={ord.orderStatus} size="sm" />
                      <StatusBadge type="payment" status={ord.paymentStatus} size="sm" />
                    </div>
                    <p className="text-xs text-stone-500">
                      {ord.items.length} line item(s) •{" "}
                      {new Date(ord.createdAt).toLocaleDateString("en-PK", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-xs font-extrabold text-stone-900">
                      Rs. {ord.total.toLocaleString()}
                    </span>
                    <Link
                      to={`/admin/orders/${ord.id}`}
                      className="p-1.5 bg-stone-100 hover:bg-stone-900 hover:text-white rounded-lg text-stone-700 transition-colors text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Column: Contact Details & Saved Addresses */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-stone-400" />
              <span>Contact Profile</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-stone-700">
                <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>

              <div className="flex items-center gap-2.5 text-stone-700">
                <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="font-mono">{customer.phone}</span>
              </div>

              <div className="flex items-center gap-2.5 text-stone-700">
                <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                <span>
                  Member since {new Date(customer.createdAt).toLocaleDateString("en-PK", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* Saved Addresses (if registered) */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-stone-400" />
              <span>Registered Addresses</span>
            </h3>

            {userRecord?.savedAddresses && userRecord.savedAddresses.length > 0 ? (
              <div className="space-y-3">
                {userRecord.savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>{addr.label || "Address"}</span>
                      {addr.isDefault && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-stone-600">
                      {addr.houseFlatShopNumber}, {addr.streetAddress}, {addr.area}
                    </p>
                    <p className="font-semibold text-stone-800">
                      {addr.city}, {addr.province} {addr.postalCode && `(${addr.postalCode})`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">
                No saved address book entries stored for this customer.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
