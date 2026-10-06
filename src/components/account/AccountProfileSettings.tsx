import React, { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { isValidPakistaniPhone, formatDate } from "@/src/lib/utils/formatters";
import { User, Phone, Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export const AccountProfileSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  // Basic Info State
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{ [key: string]: string }>({});

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [key: string]: string } = {};

    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (phone.trim() && !isValidPakistaniPhone(phone)) {
      errs.phone = "Enter a valid Pakistani mobile number (e.g. 0300-1234567).";
    }

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }
    setProfileErrors({});

    setIsUpdatingProfile(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [key: string]: string } = {};

    if (!currentPassword) {
      errs.currentPassword = "Enter your current password.";
    }
    if (!newPassword || newPassword.length < 8) {
      errs.newPassword = "New password must be at least 8 characters.";
    }
    if (newPassword !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }
    setPasswordErrors({});

    setIsUpdatingPassword(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      showToast("Password updated successfully! (Mock/Supabase-ready)", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      showToast("Failed to update password.", "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Profile Info Form */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900">
            Personal Information
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Update your contact details and recipient name for shipments
          </p>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (profileErrors.firstName) setProfileErrors({ ...profileErrors, firstName: "" });
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>
              {profileErrors.firstName && (
                <p className="text-[11px] text-rose-600 mt-1">{profileErrors.firstName}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Email Address (Primary Login)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || "customer@novastore.pk"}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Verified identifier used for order invoices.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Pakistani Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (profileErrors.phone) setProfileErrors({ ...profileErrors, phone: "" });
                  }}
                  placeholder="0300-1234567"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>
              {profileErrors.phone && (
                <p className="text-[11px] text-rose-600 mt-1">{profileErrors.phone}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs disabled:opacity-50"
            >
              {isUpdatingProfile ? "Saving..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Settings */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900">
            Account Security & Password
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Change your password to keep your account safe
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (passwordErrors.currentPassword)
                    setPasswordErrors({ ...passwordErrors, currentPassword: "" });
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
              />
            </div>
            {passwordErrors.currentPassword && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">
                {passwordErrors.currentPassword}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                New Password (Min 8 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordErrors.newPassword)
                      setPasswordErrors({ ...passwordErrors, newPassword: "" });
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>
              {passwordErrors.newPassword && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordErrors.confirmPassword)
                      setPasswordErrors({ ...passwordErrors, confirmPassword: "" });
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs disabled:opacity-50"
            >
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Account Meta */}
      <div className="p-4 bg-stone-100 rounded-2xl text-xs text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>Customer Account ID: <strong className="font-mono text-stone-700">{user?.id}</strong></span>
        {user?.createdAt && (
          <span>Joined: <strong>{formatDate(user.createdAt)}</strong></span>
        )}
      </div>
    </div>
  );
};
