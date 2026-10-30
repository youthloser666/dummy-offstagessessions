import crypto from 'crypto';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { AdminUser, AdminUserPublic, AdminRole } from '@/app/offstageadminv/types';

const ADMIN_SECRET = process.env.ADMIN_SECRET_PASSKEY || 'offstage-session-admin-2026';
const SETTINGS_KEY = 'admin_accounts';

// Default initial admin credentials
export const DEFAULT_INITIAL_ADMIN = {
  username: 'admin',
  name: 'Main Admin',
  role: 'admin' as AdminRole,
  password: 'offstageadmin2026',
  pin: '260899',
};

// ============================================================================
// Cryptographic Helpers
// ============================================================================

export function generateSalt(length = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

export function hashSecret(secret: string, salt: string): string {
  return crypto.pbkdf2Sync(secret, salt, 10000, 64, 'sha512').toString('hex');
}

export function verifySecret(secret: string, salt: string, hash: string): boolean {
  try {
    const computed = hashSecret(secret, salt);
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

// ============================================================================
// Lightweight Signed Token System (Challenge & Session Tokens)
// ============================================================================

function base64UrlEncode(data: string): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(data: string): string {
  let str = data.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

function signPayload(payload: object, secret: string): string {
  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadStr);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedPayload}.${signature}`;
}

function verifySignedPayload<T>(token: string, secret: string): T | null {
  try {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSig) return null;

    const payloadStr = base64UrlDecode(encodedPayload);
    const parsed = JSON.parse(payloadStr);

    if (parsed.exp && Date.now() > parsed.exp) {
      return null;
    }

    return parsed as T;
  } catch {
    return null;
  }
}

// ============================================================================
// Tokens: Challenge (5 min) & Session (7 days)
// ============================================================================

export interface ChallengeTokenPayload {
  type: 'admin_login_challenge';
  adminId: string;
  username: string;
  exp: number;
}

export interface SessionTokenPayload {
  type: 'admin_session';
  admin: AdminUserPublic;
  exp: number;
}

export function createChallengeToken(user: AdminUser): string {
  const payload: ChallengeTokenPayload = {
    type: 'admin_login_challenge',
    adminId: user.id,
    username: user.username,
    exp: Date.now() + 5 * 60 * 1000, // 5 minutes
  };
  return signPayload(payload, ADMIN_SECRET);
}

export function verifyChallengeToken(token: string): ChallengeTokenPayload | null {
  const payload = verifySignedPayload<ChallengeTokenPayload>(token, ADMIN_SECRET);
  if (!payload || payload.type !== 'admin_login_challenge') return null;
  return payload;
}

export function createSessionToken(user: AdminUserPublic): string {
  const payload: SessionTokenPayload = {
    type: 'admin_session',
    admin: user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return signPayload(payload, ADMIN_SECRET);
}

export function verifySessionToken(token: string): AdminUserPublic | null {
  const payload = verifySignedPayload<SessionTokenPayload>(token, ADMIN_SECRET);
  if (!payload || payload.type !== 'admin_session') return null;
  return payload.admin;
}

// ============================================================================
// Admin User Storage Engine
// Supports both 'admin_users' table and fallback 'site_settings' table
// ============================================================================

function toPublicUser(u: AdminUser): AdminUserPublic {
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    status: u.status,
    created_at: u.created_at,
    last_login_at: u.last_login_at,
  };
}

function buildInitialDefaultAdmin(): AdminUser {
  const passSalt = generateSalt();
  const pinSalt = generateSalt();
  return {
    id: 'admin-' + crypto.randomUUID(),
    username: DEFAULT_INITIAL_ADMIN.username,
    name: DEFAULT_INITIAL_ADMIN.name,
    role: DEFAULT_INITIAL_ADMIN.role,
    password_salt: passSalt,
    password_hash: hashSecret(DEFAULT_INITIAL_ADMIN.password, passSalt),
    pin_salt: pinSalt,
    pin_hash: hashSecret(DEFAULT_INITIAL_ADMIN.pin, pinSalt),
    status: 'active',
    created_at: new Date().toISOString(),
    last_login_at: null,
  };
}

/**
 * Fetch all admins internally (with hashes)
 */
export async function getInternalAdminUsers(): Promise<AdminUser[]> {
  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    // If no supabase connection, return default admin in-memory
    return [buildInitialDefaultAdmin()];
  }

  // 1. Try dedicated admin_users table
  try {
    const { data, error } = await supabase.from('admin_users').select('*');
    if (!error && Array.isArray(data) && data.length > 0) {
      return data as unknown as AdminUser[];
    }
    // If table exists but empty, seed default
    if (!error && Array.isArray(data) && data.length === 0) {
      const defaultAdmin = buildInitialDefaultAdmin();
      await supabase.from('admin_users').insert([defaultAdmin]);
      return [defaultAdmin];
    }
  } catch {
    // Continue to fallback
  }

  // 2. Fallback: site_settings JSON store
  try {
    const { data: settingData, error: settingError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    if (!settingError && settingData && Array.isArray((settingData as any).value) && (settingData as any).value.length > 0) {
      return (settingData as any).value as unknown as AdminUser[];
    }

    // Auto-seed initial default admin in site_settings
    const defaultAdmin = buildInitialDefaultAdmin();
    await supabase.from('site_settings').upsert({
      key: SETTINGS_KEY,
      value: [defaultAdmin] as any,
      description: 'Offstage Admin Accounts and Access Control',
      updated_at: new Date().toISOString(),
    });

    return [defaultAdmin];
  } catch (err) {
    console.error('Error fetching admin accounts from site_settings:', err);
    return [buildInitialDefaultAdmin()];
  }
}

/**
 * Save updated list of admins into persistence
 */
async function saveInternalAdminUsers(users: AdminUser[]): Promise<void> {
  const supabase = getSupabaseServerClient(true);
  if (!supabase) return;

  // Try updating site_settings first as it's guaranteed to work with JSONB
  try {
    await supabase.from('site_settings').upsert({
      key: SETTINGS_KEY,
      value: users as any,
      description: 'Offstage Admin Accounts and Access Control',
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not save to site_settings:', err);
  }

  // Also try syncing to admin_users table if it exists
  try {
    // Delete and recreate or upsert
    for (const u of users) {
      await supabase.from('admin_users').upsert(u);
    }
  } catch {
    // Ignore if table does not exist
  }
}

/**
 * Public function to list all admins (passwords/PINs stripped)
 */
export async function listAdminUsers(): Promise<AdminUserPublic[]> {
  const users = await getInternalAdminUsers();
  return users.map(toPublicUser);
}

/**
 * Find admin user by username (case-insensitive)
 */
export async function findAdminByUsername(username: string): Promise<AdminUser | null> {
  const users = await getInternalAdminUsers();
  const cleanUsername = username.trim().toLowerCase();
  const user = users.find((u) => u.username.toLowerCase() === cleanUsername);
  return user || null;
}

/**
 * Find admin user by ID
 */
export async function findAdminById(id: string): Promise<AdminUser | null> {
  const users = await getInternalAdminUsers();
  const user = users.find((u) => u.id === id);
  return user || null;
}

/**
 * Create a new admin account
 */
export async function createAdminUser(data: {
  username: string;
  name: string;
  role?: AdminRole;
  password: string;
  pin: string;
}): Promise<AdminUserPublic> {
  const cleanUsername = data.username.trim().toLowerCase();
  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error('Username must be at least 3 characters.');
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {
    throw new Error('Username can only contain letters, numbers, dots, dashes, and underscores.');
  }

  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Full name is required.');
  }

  if (!data.password || data.password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const cleanPin = data.pin.trim();
  if (!/^\d{4,6}$/.test(cleanPin)) {
    throw new Error('PIN must be between 4 and 6 numeric digits (0-9).');
  }

  const existingUsers = await getInternalAdminUsers();
  const exists = existingUsers.some((u) => u.username.toLowerCase() === cleanUsername);
  if (exists) {
    throw new Error(`Admin with username "${cleanUsername}" already exists.`);
  }

  const passSalt = generateSalt();
  const pinSalt = generateSalt();

  const newAdmin: AdminUser = {
    id: 'admin-' + crypto.randomUUID(),
    username: cleanUsername,
    name: data.name.trim(),
    role: data.role || 'admin',
    password_salt: passSalt,
    password_hash: hashSecret(data.password, passSalt),
    pin_salt: pinSalt,
    pin_hash: hashSecret(cleanPin, pinSalt),
    status: 'active',
    created_at: new Date().toISOString(),
    last_login_at: null,
  };

  existingUsers.push(newAdmin);
  await saveInternalAdminUsers(existingUsers);

  return toPublicUser(newAdmin);
}

/**
 * Delete an admin user
 */
export async function deleteAdminUser(id: string): Promise<{ success: boolean; error?: string }> {
  const existingUsers = await getInternalAdminUsers();
  if (existingUsers.length <= 1) {
    return { success: false, error: 'Cannot delete the only admin account. At least 1 admin must remain.' };
  }

  const index = existingUsers.findIndex((u) => u.id === id);
  if (index === -1) {
    return { success: false, error: 'Admin account not found.' };
  }

  existingUsers.splice(index, 1);
  await saveInternalAdminUsers(existingUsers);

  // If table exists, also remove from table
  try {
    const supabase = getSupabaseServerClient(true);
    if (supabase) {
      await supabase.from('admin_users').delete().eq('id', id);
    }
  } catch {
    // Ignore
  }

  return { success: true };
}

/**
 * Record last login timestamp
 */
export async function recordAdminLogin(id: string): Promise<void> {
  const existingUsers = await getInternalAdminUsers();
  const user = existingUsers.find((u) => u.id === id);
  if (!user) return;

  user.last_login_at = new Date().toISOString();
  await saveInternalAdminUsers(existingUsers);
}
