import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Address } from "@/src/types";
import { authService } from "@/src/lib/services/authService";
import { adminAuthService } from "@/src/lib/services/adminAuthService";
import { useToast } from "@/src/context/ToastContext";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User>;
  loginAdmin: (password?: string) => Promise<User>;
  register: (
    email: string,
    firstName: string,
    lastName: string,
    phone?: string,
    password?: string
  ) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, "id">) => Promise<Address>;
  updateAddress: (addressId: string, updates: Partial<Address>) => Promise<Address>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;

    // 1. Initial async hydration (checks Supabase session or local session)
    authService.getCurrentUserAsync().then((activeUser) => {
      if (isMounted && activeUser) {
        setUser(activeUser);
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password?: string): Promise<User> => {
      try {
        const loggedIn = await authService.signIn(email, password);
        setUser(loggedIn);
        showToast(`Welcome back, ${loggedIn.firstName}!`, "success");
        return loggedIn;
      } catch (err: any) {
        showToast(err.message || "Failed to sign in", "error");
        throw err;
      }
    },
    [showToast]
  );

  const loginAdmin = useCallback(
    async (password?: string): Promise<User> => {
      try {
        const adminUser = await adminAuthService.loginAdmin(password);
        setUser(adminUser);
        showToast("Signed in as Store Administrator.", "success");
        return adminUser;
      } catch (err: any) {
        showToast(err.message || "Failed to sign in as admin", "error");
        throw err;
      }
    },
    [showToast]
  );

  const register = useCallback(
    async (
      email: string,
      firstName: string,
      lastName: string,
      phone?: string,
      password?: string
    ): Promise<User> => {
      try {
        const newUser = await authService.signUp(email, firstName, lastName, phone, password);
        setUser(newUser);
        showToast(`Account created! Welcome to NOVA STORE, ${firstName}.`, "success");
        return newUser;
      } catch (err: any) {
        showToast(err.message || "Failed to create account", "error");
        throw err;
      }
    },
    [showToast]
  );

  const logout = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    showToast("Signed out successfully.", "info");
  }, [showToast]);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      try {
        const updated = await authService.updateProfile(updates);
        setUser(updated);
        showToast("Profile details updated successfully.", "success");
      } catch (err: any) {
        showToast(err.message || "Could not update profile", "error");
        throw err;
      }
    },
    [showToast]
  );

  const addAddress = useCallback(
    async (address: Omit<Address, "id">): Promise<Address> => {
      try {
        const newAddr = await authService.addAddress(address);
        const updatedUser = authService.getCurrentUser();
        setUser(updatedUser);
        showToast("Address saved successfully.", "success");
        return newAddr;
      } catch (err: any) {
        showToast(err.message || "Failed to save address", "error");
        throw err;
      }
    },
    [showToast]
  );

  const updateAddress = useCallback(
    async (addressId: string, updates: Partial<Address>): Promise<Address> => {
      try {
        const updated = await authService.updateAddress(addressId, updates);
        const updatedUser = authService.getCurrentUser();
        setUser(updatedUser);
        showToast("Address updated.", "success");
        return updated;
      } catch (err: any) {
        showToast(err.message || "Failed to update address", "error");
        throw err;
      }
    },
    [showToast]
  );

  const deleteAddress = useCallback(
    async (addressId: string): Promise<void> => {
      try {
        await authService.deleteAddress(addressId);
        const updatedUser = authService.getCurrentUser();
        setUser(updatedUser);
        showToast("Address removed.", "info");
      } catch (err: any) {
        showToast(err.message || "Failed to remove address", "error");
        throw err;
      }
    },
    [showToast]
  );

  const setDefaultAddress = useCallback(
    async (addressId: string): Promise<void> => {
      try {
        await authService.setDefaultAddress(addressId);
        const updatedUser = authService.getCurrentUser();
        setUser(updatedUser);
        showToast("Default address updated.", "success");
      } catch (err: any) {
        showToast(err.message || "Failed to update default address", "error");
        throw err;
      }
    },
    [showToast]
  );

  const isUserAdmin = adminAuthService.isAdmin(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: isUserAdmin,
        isLoading,
        login,
        loginAdmin,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
