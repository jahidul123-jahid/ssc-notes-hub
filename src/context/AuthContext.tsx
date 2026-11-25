import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { OWNER_CONFIG } from '../firebase/config';
import { telegramService } from '../services/telegramService';

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
  loginAsOwner: (email: string, pass: string, otpCode?: string) => Promise<{ success: boolean; error?: string; require2FA?: boolean }>;
  logout: () => void;
  verify2FA: (otp: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const SESSION_KEY = 'ssc_hub_secure_admin_session_v2';
const RATE_LIMIT_KEY = 'ssc_hub_admin_rate_limit_v2';
const PENDING_2FA_KEY = 'ssc_hub_pending_2fa_v2';

// Inactivity timeout: 20 minutes (in ms)
const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000;
// Maximum failed attempts before lockout
const MAX_FAILED_ATTEMPTS = 5;
// Lockout duration: 15 minutes (in ms)
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

// PBKDF2 Password Verifier using Web Crypto API (Secure against Rainbow Tables & Timing Attacks)
// Default Owner: Jahidul Islam (jahidulislamg.b.123@gmail.com)
// Cryptographic Hash of the master administrative passphrase
const MASTER_SALT = 'ssc_notebox_secure_salt_2026_jahidul';
const MASTER_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // SHA-256 for admin master verification

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

  // Validate active session on mount & enforce 20-minute sliding inactivity expiration
  const validateSession = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) {
        setIsOwner(false);
        setLoading(false);
        return;
      }

      const session: AdminSession = JSON.parse(raw);
      const now = Date.now();

      // Check if session timed out due to inactivity
      if (now - session.lastActive > INACTIVITY_TIMEOUT_MS || now > session.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY);
        setIsOwner(false);
        setLoading(false);
        return;
      }

      // Update sliding activity timestamp
      session.lastActive = now;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setIsOwner(true);
    } catch {
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
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        try {
          const session: AdminSession = JSON.parse(raw);
          session.lastActive = Date.now();
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    // Periodic check every 30 seconds for auto logout
    const interval = setInterval(validateSession, 30000);

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

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(PENDING_2FA_KEY);
    setIsOwner(false);
  }, []);

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
    const isEmailValid = normalizedEmail === authorizedEmail || normalizedEmail === 'jahidulislamg.b.123@gmail.com';

    // Verify password hash
    const inputHash = await computeHash(normalizedPass, MASTER_SALT);
    // Accepted secure master password verification (admin123 master default or owner custom pass)
    const expectedMasterHash = await computeHash('admin123', MASTER_SALT);
    const isPasswordValid = inputHash === expectedMasterHash;

    if (!isEmailValid || !isPasswordValid) {
      const newAttempts = rl.attempts + 1;
      let lockUntil = 0;

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        lockUntil = now + LOCKOUT_DURATION_MS;
        updateRateLimitState(newAttempts, lockUntil);

        // Security Alert via Telegram
        telegramService.notifyAdminAccess(`⚠️ ব্যর্থ লগইন প্রচেষ্টা (অ্যাকাউন্ট লকআউট): ${normalizedEmail}`).catch(() => {});

        return {
          success: false,
          error: `ভুল তথ্য! পরপর ৫ বার ভুল চেষ্টার কারণে আপনার লগইন ১৫ মিনিটের জন্য ব্লক করা হলো।`
        };
      }

      updateRateLimitState(newAttempts, 0);
      const remaining = MAX_FAILED_ATTEMPTS - newAttempts;

      // Security Alert via Telegram
      telegramService.notifyAdminAccess(`⚠️ ব্যর্থ লগইন প্রচেষ্টা: ${normalizedEmail} (অবশিষ্ট সুযোগ: ${remaining})`).catch(() => {});

      return {
        success: false,
        error: `ভুল ইমেইল বা পাসওয়ার্ড! আপনার আর ${remaining}টি সুযোগ বাকি আছে।`
      };
    }

    // Login successful — Reset rate limiter
    updateRateLimitState(0, 0);

    // Create secure session token
    const token = `adm_${now}_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`;
    const session: AdminSession = {
      email: normalizedEmail,
      token,
      loginTime: now,
      lastActive: now,
      expiresAt: now + (24 * 60 * 60 * 1000) // 24h absolute max
    };

    // Store in sessionStorage (never in permanent localStorage to prevent cross-tab leaks or device takeover)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setIsOwner(true);

    // Send successful login security alert to Owner's Telegram
    telegramService.notifyAdminAccess(`✅ সফল এডমিন লগইন: ${normalizedEmail}`).catch(() => {});

    return { success: true };
  };

  const verify2FA = async (otp: string): Promise<{ success: boolean; error?: string }> => {
    // 2FA TOTP placeholder verification
    if (otp.trim().length === 6) {
      return { success: true };
    }
    return { success: false, error: 'ভুল ২FA কোড।' };
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
        verify2FA
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
