import { User, Address, UserRole } from "@/src/types";
import { supabase, isSupabaseConfigured } from "@/src/lib/supabaseClient";

const USER_STORAGE_KEY = "novastore_auth_user";
const REGISTERED_USERS_KEY = "novastore_registered_users";

// Default seed customer for instant testing
const INITIAL_SEED_USER: User = {
  id: "usr_seed_hamza_01",
  email: "customer@novastore.pk",
  firstName: "Hamza",
  lastName: "Khan",
  phone: "0300-8451920",
  role: "CUSTOMER",
  createdAt: "2025-01-15T10:00:00.000Z",
  savedAddresses: [
    {
      id: "addr_01",
      label: "Home (Lahore)",
      isDefault: true,
      firstName: "Hamza",
      lastName: "Khan",
      email: "customer@novastore.pk",
      phone: "0300-8451920",
      province: "Punjab",
      city: "Lahore",
      area: "DHA Phase 5, Sector C",
      streetAddress: "Main Boulevard, Lane 4",
      houseFlatShopNumber: "House 184-C",
      postalCode: "54792",
      country: "Pakistan",
      deliveryInstructions: "Near Jalal Sons, ring doorbell twice.",
    },
    {
      id: "addr_02",
      label: "Office (Islamabad)",
      isDefault: false,
      firstName: "Hamza",
      lastName: "Khan",
      email: "customer@novastore.pk",
      phone: "0321-9876543",
      province: "Islamabad Capital Territory",
      city: "Islamabad",
      area: "Blue Area, Sector F-7",
      streetAddress: "Jinnah Avenue, Evacuee Trust Complex",
      houseFlatShopNumber: "Floor 4, Office 402",
      postalCode: "44000",
      country: "Pakistan",
      deliveryInstructions: "Leave with building reception desk during business hours.",
    },
  ],
};

