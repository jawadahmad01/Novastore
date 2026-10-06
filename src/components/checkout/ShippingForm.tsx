import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Address } from "@/src/types";
import { siteConfig } from "@/src/config/site";
import { isValidPakistaniPhone } from "@/src/lib/utils/formatters";
import { useAuth } from "@/src/context/AuthContext";
import { PakistanAddressSelector } from "@/src/components/common/PakistanAddressSelector";
import {
  Truck,
  ShieldCheck,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  UserCheck,
  LogIn,
} from "lucide-react";

interface ShippingFormProps {
  initialData: Address;
  shippingMethod: "standard" | "express";
  onShippingMethodChange: (method: "standard" | "express") => void;
  onSubmit: (data: Address) => void;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({
  initialData,
  shippingMethod,
  onShippingMethodChange,
  onSubmit,
}) => {
  const { user, isAuthenticated, addAddress } = useAuth();
  const [formData, setFormData] = useState<Address>(() => ({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    country: "Pakistan",
    province: initialData.province || "Punjab",
    division: initialData.division || "Lahore Division",
    district: initialData.district || "Lahore",
    tehsil: initialData.tehsil || "Lahore City",
    city: initialData.city || initialData.district || "Lahore",
    area: initialData.area || "",
    streetAddress: initialData.streetAddress || "",
    houseFlatShopNumber: initialData.houseFlatShopNumber || "",
    postalCode: initialData.postalCode || "",
    deliveryInstructions: initialData.deliveryInstructions || "",
  }));

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);

  // If user is authenticated and has default address, initialize with it if formData was blank
  useEffect(() => {
    if (isAuthenticated && user) {
      const defaultAddr =
        user.savedAddresses?.find((a) => a.isDefault) || user.savedAddresses?.[0];

      if (defaultAddr && (!formData.streetAddress || formData.streetAddress === "")) {
        setFormData({
          ...defaultAddr,
          country: "Pakistan",
          province: defaultAddr.province || "Punjab",
          division: defaultAddr.division || "Lahore Division",
          district: defaultAddr.district || defaultAddr.city || "Lahore",
          tehsil: defaultAddr.tehsil || "",
          email: formData.email || user.email || defaultAddr.email,
        });
        setSelectedSavedId(defaultAddr.id || null);
      } else if (!formData.firstName && user.firstName) {
        setFormData((prev) => ({
          ...prev,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || prev.phone,
        }));
      }
    }
  }, [isAuthenticated, user]);

