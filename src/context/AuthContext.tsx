import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { OWNER_CONFIG } from '../firebase/config';
import { getSupabaseClient } from '../supabase/config';
import { telegramService } from '../services/telegramService';
import { generateTotpSecret, verifyTotpCode, getOtpAuthUrl, getQrCodeImageUrl } from '../utils/totp';

interface AdminSession {
  email: string;
  token: string;
  loginTime: number;
  lastActive: number;
  expiresAt: number;
}

interface AuthContextType {
  isOwner: boolean;
  ownerName: string;
  ownerEmail: string;
  loading: boolean;
  loginAttemptsLeft: number;
  lockoutRemainingSeconds: number;
  loginAsOwner: (email: string, pass: string) => Promise<{ success: boolean; error?: string; require2FA?: boolean }>;
  logout: () => void;
  verify2FA: (otp: string) => Promise<{ success: boolean; error?: string }>;
  totpSecret: string;
  is2FAEnabled: boolean;
  setup2FA: () => { secret: string; otpAuthUrl: string; qrCodeUrl: string };
  enable2FA: (code: string) => Promise<{ success: boolean; error?: string }>;
  disable2FA: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const SESSION_KEY = 'ssc_hub_secure_admin_session_persistent_v1';
const RATE_LIMIT_KEY = 'ssc_hub_admin_rate_limit_v2';
const PENDING_2FA_KEY = 'ssc_hub_pending_2fa_v2';
const TOTP_SECRET_KEY = 'ssc_hub_totp_secret_v1';
const TOTP_ENABLED_KEY = 'ssc_hub_totp_enabled_v1';
const VAULT_GATE_KEY = 'ssc_vault_gate_unlocked';

// Persistent Device Session: 365 days (1 year duration)
const PERSISTENT_SESSION_DURATION_MS = 365 * 24 * 60 * 60 * 1000;
// Maximum failed attempts before lockout
const MAX_FAILED_ATTEMPTS = 5;
// Lockout duration: 15 minutes (in ms)
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

// PBKDF2 Password Verifier using Web Crypto API
const MASTER_SALT = 'ssc_notebox_secure_salt_2026_jahidul';

async function computeHash(text: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(text + salt),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 50000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginAttemptsLeft, setLoginAttemptsLeft] = useState<number>(MAX_FAILED_ATTEMPTS);
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  // TOTP 2FA State
  const [totpSecret, setTotpSecret] = useState<string>(() => {
    return localStorage.getItem(TOTP_SECRET_KEY) || '';
  });
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(() => {
    return localStorage.getItem(TOTP_ENABLED_KEY) === 'true';
  });

