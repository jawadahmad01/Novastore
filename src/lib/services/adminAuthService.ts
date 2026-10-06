import { User } from "@/src/types";
import { authService } from "./authService";

/**
 * ADMIN AUTHENTICATION SERVICE FOR NOVA STORE
 * 
 * ============================================================================
 * ARCHITECTURAL & SECURITY NOTICE (PRODUCTION BACKEND / SUPABASE READINESS):
 * ============================================================================
 * 1. This service provides role checks, admin verification, and demo administration
 *    flows for NOVA STORE in this frontend architecture.
 * 2. In production with Supabase / custom backend:
 *    - Client-side role checks MUST NEVER be treated as the sole security boundary.
 *    - Production security must be enforced on the server via Supabase Auth metadata
 *      (e.g., `auth.jwt() -> app_metadata -> role = 'ADMIN'`) and Supabase Row Level
 *      Security (RLS) policies.
 *    - RLS policies must restrict table operations (INSERT/UPDATE/DELETE on products,
 *      categories, orders, coupons, settings) strictly to authenticated users with
 *      verified admin claims.
 *    - Sensitive keys, service role secrets, or bypass tokens MUST NEVER exist
 *      in client bundles.
 * ============================================================================
 */

export const ADMIN_EMAIL = "admin@novastore.pk";
export const ADMIN_DEFAULT_DEV_PASSWORD = "Admin@novastore123";

export const MOCK_ADMIN_USER: User = {
  id: "usr_admin_novastore_01",
  email: ADMIN_EMAIL,
  firstName: "Store",
  lastName: "Administrator",
  phone: "0300-1112233",
  role: "ADMIN",
  createdAt: "2025-01-01T00:00:00.000Z",
  savedAddresses: [
    {
      id: "addr_admin_hq",
      label: "NOVA STORE HQ",
      isDefault: true,
      firstName: "NOVA",
      lastName: "Operations",
      email: ADMIN_EMAIL,
      phone: "0300-1112233",
      province: "Punjab",
      city: "Lahore",
      area: "Gulberg III",
      streetAddress: "M.M. Alam Road, Plaza 42",
      houseFlatShopNumber: "Suite 501",
      postalCode: "54000",
      country: "Pakistan",
      deliveryInstructions: "NOVA STORE Fulfillment & HQ Office",
    },
  ],
};

export const adminAuthService = {
  /**
   * Checks if a provided or active user is an administrator.
   * Checks both explicit `role === 'ADMIN'` and the official admin domain identifier.
   */
  isAdmin(user?: User | null): boolean {
    if (!user) {
      const active = authService.getCurrentUser();
      if (!active) return false;
      return (
        active.role === "ADMIN" ||
        active.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()
      );
    }
    return (
      user.role === "ADMIN" ||
      user.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()
    );
  },

  /**
   * Asserts admin authorization.
   * Throws an error or returns false if unauthorized.
   */
  requireAdmin(user?: User | null): boolean {
    const isAuthorized = this.isAdmin(user);
    if (!isAuthorized) {
      throw new Error("Access Denied: Administrator privileges required.");
    }
    return true;
  },

  /**
   * Retrieves the current administrator user if active session is an admin.
   */
  getAdminUser(): User | null {
    const user = authService.getCurrentUser();
    return this.isAdmin(user) ? user : null;
  },

  /**
   * Dedicated Admin sign-in flow.
   * Authenticates admin@novastore.pk and stores admin session with ADMIN role.
   */
  async loginAdmin(password?: string): Promise<User> {
    // Artificial small delay to simulate auth network roundtrip
    await new Promise((r) => setTimeout(r, 200));

    // Sign in through core authService with admin credentials
    const adminUser = await authService.signIn(
      ADMIN_EMAIL,
      password || ADMIN_DEFAULT_DEV_PASSWORD
    );

    // Ensure role is explicitly ADMIN in session
    if (adminUser.role !== "ADMIN") {
      const updatedAdmin = await authService.updateProfile({ role: "ADMIN" });
      return updatedAdmin;
    }

    return adminUser;
  },

  /**
   * Seed helper to register admin user in mock persistence if not already seeded
   */
  ensureAdminSeed(): void {
    try {
      authService._ensureSeed();
    } catch {
      // Safe fallback
    }
  },
};
