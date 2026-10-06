import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/src/config/supabase";

/**
 * NOVA STORE — SUPABASE CLIENT INITIALIZATION
 * 
 * Single-vendor store backend client.
 * Connects directly to Supabase Auth, PostgreSQL Database, and Storage.
 */

let supabaseInstance: SupabaseClient<any, "public", any> | null = null;

export const getSupabaseClient = (): SupabaseClient<any, "public", any> => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      supabaseConfig.url,
      supabaseConfig.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }
  return supabaseInstance;
};

// Default exported client instance
export const supabase = getSupabaseClient();

/**
 * Helper to check if the app is currently connected to a live Supabase project
 */
export const isSupabaseConfigured = (): boolean => {
  return supabaseConfig.isConfigured;
};

/**
 * Validates connection to Supabase database
 */
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  error?: any;
}> => {
  if (!supabaseConfig.isConfigured) {
    return {
      success: false,
      message: "Supabase credentials are not configured in environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).",
    };
  }

  try {
    const { error } = await supabase.from("categories").select("id", { count: "exact", head: true });
    if (error) {
      return {
        success: false,
        message: `Failed to connect to Supabase: ${error.message}`,
        error,
      };
    }

    return {
      success: true,
      message: "Successfully connected to Supabase PostgreSQL database!",
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection exception: ${err?.message || "Unknown error"}`,
      error: err,
    };
  }
};
