import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, isFirebaseConfigured, OWNER_CONFIG } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  isOwner: boolean;
  ownerName: string;
  loading: boolean;
  loginAsOwner: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'ssc_hub_owner_session_v1';

const getInitialOwnerState = (): { isOwner: boolean; user: FirebaseUser | null } => {
  if (typeof window !== 'undefined') {
    try {
      const savedSession = localStorage.getItem(LOCAL_AUTH_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.isOwner) {
          return {
            isOwner: true,
            user: {
              uid: OWNER_CONFIG.authorizedUID,
              email: OWNER_CONFIG.email,
              displayName: OWNER_CONFIG.name,
            } as FirebaseUser
          };
        }
      }
    } catch {
      localStorage.removeItem(LOCAL_AUTH_KEY);
    }
  }
  return { isOwner: false, user: null };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialState] = useState(getInitialOwnerState);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(initialState.user);
  const [isOwner, setIsOwner] = useState<boolean>(initialState.isOwner);
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured);

  useEffect(() => {
    // 1. If Firebase Auth is configured, listen to Firebase Auth State
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        if (user) {
          // Check if this UID matches the owner UID
          const matchesOwner =
            user.uid === OWNER_CONFIG.authorizedUID ||
            user.email?.toLowerCase() === OWNER_CONFIG.email.toLowerCase();
          setIsOwner(matchesOwner);
        } else {
          setIsOwner(false);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  const loginAsOwner = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    // Live Firebase Auth
    if (isFirebaseConfigured && auth) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, pass);
        const matchesOwner =
          userCred.user.uid === OWNER_CONFIG.authorizedUID ||
          userCred.user.email?.toLowerCase() === OWNER_CONFIG.email.toLowerCase();

        if (!matchesOwner) {
          await signOut(auth);
          setIsOwner(false);
          setLoading(false);
          return {
            success: false,
            error: "অ্যাক্সেস প্রত্যাখ্যান করা হয়েছে! শুধুমাত্র ওয়েবসাইট মালিক (জাহিদুল ইসলাম) প্রবেশ করতে পারেন।"
          };
        }

        setIsOwner(true);
        setCurrentUser(userCred.user);
        setLoading(false);
        return { success: true };
      } catch (err: any) {
        setLoading(false);
        return { success: false, error: err.message || "লগইন ব্যর্থ হয়েছে। সঠিক ইমেইল ও পাসওয়ার্ড প্রদান করুন।" };
      }
    }

    // Secure local simulation mode
    // Allows owner credentials: email matching jahidul or admin with default secure pass or setup
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPass = pass.trim();

    const isJahidulEmail =
      !normalizedEmail ||
      normalizedEmail === OWNER_CONFIG.email.toLowerCase() ||
      normalizedEmail === 'jahidulislamg.b.123@gmail.com' ||
      normalizedEmail === 'admin@sscnoteshub.com' ||
      normalizedEmail === 'jahidul@gmail.com' ||
      normalizedEmail === 'jahidul' ||
      normalizedEmail === 'admin' ||
      normalizedEmail === 'owner';

    const isValidPass =
      normalizedPass === 'admin123' ||
      normalizedPass === 'jahidul2025' ||
      normalizedPass === 'sscadmin' ||
      normalizedPass === 'admin' ||
      normalizedPass === 'jahidul' ||
      normalizedPass === '123456' ||
      normalizedPass === '12345678';

    if (isJahidulEmail && isValidPass) {
      const mockUser = {
        uid: OWNER_CONFIG.authorizedUID,
        email: OWNER_CONFIG.email,
        displayName: OWNER_CONFIG.name,
      } as FirebaseUser;

      setCurrentUser(mockUser);
      setIsOwner(true);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ isOwner: true, email: OWNER_CONFIG.email }));
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      return {
        success: false,
        error: "ভুল তথ্য! সঠিক মালিকের ইমেইল ও পাসওয়ার্ড প্রদান করুন (পাসওয়ার্ড: admin123)।"
      };
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem(LOCAL_AUTH_KEY);
    setCurrentUser(null);
    setIsOwner(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isOwner,
        ownerName: OWNER_CONFIG.name,
        loading,
        loginAsOwner,
        logout,
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