  const handleSelectSavedAddress = (addr: Address) => {
    setFormData({
      ...addr,
      country: "Pakistan",
      province: addr.province || "Punjab",
      division: addr.division || "",
      district: addr.district || addr.city || "",
      tehsil: addr.tehsil || "",
      city: addr.city || addr.district || "",
    });
    setSelectedSavedId(addr.id || null);
    setErrors({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSelectedSavedId(null);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleProvinceChange = (province: string) => {
    setFormData((prev) => ({
      ...prev,
      province,
      division: "",
      district: "",
      tehsil: "",
      city: "",
    }));
    setSelectedSavedId(null);
    if (errors.province) setErrors((prev) => ({ ...prev, province: "" }));
  };

  const handleDivisionChange = (division: string) => {
    setFormData((prev) => ({
      ...prev,
      division,
      district: "",
      tehsil: "",
      city: "",
    }));
    setSelectedSavedId(null);
    if (errors.division) setErrors((prev) => ({ ...prev, division: "" }));
  };

  const handleDistrictChange = (district: string) => {
    setFormData((prev) => ({
      ...prev,
      district,
      tehsil: "",
      city: district, // Keep city synchronized for backward compatibility
    }));
    setSelectedSavedId(null);
    if (errors.district) setErrors((prev) => ({ ...prev, district: "" }));
  };

  const handleTehsilChange = (tehsil: string) => {
    setFormData((prev) => ({
      ...prev,
      tehsil,
      city: prev.district || tehsil,
    }));
    setSelectedSavedId(null);
    if (errors.tehsil) setErrors((prev) => ({ ...prev, tehsil: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // 1. Customer Contact Validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!formData.email.trim() || !formData.email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!isValidPakistaniPhone(formData.phone)) {
      newErrors.phone = "Enter a valid Pakistani mobile number (e.g. 0300-1234567 or +923001234567).";
    }

    // 2. 4-Tier Administrative Hierarchy Validation
    if (!formData.province || !formData.province.trim()) {
      newErrors.province = "Please select Province / Region.";
    }
    if (!formData.division || !formData.division.trim()) {
      newErrors.division = "Please select Division.";
    }
    if (!formData.district || !formData.district.trim()) {
      newErrors.district = "Please select District.";
    }
    if (!formData.tehsil || !formData.tehsil.trim()) {
      newErrors.tehsil = "Please select Tehsil / Taluka / Sub-Division.";
    }

    // 3. Street & House Validation
    if (!formData.area.trim()) {
      newErrors.area = "Area or locality is required (e.g. DHA Phase 5, Gulberg III, Sector F-7).";
    }
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Street address / road name is required.";
    }
    if (!formData.houseFlatShopNumber.trim()) {
      newErrors.houseFlatShopNumber = "House, flat, or shop number is required.";
    }

    // 4. Postal Code (Optional, but if provided, validate 5 digits format)
    if (formData.postalCode && formData.postalCode.trim().length > 0) {
      if (!/^\d{4,6}$/.test(formData.postalCode.trim())) {
        newErrors.postalCode = "Please enter a valid 5-digit Pakistani postal code (e.g. 54000).";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 150, behavior: "smooth" });
      return;
    }

    const payload: Address = {
      ...formData,
      country: "Pakistan",
      city: formData.district || formData.city || "Pakistan",
    };

    // If customer is logged in and chose to save new address to account
    if (isAuthenticated && saveToAccount && !selectedSavedId) {
      try {
        await addAddress({
          ...payload,
          label: `${formData.tehsil || formData.district} Address`,
          isDefault: false,
        });
      } catch {
        // Continue checkout even if address save encounters warning
      }
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Guest Login Banner */}
      {!isAuthenticated ? (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-stone-700">
            <LogIn className="w-4 h-4 text-stone-900 shrink-0" />
            <span>Already have an account? Sign in for 1-click address autofill.</span>
          </div>
          <Link
            to="/login"
            state={{ from: { pathname: "/checkout" } }}
            className="px-3.5 py-1.5 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors shrink-0 text-center shadow-2xs"
          >
            Sign In
          </Link>
        </div>
      ) : (
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>
              Checking out as <strong>{user?.firstName} {user?.lastName}</strong> ({user?.email})
            </span>
          </div>
          <Link
            to="/account/addresses"
            className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950"
          >
            Manage Addresses
          </Link>
        </div>
      )}

      {/* Saved Addresses Selector (if logged in & has saved addresses) */}
      {isAuthenticated && user?.savedAddresses && user.savedAddresses.length > 0 && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Choose from Saved Addresses</span>
            </h3>
            {selectedSavedId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSavedId(null);
                  setFormData((prev) => ({
                    ...prev,
                    streetAddress: "",
                    houseFlatShopNumber: "",
                    area: "",
                  }));
                }}
                className="text-xs text-stone-500 hover:text-stone-900 font-semibold underline"
              >
                + Enter Different Address
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {user.savedAddresses.map((addr) => {
              const isSelected = selectedSavedId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelectSavedAddress(addr)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all text-xs space-y-1 ${
                    isSelected
                      ? "border-stone-900 bg-stone-50/80 ring-2 ring-stone-900/10"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{addr.label || "Address"}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] px-2 py-0.2 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-stone-800">
                    {addr.firstName} {addr.lastName}
                  </p>
                  <p className="text-stone-600 truncate">
                    {addr.houseFlatShopNumber}, {addr.streetAddress}
                  </p>
                  <p className="text-stone-500 truncate">
                    {addr.area}, {addr.tehsil ? `${addr.tehsil}, ` : ""}{addr.district || addr.city}
                  </p>
                  <p className="font-mono text-stone-700 text-[11px]">{addr.phone}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Contact Section */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-100">
          1. Customer Contact Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. Hamza"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                errors.firstName
                  ? "border-rose-500 bg-rose-50/50"
                  : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              }`}
            />
            {errors.firstName && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Khan"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                errors.lastName
                  ? "border-rose-500 bg-rose-50/50"
                  : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              }`}
            />
            {errors.lastName && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Email Address (For receipt & tracking) *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="hamza@example.com"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                errors.email
                  ? "border-rose-500 bg-rose-50/50"
                  : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              }`}
            />
            {errors.email && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Phone Number (Pakistani mobile format) *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0300-1234567"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                errors.phone
                  ? "border-rose-500 bg-rose-50/50"
                  : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              }`}
            />
            {errors.phone ? (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phone}
              </p>
            ) : (
              <p className="text-[11px] text-stone-400 mt-1">
                Courier rider will call this number prior to delivery.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Hierarchical Shipping Address Section */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
        <div className="pb-2 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
            2. Delivery Address in Pakistan
          </h3>
          <span className="text-[11px] text-stone-500 font-medium">
            PBS Official Administrative Structure (4-Tier Hierarchy)
          </span>
        </div>

        {/* 4-Tier Pakistan Selector */}
        <PakistanAddressSelector
          province={formData.province}
          division={formData.division}
          district={formData.district}
          tehsil={formData.tehsil}
          onProvinceChange={handleProvinceChange}
          onDivisionChange={handleDivisionChange}
          onDistrictChange={handleDistrictChange}
          onTehsilChange={handleTehsilChange}
          errors={{
            province: errors.province,
            division: errors.division,
            district: errors.district,
            tehsil: errors.tehsil,
          }}
        />

        {/* Area and Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Area / Locality / Sector / Block *
            </label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g. DHA Phase 5, Sector F-7, Gulberg III, Model Town"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none ${
                errors.area
                  ? "border-rose-500 bg-rose-50/50"
                  : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              }`}
            />
            {errors.area && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.area}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Postal / Zip Code (Optional)
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode || ""}
              onChange={handleChange}
              placeholder="e.g. 54000"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none ${
                errors.postalCode
                  ? "border-rose-500 bg-rose-50/50"
                  : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              }`}
            />
            {errors.postalCode && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.postalCode}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              House / Flat / Shop # *
            </label>
            <input
              type="text"
              name="houseFlatShopNumber"
              value={formData.houseFlatShopNumber}
              onChange={handleChange}
              placeholder="e.g. House 42-B, Flat 301"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none ${
                errors.houseFlatShopNumber
                  ? "border-rose-500 bg-rose-50/50"
                  : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              }`}
            />
            {errors.houseFlatShopNumber && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.houseFlatShopNumber}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Street / Road / Lane / Block Address Line *
            </label>
            <input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              placeholder="e.g. Street 14, Main Commercial Boulevard"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none ${
                errors.streetAddress
                  ? "border-rose-500 bg-rose-50/50"
                  : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
              }`}
            />
            {errors.streetAddress && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.streetAddress}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">
            Delivery Instructions & Landmarks (Optional)
          </label>
          <textarea
            rows={2}
            name="deliveryInstructions"
            value={formData.deliveryInstructions || ""}
            onChange={handleChange}
            placeholder="e.g. Opposite Masjid, ring bell twice, leave with security guard..."
            className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
          />
        </div>

        {/* Save to account checkbox when logged in */}
        {isAuthenticated && !selectedSavedId && (
          <div className="pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToAccount}
                onChange={(e) => setSaveToAccount(e.target.checked)}
                className="rounded text-stone-900 focus:ring-stone-900 h-4 w-4"
              />
              <span className="text-xs font-semibold text-stone-700">
                Save this address to my account for faster future checkout
              </span>
            </label>
          </div>
        )}
      </div>

      {/* 3. Courier Delivery Speed */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-100">
          3. Courier Delivery Speed
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className={`p-4 rounded-xl border-2 flex items-start justify-between cursor-pointer transition-all ${
              shippingMethod === "standard"
                ? "border-stone-900 bg-stone-50/80"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex gap-3 items-start">
              <input
                type="radio"
                name="shippingMethod"
                value="standard"
                checked={shippingMethod === "standard"}
                onChange={() => onShippingMethodChange("standard")}
                className="mt-1 text-stone-900 focus:ring-stone-900"
              />
              <div>
                <p className="text-xs sm:text-sm font-bold text-stone-900">Standard Nationwide</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {siteConfig.shipping.estimatedDeliveryStandard}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  FREE on orders over Rs. {siteConfig.shipping.freeShippingThreshold.toLocaleString()}
                </p>
              </div>
            </div>
          </label>

          <label
            className={`p-4 rounded-xl border-2 flex items-start justify-between cursor-pointer transition-all ${
              shippingMethod === "express"
                ? "border-stone-900 bg-stone-50/80"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex gap-3 items-start">
              <input
                type="radio"
                name="shippingMethod"
                value="express"
                checked={shippingMethod === "express"}
                onChange={() => onShippingMethodChange("express")}
                className="mt-1 text-stone-900 focus:ring-stone-900"
              />
              <div>
                <p className="text-xs sm:text-sm font-bold text-stone-900">Priority Express</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {siteConfig.shipping.estimatedDeliveryExpress}
                </p>
                <p className="text-[11px] text-stone-700 font-medium mt-1">
                  Rs. {siteConfig.shipping.expressFlatRate} flat rate
                </p>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3.5 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
        >
          Continue to Payment Method →
        </button>
      </div>
    </form>
  );
};
