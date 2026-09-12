import { readFileSync, existsSync } from 'node:fs';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { App, ServiceAccount } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';

/**
 * Firebase Admin SDK bootstrap (server-side only).
 *
 * The Admin SDK is used exclusively for Firebase Authentication user
 * management (list, fetch, enable/disable, delete). It is NOT used for
 * Firestore — there is no Firestore/PostgreSQL layer in this project yet.
 *
 * Credentials are loaded from a service account so the server can act on
 * behalf of the Firebase project with elevated (server) privileges:
 *
 *   FIREBASE_SERVICE_ACCOUNT     — inline JSON of the service account key.
 *   GOOGLE_APPLICATION_CREDENTIALS — path to a service account JSON file.
 *
 * Generate a key at: Firebase Console → Project settings → Service accounts
 * → "Generate new private key". The key never leaves the server.
 */

const PROJECT_ID = (process.env.FIREBASE_PROJECT_ID || 'raikart-3ec79').trim();

let adminApp: App | undefined;
let adminAuth: Auth | undefined;
let initError = '';

function readServiceAccount(): ServiceAccount | null {
  // 1. Inline service account JSON string.
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (inline) {
    try {
      return JSON.parse(inline) as ServiceAccount;
    } catch {
      initError = 'FIREBASE_SERVICE_ACCOUNT is not valid JSON';
      return null;
    }
  }

  // 2. Path to a service account JSON file.
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (credPath) {
    try {
      if (!existsSync(credPath)) {
        initError = `Service account file not found: ${credPath}`;
        return null;
      }
      return JSON.parse(readFileSync(credPath, 'utf8')) as ServiceAccount;
    } catch (e) {
      initError = `Failed to read service account: ${e instanceof Error ? e.message : String(e)}`;
      return null;
    }
  }

  initError =
    'Firebase Admin SDK is not configured. Set FIREBASE_SERVICE_ACCOUNT (inline JSON) ' +
    'or GOOGLE_APPLICATION_CREDENTIALS (path to a service account JSON) in the server .env.';
  return null;
}

function ensureInitialized(): Auth {
  if (adminAuth) return adminAuth;

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0];
    adminAuth = getAuth(adminApp);
    return adminAuth;
  }

  const serviceAccount = readServiceAccount();
  if (!serviceAccount) {
    throw new Error(initError);
  }

  adminApp = initializeApp({
    projectId: PROJECT_ID,
    credential: cert({ projectId: PROJECT_ID, ...serviceAccount }),
  });
  adminAuth = getAuth(adminApp);
  return adminAuth;
}

/**
 * Returns the initialized Admin Auth instance, or throws a descriptive error
 * if the SDK could not be configured. Callers surface this as HTTP 503.
 */
export function getAdminAuth(): Auth {
  return ensureInitialized();
}
