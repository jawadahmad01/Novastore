-- ============================================================================
-- NOVA STORE — MIGRATION: ADD HIERARCHICAL PAKISTAN ADDRESS COLUMNS
-- Non-destructive migration preserving existing addresses and user profiles.
-- ============================================================================

ALTER TABLE public.addresses 
  ADD COLUMN IF NOT EXISTS division TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS tehsil TEXT;

-- Create index on district and province for performance analytics
CREATE INDEX IF NOT EXISTS idx_addresses_district ON public.addresses(district);
CREATE INDEX IF NOT EXISTS idx_addresses_province ON public.addresses(province);
