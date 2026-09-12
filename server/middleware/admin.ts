import { createPublicKey, verify } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/**
 * Admin authentication for the media server.
 *
 * Verifies a Firebase ID token against Google's public keys (no firebase-admin
 * dependency required), then checks the token's email against an allowlist
 * provided via the ADMIN_EMAILS environment variable.
 */

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'rahimahisah17@gmail.com')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'primordial-robot-xc9s2';
const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const CERT_TTL_MS = 60 * 60 * 1000;

let certsCache: Record<string, string> | null = null;
let certsFetchedAt = 0;

async function fetchGoogleCerts(): Promise<Record<string, string>> {
  if (certsCache && Date.now() - certsFetchedAt < CERT_TTL_MS) return certsCache;
  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error('Failed to fetch Firebase public certificates');
  certsCache = (await res.json()) as Record<string, string>;
  certsFetchedAt = Date.now();
  return certsCache;
}

interface DecodedToken {
  header: { alg?: string; kid?: string };
  payload: {
    iss?: string;
    aud?: string;
    exp?: number;
    sub?: string;
    email?: string;
  };
}

function decodeToken(token: string): DecodedToken {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed token');
  try {
    return {
      header: JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')),
      payload: JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')),
    };
  } catch {
    throw new Error('Malformed token payload');
  }
}

export async function verifyAdminToken(token: string) {
  const { header, payload } = decodeToken(token);

  if (header.alg !== 'RS256' || !header.kid) throw new Error('Unsupported token algorithm');
  const certs = await fetchGoogleCerts();
  const cert = certs[header.kid];
  if (!cert) throw new Error('Unknown signing key');

  const parts = token.split('.');
  const signed = Buffer.from(`${parts[0]}.${parts[1]}`);
  const signature = Buffer.from(parts[2], 'base64url');
  const key = createPublicKey(cert);
  if (!verify('RSA-SHA256', signed, key, signature)) throw new Error('Invalid token signature');

  if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`) throw new Error('Invalid token issuer');
  if (payload.aud !== PROJECT_ID) throw new Error('Invalid token audience');
  if (!payload.exp || payload.exp * 1000 <= Date.now()) throw new Error('Token expired');

  const email = (payload.email || '').toLowerCase();
  if (!email || !ADMIN_EMAILS.includes(email)) throw new Error('Not authorized');

  return { uid: payload.sub || '', email };
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const admin = await verifyAdminToken(token);
    res.locals.admin = admin;
    next();
  } catch (err) {
    res.status(403).json({ error: err instanceof Error ? err.message : 'Forbidden' });
  }
}