  // Rate Limiter Check
  const getRateLimitState = useCallback((): { attempts: number; lockUntil: number } => {
    try {
      const saved = localStorage.getItem(RATE_LIMIT_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return { attempts: 0, lockUntil: 0 };
  }, []);

  const updateRateLimitState = useCallback((attempts: number, lockUntil: number) => {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ attempts, lockUntil }));
  }, []);

  // Validate active session on mount & enforce persistent device login (365 days)
  const validateSession = useCallback(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (!raw) {
        setIsOwner(false);
        setLoading(false);
        return;
      }

      const session: AdminSession = JSON.parse(raw);
      const now = Date.now();

      // Check if 1-year session expired
      if (now > session.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        setIsOwner(false);
        setLoading(false);
        return;
      }

      // Update sliding activity timestamp
      session.lastActive = now;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setIsOwner(true);
    } catch {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      setIsOwner(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Track user activity to refresh sliding expiration
  useEffect(() => {
    validateSession();

    const handleUserActivity = () => {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        try {
          const session: AdminSession = JSON.parse(raw);
          session.lastActive = Date.now();
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    // Periodic check every minute
    const interval = setInterval(validateSession, 60000);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      clearInterval(interval);
    };
  }, [validateSession]);

  // Rate limit countdown timer
  useEffect(() => {
    const checkLock = () => {
      const rl = getRateLimitState();
      const now = Date.now();
      if (rl.lockUntil > now) {
        setLockoutRemainingSeconds(Math.ceil((rl.lockUntil - now) / 1000));
        setLoginAttemptsLeft(0);
      } else {
        setLockoutRemainingSeconds(0);
        setLoginAttemptsLeft(Math.max(0, MAX_FAILED_ATTEMPTS - rl.attempts));
      }
    };

    checkLock();
    const timer = setInterval(checkLock, 1000);
    return () => clearInterval(timer);
  }, [getRateLimitState]);

  const logout = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(PENDING_2FA_KEY);
    localStorage.removeItem(VAULT_GATE_KEY);
    sessionStorage.removeItem(VAULT_GATE_KEY);
    setIsOwner(false);
  }, []);

  // ---------------- 2FA SETUP & MANAGEMENT ----------------
  const setup2FA = useCallback(() => {
    let secret = totpSecret;
    if (!secret) {
      secret = generateTotpSecret();
      setTotpSecret(secret);
      localStorage.setItem(TOTP_SECRET_KEY, secret);
    }
    const otpAuthUrl = getOtpAuthUrl(secret, OWNER_CONFIG.email);
    const qrCodeUrl = getQrCodeImageUrl(otpAuthUrl);
    return { secret, otpAuthUrl, qrCodeUrl };
  }, [totpSecret]);

  const enable2FA = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!totpSecret) {
      return { success: false, error: 'কোনো ২FA সিক্রেট কি পাওয়া যায়নি।' };
    }
    const isValid = await verifyTotpCode(totpSecret, code);
    if (!isValid) {
      return { success: false, error: 'ভুল কোড! Google Authenticator অ্যাপের ৬ ডিজিটের কোডটি সঠিক সময়ে দিন।' };
    }
    setIs2FAEnabled(true);
    localStorage.setItem(TOTP_ENABLED_KEY, 'true');
    return { success: true };
  }, [totpSecret]);

  const disable2FA = useCallback(() => {
    setIs2FAEnabled(false);
    localStorage.removeItem(TOTP_ENABLED_KEY);
  }, []);

  // ---------------- LOGIN AS OWNER ----------------
  const loginAsOwner = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; require2FA?: boolean }> => {
    const now = Date.now();
    const rl = getRateLimitState();

    // Check if account is locked out
    if (rl.lockUntil > now) {
      const remainingMinutes = Math.ceil((rl.lockUntil - now) / 60000);
      return {
        success: false,
        error: `অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে। অতিরিক্ত ভুল চেষ্টার কারণে আরও ${remainingMinutes} মিনিট পর চেষ্টা করুন।`
      };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPass = pass.trim();

    // Check email
    const authorizedEmail = OWNER_CONFIG.email.toLowerCase();
    const isEmailValid =
      normalizedEmail === authorizedEmail ||
      normalizedEmail === 'jahidulislamg.b.123@gmail.com' ||
      normalizedEmail === 'admin' ||
      normalizedEmail === 'jahidul';

    // 1. First priority: Real Supabase Cloud Authentication
    let isSupabaseAuthenticated = false;
    let supabaseNotice = '';
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail.includes('@') ? normalizedEmail : 'jahidulislamg.b.123@gmail.com',
          password: normalizedPass
        });
        if (!error && data?.session) {
          isSupabaseAuthenticated = true;
        } else if (error && error.message.includes('Email not confirmed')) {
          supabaseNotice = ' (Supabase ইমেইল কনফার্মেশন অপেক্ষমান)';
        }
      } catch (sbErr: any) {
        console.warn("Supabase Auth error:", sbErr);
      }
    }

    // 2. Fallback cryptographic master hash & direct master password checks
    const inputHash = await computeHash(normalizedPass, MASTER_SALT);
    const expectedMasterHash = await computeHash('admin123', MASTER_SALT);
    const isMasterPasswordValid =
      normalizedPass === 'admin123' ||
      normalizedPass === 'jahidul123' ||
      normalizedPass === '786999' ||
      inputHash === expectedMasterHash;

    const isPasswordValid = isSupabaseAuthenticated || isMasterPasswordValid;

    // If master password is provided, unlock any temporary lockout immediately
    if (isMasterPasswordValid && isEmailValid) {
      updateRateLimitState(0, 0);
    }

    if (!isEmailValid || !isPasswordValid) {
      const newAttempts = rl.attempts + 1;
      let lockUntil = 0;

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        lockUntil = now + LOCKOUT_DURATION_MS;
        updateRateLimitState(newAttempts, lockUntil);

        // Security Alert via Telegram
        telegramService.notifyAdminAccess(`⚠️ ব্যর্থ লগইন প্রচেষ্টা (লকআউট): ${normalizedEmail}`).catch(() => {});

        return {
          success: false,
          error: `ভুল তথ্য! পরপর ৫ বার ভুল চেষ্টার কারণে আপনার লগইন ১৫ মিনিটের জন্য ব্লক করা হলো। ব্যাকআপ পাসওয়ার্ড admin123 ব্যবহার করতে পারেন।`
        };
      }

      updateRateLimitState(newAttempts, 0);
      const remaining = MAX_FAILED_ATTEMPTS - newAttempts;

      // Security Alert via Telegram
      telegramService.notifyAdminAccess(`⚠️ ব্যর্থ লগইন প্রচেষ্টা: ${normalizedEmail} (অবশিষ্ট সুযোগ: ${remaining})`).catch(() => {});

      return {
        success: false,
        error: `ভুল ইমেইল বা পাসওয়ার্ড! আপনার আর ${remaining}টি সুযোগ বাকি আছে।${supabaseNotice} (ব্যাকআপ পাসওয়ার্ড: admin123)`
      };
    }

    // Password verified! Now check 2FA requirement
    // Only require 2FA if the owner has explicitly configured & enabled TOTP 2FA
    if (is2FAEnabled && totpSecret) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const pendingData = {
        otp,
        email: normalizedEmail,
        expiresAt: now + (5 * 60 * 1000) // 5 minutes validity
      };
      sessionStorage.setItem(PENDING_2FA_KEY, JSON.stringify(pendingData));

      // Send backup OTP to Telegram as well
      try {
        telegramService.sendAdmin2FA(otp).catch(() => {});
      } catch {
        // ignore
      }

      return { success: false, require2FA: true };
    }

    // Direct Login (2FA not activated yet - let owner in smoothly!)
    updateRateLimitState(0, 0);
    const token = `adm_${now}_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`;
    const session: AdminSession = {
      email: normalizedEmail,
      token,
      loginTime: now,
      lastActive: now,
      expiresAt: now + PERSISTENT_SESSION_DURATION_MS
    };

    // Store in both localStorage (permanent on device) and sessionStorage
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(VAULT_GATE_KEY, 'true');
    setIsOwner(true);

    telegramService.notifyAdminAccess(`✅ সফল এডমিন লগইন (ডিভাইস পারসিস্টেন্ট সেশন সক্রিয়): ${normalizedEmail}`).catch(() => {});

    return { success: true };
  };

  const verify2FA = async (otpInput: string): Promise<{ success: boolean; error?: string }> => {
    const now = Date.now();
    const cleanInput = otpInput.trim();

    // Emergency Master Backup PIN bypass
    if (cleanInput === '786999' || cleanInput === '123456') {
      sessionStorage.removeItem(PENDING_2FA_KEY);
      updateRateLimitState(0, 0);

      const token = `adm_${now}_${Math.random().toString(36).substring(2, 12)}`;
      const session: AdminSession = {
        email: OWNER_CONFIG.email,
        token,
        loginTime: now,
        lastActive: now,
        expiresAt: now + PERSISTENT_SESSION_DURATION_MS
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      localStorage.setItem(VAULT_GATE_KEY, 'true');
      setIsOwner(true);
      telegramService.notifyAdminAccess(`✅ সফল এডমিন লগইন (মাস্টার ব্যাকআপ পিন ব্যবহার করে): ${OWNER_CONFIG.email}`).catch(() => {});
      return { success: true };
    }

    const raw = sessionStorage.getItem(PENDING_2FA_KEY);
    if (!raw) {
      return { success: false, error: '২FA সেশনের মেয়াদ শেষ হয়েছে বা মাস্টার পিন 786999 দিন।' };
    }

    try {
      const pending = JSON.parse(raw);
      if (now > pending.expiresAt) {
        sessionStorage.removeItem(PENDING_2FA_KEY);
        return { success: false, error: '২FA কোডের মেয়াদ শেষ হয়েছে। মাস্টার পিন 786999 দিন বা পুনরায় চেষ্টা করুন।' };
      }

      // 1. Check Google Authenticator TOTP if configured
      let isTotpValid = false;
      if (totpSecret) {
        isTotpValid = await verifyTotpCode(totpSecret, cleanInput);
      }

      // 2. Check Telegram OTP
      const isTelegramOtpValid = cleanInput === pending.otp;

      // 3. Emergency Master Backup PIN
      const isMasterPinValid = cleanInput === '786999' || cleanInput === '123456';

      if (!isTotpValid && !isTelegramOtpValid && !isMasterPinValid) {
        return { success: false, error: 'ভুল ২FA কোড! Google Authenticator কোড অথবা ব্যাকআপ পিন 786999 দিন।' };
      }

      // 2FA Verified Successfully!
      sessionStorage.removeItem(PENDING_2FA_KEY);
      updateRateLimitState(0, 0);

      // Create secure session token
      const token = `adm_${now}_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`;
      const session: AdminSession = {
        email: pending.email,
        token,
        loginTime: now,
        lastActive: now,
        expiresAt: now + PERSISTENT_SESSION_DURATION_MS
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      localStorage.setItem(VAULT_GATE_KEY, 'true');
      setIsOwner(true);

      // Send successful login security alert to Owner's Telegram
      telegramService.notifyAdminAccess(`✅ সফল এডমিন লগইন (Google Authenticator 2FA ভেরিফাইড): ${pending.email}`).catch(() => {});

      return { success: true };
    } catch {
      return { success: false, error: '২FA যাচাইকরণে সমস্যা হয়েছে।' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isOwner,
        ownerName: OWNER_CONFIG.name,
        ownerEmail: OWNER_CONFIG.email,
        loading,
        loginAttemptsLeft,
        lockoutRemainingSeconds,
        loginAsOwner,
        logout,
        verify2FA,
        totpSecret,
        is2FAEnabled,
        setup2FA,
        enable2FA,
        disable2FA
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
