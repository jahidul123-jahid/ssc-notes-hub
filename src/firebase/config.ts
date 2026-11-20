import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Check if credentials are properly set up
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== "YOUR_API_KEY"
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("🔥 Firebase backend successfully initialized for SSC Notes Hub.");
  } catch (error) {
    console.warn("⚠️ Firebase initialization error. Falling back to local dynamic store:", error);
  }
} else {
  console.log("ℹ️ SSC Notes Hub running in local simulation & offline-ready mode. Configure .env to connect live Firebase.");
}

// Authorized Owner Configuration
export const OWNER_CONFIG = {
  name: "Jahidul Islam",
  authorizedUID: import.meta.env.VITE_OWNER_UID || "OWNER_JAHIDUL_ISLAM_UID",
  email: import.meta.env.VITE_OWNER_EMAIL || "jahidulislamg.b.123@gmail.com",
};

export { app, auth, db, storage, firebaseConfig };
