import React, { useState } from "react";
import { Address } from "@/src/types";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { isValidPakistaniPhone } from "@/src/lib/utils/formatters";
import { PakistanAddressSelector } from "@/src/components/common/PakistanAddressSelector";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Phone,
  Building,
  AlertCircle,
  X,
} from "lucide-react";

export const SavedAddressesManager: React.FC = () => {
  const { user, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form state
  const initialFormState: Omit<Address, "id"> = {
    label: "Home",
    isDefault: false,
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    country: "Pakistan",
    province: "Punjab",
    division: "Lahore Division",
    district: "Lahore",
    tehsil: "Lahore City",
    city: "Lahore",
    area: "",
    streetAddress: "",
    houseFlatShopNumber: "",
    postalCode: "",
    deliveryInstructions: "",
  };

  const [formData, setFormData] = useState<Omit<Address, "id">>(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addresses = user?.savedAddresses || [];

  const openAddModal = () => {
    setEditingAddressId(null);
    setFormData({
      ...initialFormState,
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      isDefault: addresses.length === 0,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddressId(addr.id || null);
    setFormData({
      label: addr.label || "Home",
      isDefault: !!addr.isDefault,
      firstName: addr.firstName,
      lastName: addr.lastName,
      email: addr.email,
      phone: addr.phone,
      country: addr.country || "Pakistan",
      province: addr.province || "Punjab",
      division: addr.division || "",
      district: addr.district || addr.city || "",
      tehsil: addr.tehsil || "",
      city: addr.city || addr.district || "",
      area: addr.area || "",
      streetAddress: addr.streetAddress || "",
      houseFlatShopNumber: addr.houseFlatShopNumber || "",
      postalCode: addr.postalCode || "",
      deliveryInstructions: addr.deliveryInstructions || "",
    });
    setErrors({});
    setIsModalOpen(true);
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
    if (errors.division) setErrors((prev) => ({ ...prev, division: "" }));
  };

  const handleDistrictChange = (district: string) => {
    setFormData((prev) => ({
      ...prev,
      district,
      tehsil: "",
      city: district,
    }));
    if (errors.district) setErrors((prev) => ({ ...prev, district: "" }));
  };

  const handleTehsilChange = (tehsil: string) => {
    setFormData((prev) => ({
      ...prev,
      tehsil,
      city: prev.district || tehsil,
    }));
    if (errors.tehsil) setErrors((prev) => ({ ...prev, tehsil: "" }));
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required.";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required.";
    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!isValidPakistaniPhone(formData.phone)) {
      errs.phone = "Enter a valid Pakistani mobile number (e.g. 0300-1234567).";
    }

    if (!formData.province) errs.province = "Please select province / region.";
    if (!formData.division) errs.division = "Please select division.";
    if (!formData.district) errs.district = "Please select district.";
    if (!formData.tehsil) errs.tehsil = "Please select tehsil / taluka.";

    if (!formData.area.trim()) errs.area = "Area or locality is required (e.g. DHA Phase 5).";
    if (!formData.streetAddress.trim()) errs.streetAddress = "Street address is required.";
    if (!formData.houseFlatShopNumber.trim()) {
      errs.houseFlatShopNumber = "House, flat, or shop # is required.";
    }

    if (formData.postalCode && formData.postalCode.trim().length > 0) {
      if (!/^\d{4,6}$/.test(formData.postalCode.trim())) {
        errs.postalCode = "Enter a valid 5-digit postal code.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const payload: Omit<Address, "id"> = {
      ...formData,
      country: "Pakistan",
      city: formData.district || formData.city || "Pakistan",
    };

    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, payload);
      } else {
        await addAddress(payload);
      }
      setIsModalOpen(false);
    } catch {
      // Handled in context toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this delivery address?")) {
      await deleteAddress(id);
    }
  };

  const handleSetDefault = async (id?: string) => {
    if (!id) return;
    await setDefaultAddress(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900">
            Delivery Addresses
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your saved shipping addresses across all 7 Pakistan provinces/regions
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Grid */}
      {addresses.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <MapPin className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-900">No Saved Addresses</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You don't have any saved shipping addresses yet. Add your home or office address to speed up future checkouts.
          </p>
          <div className="pt-2">
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
            >
              Add Your First Address
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 relative transition-all ${
                addr.isDefault
                  ? "border-stone-900 ring-2 ring-stone-900/10"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-stone-100 text-stone-800 rounded-lg text-xs font-bold">
                    {addr.label || "Address"}
                  </span>
                  {addr.isDefault ? (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Default Address</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] text-stone-400 hover:text-stone-800 font-medium underline"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Edit address"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Address Content */}
              <div className="text-xs space-y-1 text-stone-700">
                <p className="font-bold text-sm text-stone-900">
                  {addr.firstName} {addr.lastName}
                </p>
                <p className="text-stone-800 font-medium">
                  {addr.houseFlatShopNumber}, {addr.streetAddress}
                </p>
                <p className="text-stone-600">
                  {addr.area}
                </p>
                <p className="text-stone-500">
                  {addr.tehsil ? `${addr.tehsil}, ` : ""}{addr.district || addr.city}
                  {addr.division ? ` (${addr.division})` : ""}
                </p>
                <p className="text-stone-400 text-[11px]">
                  {addr.province}, Pakistan {addr.postalCode ? `· ${addr.postalCode}` : ""}
                </p>
                <p className="font-mono text-stone-800 pt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{addr.phone}</span>
                </p>
                {addr.deliveryInstructions && (
                  <p className="text-stone-500 italic text-[11px] pt-1 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    Note: "{addr.deliveryInstructions}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Official Pakistan administrative hierarchy
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Address Label */}
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Address Label
                </label>
                <div className="flex gap-2">
                  {["Home", "Office", "Other"].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, label: lbl }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        formData.label === lbl
                          ? "bg-stone-900 text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value });
                      if (errors.firstName) setErrors({ ...errors, firstName: "" });
                    }}
                    placeholder="Hamza"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                  {errors.firstName && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value });
                      if (errors.lastName) setErrors({ ...errors, lastName: "" });
                    }}
                    placeholder="Khan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                  {errors.lastName && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Pakistani Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  placeholder="0300-1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
                />
                {errors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* 4-Tier Pakistan Hierarchy Selector */}
              <div className="pt-1">
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
              </div>

              {/* Area & Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Area / Locality / Sector / Block *
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => {
                      setFormData({ ...formData, area: e.target.value });
                      if (errors.area) setErrors({ ...errors, area: "" });
                    }}
                    placeholder="e.g. DHA Phase 5, Sector C"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                  {errors.area && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.area}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Postal Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, postalCode: e.target.value });
                      if (errors.postalCode) setErrors({ ...errors, postalCode: "" });
                    }}
                    placeholder="54000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                  {errors.postalCode && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.postalCode}</p>
                  )}
                </div>
              </div>

              {/* House # & Street Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    House / Flat / Shop # *
                  </label>
                  <input
                    type="text"
                    value={formData.houseFlatShopNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, houseFlatShopNumber: e.target.value });
                      if (errors.houseFlatShopNumber) setErrors({ ...errors, houseFlatShopNumber: "" });
                    }}
                    placeholder="e.g. House 42-B"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                  {errors.houseFlatShopNumber && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.houseFlatShopNumber}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Street / Block / Road Address *
                  </label>
                  <input
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => {
                      setFormData({ ...formData, streetAddress: e.target.value });
                      if (errors.streetAddress) setErrors({ ...errors, streetAddress: "" });
                    }}
                    placeholder="e.g. Street 4, Sector Commercial"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                  {errors.streetAddress && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.streetAddress}</p>
                  )}
                </div>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Delivery Notes / Landmarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.deliveryInstructions || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryInstructions: e.target.value })
                  }
                  placeholder="e.g. Near commercial market, ring bell twice..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              {/* Default address checkbox */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="rounded text-stone-900 focus:ring-stone-900 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-stone-700">
                    Set as default shipping address
                  </span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : editingAddressId ? "Save Changes" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
