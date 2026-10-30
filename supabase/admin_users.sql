-- ============================================================================
-- OFFSTAGE SESSIONS — DEDICATED ADMIN USERS & 2FA AUTHENTICATION SCHEMA
-- Copy dan paste script ini langsung di Supabase SQL Editor lalu tekan "Run".
-- ============================================================================

-- 1. Enable UUID Extension (jika belum aktif)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLE: ADMIN USERS (Two-Factor Admin Authentication & Access Control)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin', 'manager')),
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    pin_salt TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON public.admin_users(status);

-- ============================================================================
-- 3. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if re-running
DROP POLICY IF EXISTS "Admin full access on admin_users" ON public.admin_users;

-- Hanya backend / service_role yang memiliki akses baca & tulis tabel admin_users
CREATE POLICY "Admin full access on admin_users" 
ON public.admin_users FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');

-- ============================================================================
-- 4. INITIAL SEED: DEFAULT ADMIN ACCOUNT
-- Username       : admin
-- Role           : admin
-- Password (1st) : offstageadmin2026
-- PIN (2nd)      : 260899
-- ============================================================================
INSERT INTO public.admin_users (
    id,
    username,
    name,
    role,
    password_hash,
    password_salt,
    pin_hash,
    pin_salt,
    status,
    created_at
) VALUES (
    'admin-43ccf747-f227-4b1e-bbb3-9f05576c9f05',
    'admin',
    'Main Admin',
    'admin',
    'b8c6d66bfe5f8b2bef9ed5d58744ff11b9c20127e50946a57cda4dd32f68563c059f5a785fc0b635b05fd9e96abafb1b6cdb531e372a7eeb9facaed3c383e7bc',
    '6b5453faa5782474105a538c68b7dd4f',
    'd0db6549b9c3014506543bf1f0596921ba6197c4ec0c9a9ca0278b543f46733e50db767dc85a9c1178aacae9fd948e1c913f63405cbafba46ec35df87171cb15',
    'e577d82abd9b7ab4f714bc9bbb4b01f1',
    'active',
    NOW()
)
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- 5. VERIFIKASI HASIL
-- ============================================================================
SELECT id, username, name, role, status, created_at FROM public.admin_users;