// Seed administrator for NOVA STORE back office
const INITIAL_ADMIN_USER: User = {
  id: "usr_admin_novastore_01",
  email: "admin@novastore.pk",
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
      email: "admin@novastore.pk",
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

// Internal password lookup table for mock dev auth
interface StoredUserRecord {
  user: User;
  passwordHashMock: string;
}

// Helpers for Database mapping
function mapDbAddressToAddress(dbAddr: any): Address {
  return {
    id: dbAddr.id,
    label: dbAddr.label || "Home",
    isDefault: !!dbAddr.is_default,
    firstName: dbAddr.first_name,
    lastName: dbAddr.last_name || "",
    email: dbAddr.email,
    phone: dbAddr.phone,
    country: dbAddr.country || "Pakistan",
    province: dbAddr.province,
    division: dbAddr.division || undefined,
    district: dbAddr.district || undefined,
    tehsil: dbAddr.tehsil || undefined,
    city: dbAddr.city,
    area: dbAddr.area,
    streetAddress: dbAddr.street_address,
    houseFlatShopNumber: dbAddr.house_flat_shop_number,
    postalCode: dbAddr.postal_code || undefined,
    deliveryInstructions: dbAddr.delivery_instructions || undefined,
  };
}

export const authService = {
  /**
   * Initializes seed storage if not present
   */
  _ensureSeed(): void {
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      let records: StoredUserRecord[] = stored ? JSON.parse(stored) : [];
      
      const hasCustomer = records.some((r) => r.user.email.toLowerCase() === "customer@novastore.pk");
      const hasAdmin = records.some((r) => r.user.email.toLowerCase() === "admin@novastore.pk");

      let updated = false;
      if (!hasCustomer) {
        records.push({
          user: INITIAL_SEED_USER,
          passwordHashMock: "Pakistan@123",
        });
        updated = true;
      }

      if (!hasAdmin) {
        records.push({
          user: INITIAL_ADMIN_USER,
          passwordHashMock: "Admin@novastore123",
        });
        updated = true;
      }

      if (updated || !stored) {
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(records));
      }
    } catch {
      // Safe fallback
    }
  },

  /**
   * Fetch full user profile and addresses from Supabase database
   */
  async _fetchUserProfileFromSupabase(userId: string, email: string): Promise<User | null> {
    try {
      // 1. Fetch Profile
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileErr && profileErr.code !== "PGRST116") {
        console.warn("Could not load profile from Supabase:", profileErr);
      }

      // 2. Fetch Addresses
      const { data: addressesData } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false });

      const savedAddresses: Address[] = (addressesData || []).map(mapDbAddressToAddress);
      const defaultAddress = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

      const role: UserRole = profile?.role === "ADMIN" || email.toLowerCase() === "admin@novastore.pk" ? "ADMIN" : "CUSTOMER";

      const user: User = {
        id: userId,
        email: email.toLowerCase(),
        firstName: profile?.first_name || email.split("@")[0],
        lastName: profile?.last_name || "",
        phone: profile?.phone || undefined,
        role,
        defaultAddress,
        savedAddresses,
        createdAt: profile?.created_at || new Date().toISOString(),
      };

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (err) {
      console.error("Error fetching user profile from Supabase:", err);
      return null;
    }
  },

  /**
   * Get currently active session user (synchronous local read)
   */
  getCurrentUser(): User | null {
    this._ensureSeed();
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get active user asynchronously with Supabase session validation
   */
  async getCurrentUserAsync(): Promise<User | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await this._fetchUserProfileFromSupabase(session.user.id, session.user.email || "");
          if (profile) return profile;
        }
      } catch (err) {
        console.warn("Supabase session fetch error, falling back to local session:", err);
      }
    }
    return this.getCurrentUser();
  },

  /**
   * User sign-in with Supabase Auth or mock fallback
   */
  async signIn(email: string, password?: string): Promise<User> {
    this._ensureSeed();

    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error("Please enter your email.");
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      throw new Error("Please enter a valid email address.");
    }
    if (!password) {
      throw new Error("Please enter your password.");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    // Try Supabase Auth if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.user) {
          const user = await this._fetchUserProfileFromSupabase(data.user.id, cleanEmail);
          if (user) return user;
        }
      } catch (err: any) {
        // If it's a genuine Supabase auth rejection, rethrow
        if (!err.message?.includes("fetch") && !err.message?.includes("Failed to fetch")) {
          throw err;
        }
        console.warn("Supabase auth unreachable, falling back to local authentication mode.");
      }
    }

    // Local / Dev Fallback
    await new Promise((r) => setTimeout(r, 150));
    let records: StoredUserRecord[] = [];
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      if (stored) records = JSON.parse(stored);
    } catch {}

    const record = records.find(
      (r) => r.user.email.toLowerCase() === cleanEmail
    );

    if (record) {
      if (record.passwordHashMock && record.passwordHashMock !== password) {
        throw new Error("Incorrect password. Please verify and try again.");
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(record.user));
      return record.user;
    }

    // Auto-create for demo testing
    const defaultName = cleanEmail.split("@")[0];
    const newUser: User = {
      id: `usr_${Date.now().toString(36)}`,
      email: cleanEmail,
      firstName: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
      lastName: cleanEmail === "admin@novastore.pk" ? "Administrator" : "Customer",
      role: cleanEmail === "admin@novastore.pk" ? "ADMIN" : "CUSTOMER",
      savedAddresses: [],
      createdAt: new Date().toISOString(),
    };

    records.push({
      user: newUser,
      passwordHashMock: password,
    });

    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(records));
    } catch {}

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  /**
   * Register new customer account
   */
  async signUp(
    email: string,
    firstName: string,
    lastName: string,
    phone?: string,
    password?: string
  ): Promise<User> {
    this._ensureSeed();

    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error("Please enter your email.");
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      throw new Error("Please enter a valid email address.");
    }
    if (!firstName || firstName.trim().length === 0) {
      throw new Error("Please enter your first name.");
    }
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    // Supabase Auth Registration
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: (lastName || "").trim(),
              phone: phone?.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Upsert Profile row
          const role: UserRole = cleanEmail === "admin@novastore.pk" ? "ADMIN" : "CUSTOMER";
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email: cleanEmail,
            first_name: firstName.trim(),
            last_name: (lastName || "").trim(),
            phone: phone?.trim() || null,
            role,
          });

          const profile = await this._fetchUserProfileFromSupabase(data.user.id, cleanEmail);
          if (profile) return profile;
        }
      } catch (err: any) {
        if (!err.message?.includes("fetch")) {
          throw err;
        }
        console.warn("Supabase auth unreachable, falling back to local registration.");
      }
    }

    // Local / Dev Registration
    await new Promise((r) => setTimeout(r, 200));
    let records: StoredUserRecord[] = [];
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      if (stored) records = JSON.parse(stored);
    } catch {}

    const existing = records.find((r) => r.user.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error("An account with this email already exists. Please sign in.");
    }

    const newUser: User = {
      id: `usr_${Date.now().toString(36)}`,
      email: cleanEmail,
      firstName: firstName.trim(),
      lastName: (lastName || "").trim(),
      phone: phone?.trim(),
      role: cleanEmail === "admin@novastore.pk" ? "ADMIN" : "CUSTOMER",
      savedAddresses: [],
      createdAt: new Date().toISOString(),
    };

    records.push({
      user: newUser,
      passwordHashMock: password,
    });

    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(records));
    } catch {}

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  /**
   * Update user details and persist in session & Supabase
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    const current = this.getCurrentUser();
    if (!current) throw new Error("No active session");

    const updated: User = {
      ...current,
      ...updates,
      id: current.id,
      email: current.email,
    };

    // Sync with Supabase profiles table
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("profiles").update({
          first_name: updated.firstName,
          last_name: updated.lastName,
          phone: updated.phone || null,
        }).eq("id", current.id);
      } catch (err) {
        console.warn("Could not sync profile to Supabase:", err);
      }
    }

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));

    // Update in registered records list
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      if (stored) {
        const records: StoredUserRecord[] = JSON.parse(stored);
        const idx = records.findIndex((r) => r.user.id === current.id);
        if (idx !== -1) {
          records[idx].user = updated;
          localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(records));
        }
      }
    } catch {}

    return updated;
  },

  /**
   * Address Book Management (Supabase + Local fallback)
   */
  async getAddresses(): Promise<Address[]> {
    const user = this.getCurrentUser();
    if (!user) return [];

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false });

        if (!error && data) {
          return data.map(mapDbAddressToAddress);
        }
      } catch (err) {
        console.warn("Could not fetch addresses from Supabase:", err);
      }
    }

    return user.savedAddresses || [];
  },

  async addAddress(address: Omit<Address, "id">): Promise<Address> {
    const user = this.getCurrentUser();
    if (!user) throw new Error("User must be logged in to save addresses");

    const addresses = [...(user.savedAddresses || [])];
    const isFirst = addresses.length === 0;
    const shouldBeDefault = address.isDefault || isFirst;

    let createdId = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Sync to Supabase addresses table
    if (isSupabaseConfigured()) {
      try {
        if (shouldBeDefault) {
          // Reset existing default addresses
          await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
        }

        const { data, error } = await supabase.from("addresses").insert({
          user_id: user.id,
          label: address.label || "Home",
          is_default: shouldBeDefault,
          first_name: address.firstName,
          last_name: address.lastName || "",
          email: address.email,
          phone: address.phone,
          country: address.country || "Pakistan",
          province: address.province,
          division: address.division || null,
          district: address.district || null,
          tehsil: address.tehsil || null,
          city: address.city,
          area: address.area,
          street_address: address.streetAddress,
          house_flat_shop_number: address.houseFlatShopNumber,
          postal_code: address.postalCode || null,
          delivery_instructions: address.deliveryInstructions || null,
        }).select().single();

        if (!error && data) {
          createdId = data.id;
        }
      } catch (err) {
        console.warn("Could not insert address into Supabase:", err);
      }
    }

    const newAddress: Address = {
      ...address,
      id: createdId,
      isDefault: shouldBeDefault,
    };

    const updatedList: Address[] = addresses.map((a) => ({
      ...a,
      isDefault: shouldBeDefault ? false : !!a.isDefault,
    }));
    updatedList.unshift(newAddress);

    await this.updateProfile({
      savedAddresses: updatedList,
      defaultAddress: shouldBeDefault ? newAddress : user.defaultAddress || newAddress,
    });

    return newAddress;
  },

  async updateAddress(addressId: string, updates: Partial<Address>): Promise<Address> {
    const user = this.getCurrentUser();
    if (!user) throw new Error("User must be logged in");

    const addresses = user.savedAddresses || [];
    const index = addresses.findIndex((a) => a.id === addressId);
    if (index === -1) throw new Error("Address not found");

    const isMakingDefault = updates.isDefault === true;

    if (isSupabaseConfigured()) {
      try {
        if (isMakingDefault) {
          await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
        }

        const dbUpdates: any = {};
        if (updates.label !== undefined) dbUpdates.label = updates.label;
        if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault;
        if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
        if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.province !== undefined) dbUpdates.province = updates.province;
        if (updates.division !== undefined) dbUpdates.division = updates.division;
        if (updates.district !== undefined) dbUpdates.district = updates.district;
        if (updates.tehsil !== undefined) dbUpdates.tehsil = updates.tehsil;
        if (updates.city !== undefined) dbUpdates.city = updates.city;
        if (updates.area !== undefined) dbUpdates.area = updates.area;
        if (updates.streetAddress !== undefined) dbUpdates.street_address = updates.streetAddress;
        if (updates.houseFlatShopNumber !== undefined) dbUpdates.house_flat_shop_number = updates.houseFlatShopNumber;
        if (updates.postalCode !== undefined) dbUpdates.postal_code = updates.postalCode;
        if (updates.deliveryInstructions !== undefined) dbUpdates.delivery_instructions = updates.deliveryInstructions;

        await supabase.from("addresses").update(dbUpdates).eq("id", addressId);
      } catch (err) {
        console.warn("Could not update address in Supabase:", err);
      }
    }

    const updatedList = addresses.map((a) => {
      if (a.id === addressId) {
        return { ...a, ...updates };
      }
      if (isMakingDefault) {
        return { ...a, isDefault: false };
      }
      return a;
    });

    const targetAddress = updatedList.find((a) => a.id === addressId)!;

    await this.updateProfile({
      savedAddresses: updatedList,
      defaultAddress: isMakingDefault ? targetAddress : user.defaultAddress,
    });

    return targetAddress;
  },

  async deleteAddress(addressId: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error("User must be logged in");

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("addresses").delete().eq("id", addressId);
      } catch (err) {
        console.warn("Could not delete address from Supabase:", err);
      }
    }

    const addresses = user.savedAddresses || [];
    const filtered = addresses.filter((a) => a.id !== addressId);

    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0].isDefault = true;
    }

    const newDefault = filtered.find((a) => a.isDefault) || undefined;

    await this.updateProfile({
      savedAddresses: filtered,
      defaultAddress: newDefault,
    });
  },

  async setDefaultAddress(addressId: string): Promise<void> {
    await this.updateAddress(addressId, { isDefault: true });
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Supabase signOut error:", err);
      }
    }
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  /**
   * Password reset trigger
   */
  async resetPassword(email: string): Promise<boolean> {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
        if (error) throw error;
        return true;
      } catch (err: any) {
        console.warn("Supabase password reset failed, falling back to simulated flow:", err);
      }
    }

    await new Promise((r) => setTimeout(r, 300));
    return true;
  },
};
