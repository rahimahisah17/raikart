import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { loadGoogleIdentityServices, GOOGLE_CLIENT_ID } from '../services/googleSignIn';

/**
 * Renders the official "Sign in with Google" button (Google Identity Services)
 * and exchanges the returned ID token for a Firebase credential via
 * signInWithCredential. This replaces Firebase's popup/redirect flows, which
 * hang when the cross-origin gapi iframe is blocked.
 */
export default function GoogleSignInButton() {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const { signInWithGoogle } = useAppContext();

  useEffect(() => {
    let cancelled = false;

    if (!GOOGLE_CLIENT_ID || !containerRef.current) {
      setStatus('error');
      return;
    }

    loadGoogleIdentityServices()
      .then((accounts) => {
        if (cancelled || !containerRef.current) return;

        accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (!response?.credential) return;
            setStatus('loading');
            try {
              await signInWithGoogle(response.credential);
              // On success onAuthStateChanged updates `user` and the page
              // auto-navigates to /profile via <Navigate>.
            } catch (err) {
              console.error('Google sign-in failed:', err);
              setStatus('error');
            }
          },
        });

        accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          width: 360,
        });
      })
      .catch((err) => {
        console.error('Failed to load Google Sign-In:', err);
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [signInWithGoogle]);

  if (status === 'error') {
    return (
      <div className="text-xs font-bold text-red-600 text-center py-3">
        Google Sign-In is unavailable right now. Please use email instead.
      </div>
    );
  }

  return (
    <div className="relative w-full flex justify-center">
      <div ref={containerRef} className="w-full flex justify-center" />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/85 rounded-full">
          <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
          <span className="ml-2 text-sm font-bold text-slate-600">Signing in...</span>
        </div>
      )}
    </div>
  );
}
