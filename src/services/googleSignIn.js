// Google Identity Services (GIS) — used for Google sign-in instead of Firebase's
// popup/redirect flows. Firebase's popup/redirect flows depend on a cross-origin
// gapi iframe (firebaseapp.com/__/auth/iframe) that can be blocked by third-party
// cookie restrictions, ad blockers, or embedded browsers, which makes sign-in
// hang forever. GIS returns an ID token directly via a callback with no iframe
// dependency, so it is far more reliable.

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let scriptPromise = null;

/**
 * Loads the Google Identity Services script exactly once and resolves with the
 * `google.accounts` object (which exposes `google.accounts.id`).
 */
export function loadGoogleIdentityServices() {
  if (!GOOGLE_CLIENT_ID) {
    return Promise.reject(
      new Error('Google Sign-In is not configured (missing VITE_GOOGLE_CLIENT_ID).')
    );
  }

  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google.accounts);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google.accounts);
      } else {
        reject(new Error('Google Sign-In failed to initialize.'));
      }
    };
    script.onerror = () => reject(new Error('Could not load Google Sign-In.'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}
