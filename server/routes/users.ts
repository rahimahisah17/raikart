import { Router } from 'express';
import type { UserRecord } from 'firebase-admin/auth';
import { getAdminAuth } from '../services/firebaseAdmin';
import { requireAdmin } from '../middleware/admin';

/**
 * Admin user-management API.
 *
 * All routes are protected by requireAdmin (Firebase ID token + ADMIN_EMAILS
 * allowlist). Users are read/managed directly from Firebase Authentication via
 * the Admin SDK — no Firestore, no mock data, no localStorage.
 */

const router = Router();

// Every route below requires an authenticated admin.
router.use(requireAdmin);

interface AdminUser {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: string;
  lastSignInAt: string;
  emailVerified: boolean;
  provider: string;
  disabled: boolean;
}

function serializeUser(u: UserRecord): AdminUser {
  const providers = (u.providerData || [])
    .map((p) => p.providerId)
    .filter((id): id is string => Boolean(id));
  const provider = providers.join(', ') || (u.providerData?.[0]?.providerId ?? '');
  return {
    uid: u.uid,
    name: u.displayName || '',
    email: u.email || '',
    photoURL: u.photoURL || '',
    createdAt: u.metadata.creationTime || '',
    lastSignInAt: u.metadata.lastSignInTime || '',
    emailVerified: Boolean(u.emailVerified),
    provider,
    disabled: Boolean(u.disabled),
  };
}

function sdkError(err: unknown): { status: number; error: string } {
  const message = err instanceof Error ? err.message : String(err);
  // A misconfigured SDK should surface as 503 (not found/user error).
  if (message.includes('not configured') || message.includes('service account')) {
    return { status: 503, error: message };
  }
  return { status: 502, error: message };
}

// GET /api/admin/users — list all Firebase Auth users (paginates internally).
router.get('/', async (_req, res) => {
  try {
    const auth = getAdminAuth();
    const users: AdminUser[] = [];
    let pageToken: string | undefined;
    do {
      const result = await auth.listUsers(1000, pageToken);
      users.push(...result.users.map(serializeUser));
      pageToken = result.pageToken;
    } while (pageToken);

    // Newest signups first.
    users.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    res.json({ users, total: users.length });
  } catch (err) {
    const { status, error } = sdkError(err);
    res.status(status).json({ error });
  }
});

// GET /api/admin/users/:uid — fetch a single user's details.
router.get('/:uid', async (req, res) => {
  try {
    const auth = getAdminAuth();
    const user = await auth.getUser(req.params.uid);
    res.json({ user: serializeUser(user) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(404).json({ error: message });
  }
});

// POST /api/admin/users/:uid/status — enable (disabled=false) / disable (disabled=true).
router.post('/:uid/status', async (req, res) => {
  const { disabled } = req.body || {};
  if (typeof disabled !== 'boolean') {
    res.status(400).json({ error: 'disabled (boolean) is required' });
    return;
  }
  try {
    const auth = getAdminAuth();
    const admin = res.locals.admin as { uid?: string } | undefined;
    if (disabled && admin && admin.uid === req.params.uid) {
      res.status(400).json({ error: 'You cannot disable your own account' });
      return;
    }
    const user = await auth.updateUser(req.params.uid, { disabled });
    res.json({ user: serializeUser(user) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(404).json({ error: message });
  }
});

// DELETE /api/admin/users/:uid — permanently delete a user (with self-delete guard).
router.delete('/:uid', async (req, res) => {
  try {
    const auth = getAdminAuth();
    const admin = res.locals.admin as { uid?: string } | undefined;
    if (admin && admin.uid === req.params.uid) {
      res.status(400).json({ error: 'You cannot delete your own account' });
      return;
    }
    await auth.deleteUser(req.params.uid);
    res.json({ ok: true, uid: req.params.uid });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(404).json({ error: message });
  }
});

export default router;
