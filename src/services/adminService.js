/**
 * Admin user-management service — talks to the backend Admin SDK endpoints.
 *
 * The backend enforces authorization (Firebase ID token + ADMIN_EMAILS
 * allowlist) and uses the Firebase Admin SDK to read/manage real Firebase
 * Authentication users. No Firestore, no mock users, no localStorage.
 */

import { auth } from '../firebase';

const ADMIN_API = '/api/admin';

async function currentToken() {
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken();
}

async function request(path, options = {}) {
  const token = await currentToken();
  let data = {};
  let res;
  try {
    res = await fetch(`${ADMIN_API}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    data = await res.json().catch(() => ({}));
  } catch (err) {
    throw new Error('Admin server unavailable');
  }
  if (!res.ok) {
    throw new Error(data.error || `Admin API error (HTTP ${res.status})`);
  }
  return data;
}

/** List all Firebase Auth users. Returns { users, total }. */
export function listUsers() {
  return request('/users');
}

/** Fetch a single user's details. */
export function getUser(uid) {
  return request(`/users/${uid}`);
}

/** Enable (disabled=false) or disable (disabled=true) a user. */
export function setUserStatus(uid, disabled) {
  return request(`/users/${uid}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ disabled }),
  });
}

/** Permanently delete a user. */
export function deleteUser(uid) {
  return request(`/users/${uid}`, { method: 'DELETE' });
}
