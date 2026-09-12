import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const env = import.meta.env;

// Firebase config is read exclusively from VITE_-prefixed environment variables
// (set in a local, gitignored .env). No credentials are hardcoded, and no
// credential-bearing JSON is committed to the repo.
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  ...(env.VITE_FIREBASE_MEASUREMENT_ID ? { measurementId: env.VITE_FIREBASE_MEASUREMENT_ID } : {}),
};

if (!env.VITE_FIREBASE_API_KEY || !env.VITE_FIREBASE_PROJECT_ID || !env.VITE_FIREBASE_APP_ID) {
  throw new Error(
    'Firebase is not configured. Copy .env.example to .env and fill in the VITE_FIREBASE_* values.'
  );
}

const app = initializeApp(firebaseConfig);

// Clear any stale "pending redirect" state left in sessionStorage by a previous
// signInWithRedirect attempt. We now use Google Identity Services (GIS) + 
// signInWithCredential, which needs no redirect handshake. Without this cleanup,
// the auth SDK would try to complete the stale redirect on init and hang.
try {
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith('firebase:pendingRedirect')) {
      sessionStorage.removeItem(key);
    }
  });
} catch (e) {
  // Ignore — sessionStorage may be unavailable in some environments.
}

// Firebase is used for authentication only. Firestore was intentionally removed
// (dummy catalog + localStorage are the source of truth until PostgreSQL).
export const auth = getAuth(app);
