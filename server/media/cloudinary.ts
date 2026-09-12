import { createHash, randomBytes } from 'node:crypto';

/**
 * Cloudinary media service (server-side only).
 *
 * All credentials are read from backend environment variables:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *
 * The API secret never leaves the server. This module signs uploads and
 * destroys assets, and is deliberately decoupled from product data so it
 * keeps working unchanged when product data moves from Firestore to
 * PostgreSQL.
 */

export interface CloudinaryCredentials {
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
}

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function getCloudinaryCredentials(): CloudinaryCredentials {
  return {
    cloudName: env('CLOUDINARY_CLOUD_NAME'),
    apiKey: env('CLOUDINARY_API_KEY'),
    apiSecret: env('CLOUDINARY_API_SECRET'),
  };
}

export function isConfigured(): boolean {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
  return Boolean(cloudName && apiKey && apiSecret);
}

/**
 * Cloudinary signature = SHA1 of all parameters (sorted by key, joined as
 * `key=value&`) followed by the API secret.
 */
function sign(params: Record<string, string>, apiSecret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(sorted + apiSecret).digest('hex');
}

export interface UploadSignature {
  signature: string;
  timestamp: string;
  cloudName: string;
  apiKey: string;
  folder: string;
  publicId: string;
}

export function createUploadSignature(folder = 'raikart/products'): UploadSignature {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured');
  }
  const timestamp = String(Math.floor(Date.now() / 1000));
  const publicId = `raikart_${Date.now()}_${randomBytes(4).toString('hex')}`;
  const signature = sign({ folder, public_id: publicId, timestamp }, apiSecret);
  return { signature, timestamp, cloudName, apiKey, folder, publicId };
}

export interface DestroyResult {
  result?: string;
  [key: string]: unknown;
}

/**
 * Destroy an asset server-side using Basic auth (api key + secret).
 * Keeps the secret out of the browser entirely.
 */
export async function destroyCloudinaryImage(publicId: string): Promise<DestroyResult> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured');
  }
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ public_id: publicId }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Cloudinary destroy failed (HTTP ${res.status})`);
  }
  return (await res.json()) as DestroyResult;
}
