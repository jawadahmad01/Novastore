import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { authService } from "@/src/lib/services/authService";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";
import { isValidPakistaniPhone } from "@/src/lib/utils/formatters";
import { SEO } from "@/src/components/common/SEO";
import {
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      errs.email = "Please enter your email.";
    } else if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      errs.email = "Please enter a valid email address.";
    }

    if (!password) {
      errs.password = "Please enter your password.";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const loggedUser = await login(email.trim(), password);
      const specifiedFrom = (location.state as any)?.from?.pathname;
      if (specifiedFrom) {
        navigate(specifiedFrom, { replace: true });
      } else if (loggedUser.role === "ADMIN" || loggedUser.email?.toLowerCase() === "admin@novastore.pk") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/account", { replace: true });
      }
    } catch {
      // Error handled by AuthContext toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCustomerDemo = () => {
    setEmail("customer@novastore.pk");
    setPassword("Pakistan@123");
    setErrors({});
  };

  const fillAdminDemo = () => {
    setEmail("admin@novastore.pk");
    setPassword("Admin@novastore123");
    setErrors({});
  };

  const stateMessage = (location.state as any)?.message;

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16 space-y-6">
      <SEO
        title="Sign In"
        description="Sign in to your NOVA STORE account to track orders, manage addresses, and access wishlist."
      />
      <Breadcrumbs items={[{ label: "Sign In" }]} />

      {stateMessage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{stateMessage}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center mx-auto text-lg font-extrabold tracking-tighter mb-2 shadow-xs">
            N
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-stone-500">
            Sign in to access your orders, addresses, or admin back office
          </p>
        </div>

        {/* 1-Click Demo Account Quick Fill */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-stone-700 font-medium">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Quick-fill test credentials:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fillCustomerDemo}
              className="flex-1 px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-[11px] font-semibold transition-colors shadow-2xs text-center"
            >
              Customer Demo
            </button>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="flex-1 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[11px] font-semibold transition-colors shadow-2xs text-center"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                  errors.email
                    ? "border-rose-400 bg-rose-50/40 text-stone-900 focus:border-rose-500"
                    : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-stone-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-stone-500 hover:text-stone-900 underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                  errors.password
                    ? "border-rose-400 bg-rose-50/40 text-stone-900 focus:border-rose-500"
                    : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-stone-400 hover:text-stone-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-stone-500 border-t border-stone-100">
          Don't have an account yet?{" "}
          <Link to="/register" className="font-bold text-stone-900 hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!firstName.trim()) {
      errs.firstName = "Please enter your first name.";
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      errs.email = "Please enter your email.";
    } else if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      errs.email = "Please enter a valid email address.";
    }

    if (phone.trim() && !isValidPakistaniPhone(phone)) {
      errs.phone = "Please enter a valid Pakistani mobile number (e.g. 0300-1234567).";
    }

    if (!password) {
      errs.password = "Please enter a password.";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (!acceptTerms) {
      errs.terms = "You must agree to the Terms of Service to create an account.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(email.trim(), firstName.trim(), lastName.trim(), phone.trim(), password);
      navigate("/account");
    } catch {
      // Handled by AuthContext toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-16 space-y-6">
      <SEO
        title="Create Account"
        description="Join NOVA STORE for seamless checkout, quick tracking, and exclusive discounts across Pakistan."
      />
      <Breadcrumbs items={[{ label: "Create Account" }]} />

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center mx-auto text-lg font-extrabold tracking-tighter mb-2 shadow-xs">
            N
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Create Customer Account
          </h1>
          <p className="text-xs text-stone-500">
            Enjoy 1-click checkout, instant tracking, and order history across Pakistan
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                    if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: "" }));
                  }}
                  placeholder="e.g. Hamza"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                    errors.firstName
                      ? "border-rose-400 bg-rose-50/40"
                      : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
                  }`}
                />
              </div>
              {errors.firstName && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.firstName}</p>
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
                placeholder="e.g. Khan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm focus:outline-none focus:border-stone-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                  errors.email
                    ? "border-rose-400 bg-rose-50/40"
                    : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Pakistani Phone */}
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
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                placeholder="0300-1234567"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                  errors.phone
                    ? "border-rose-400 bg-rose-50/40"
                    : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
                }`}
              />
            </div>
            {errors.phone ? (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.phone}</p>
            ) : (
              <p className="text-[11px] text-stone-400 mt-0.5">
                Used by delivery courier riders for dispatch coordination.
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Password (Minimum 8 characters) *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                  errors.password
                    ? "border-rose-400 bg-rose-50/40"
                    : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-stone-400 hover:text-stone-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                  errors.confirmPassword
                    ? "border-rose-400 bg-rose-50/40"
                    : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
                }}
                className="mt-0.5 rounded text-stone-900 focus:ring-stone-900 h-4 w-4"
              />
              <span className="text-xs text-stone-600 leading-normal">
                I agree to the{" "}
                <Link to="/terms" className="text-stone-900 underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-stone-900 underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.terms && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.terms}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? "Creating Account..." : "Create Customer Account"}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-stone-500 border-t border-stone-100">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-stone-900 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await authService.resetPassword(cleanEmail);
      setSubmitted(true);
      showToast("Password reset instructions sent to your email.", "success");
    } catch (err: any) {
      showToast(err.message || "Could not process request", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16 space-y-6">
      <SEO
        title="Reset Password"
        description="Reset your NOVA STORE customer password securely."
      />
      <Breadcrumbs items={[{ label: "Reset Password" }]} />

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        {!submitted ? (
          <>
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-900 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                Reset Password
              </h1>
              <p className="text-xs text-stone-500 leading-relaxed">
                Enter your registered email address and we'll send you instructions to reset your password.
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-4" noValidate>
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                      error
                        ? "border-rose-400 bg-rose-50/40"
                        : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
                    }`}
                  />
                </div>
                {error && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-3 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-xl font-bold text-stone-900">Check Your Inbox</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              We dispatched password reset instructions to <strong>{email}</strong>. Please check your inbox or spam folder.
            </p>
            <div className="pt-3">
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-stone-500 hover:text-stone-900 underline"
              >
                Send again to a different email
              </button>
            </div>
          </div>
        )}

        <div className="pt-2 text-center text-xs text-stone-500 border-t border-stone-100">
          <Link to="/login" className="font-bold text-stone-900 hover:underline">
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
