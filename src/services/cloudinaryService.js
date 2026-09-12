/**
 * Media Service for Raikart — Cloudinary integration.
 *
 * All Cloudinary credentials live server-side only (see /server/media).
 * The browser never sees the API secret. This module talks to the backend
 * media endpoints, which sign uploads and destroy assets.
 *
 * Kept deliberately decoupled from product data so the same service works
 * unchanged when product data moves from Firestore to PostgreSQL.
 */

const MEDIA_API = '/api/media';

async function request(path, options = {}) {
  let data = {};
  let res;
  try {
    res = await fetch(`${MEDIA_API}${path}`, options);
    data = await res.json().catch(() => ({}));
  } catch (err) {
    // Backend unreachable — surface a clear error so callers can degrade.
    throw new Error('Media server unavailable');
  }
  if (!res.ok) {
    throw new Error(data.error || `Media API error (HTTP ${res.status})`);
  }
  return data;
}

/**
 * Fetch media configuration. Never throws on failure — returns
 * `configured: false` so the rest of the app keeps working when Cloudinary
 * is not set up.
 */
export async function getMediaConfig() {
  try {
    return await request('/config');
  } catch (err) {
    return { configured: false, cloudName: '', apiKey: '' };
  }
}

/**
 * Request a short-lived signed upload from the backend (admin only).
 * @param {string} token Firebase ID token for the signed-in admin.
 */
export function requestUploadSignature(token) {
  return request('/sign', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

/**
 * Ask the backend to destroy a Cloudinary asset (admin only).
 * @param {string} publicId
 * @param {string} token
 */
export function destroyImage(publicId, token) {
  return request('/destroy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ publicId }),
  });
}

/**
 * Upload a file straight to Cloudinary using a backend-issued signature.
 * @param {File | Blob} file
 * @param {Object} signature result of requestUploadSignature
 * @param {(percent: number) => void} [onProgress]
 * @returns {Promise<{ secureUrl: string, publicId: string, raw: object }>}
 */
export function uploadImageToCloudinary(file, signature, onProgress) {
  if (!file) throw new Error('No image file provided for Cloudinary upload.');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', signature.timestamp);
  formData.append('folder', signature.folder);
  formData.append('public_id', signature.publicId);
  formData.append('signature', signature.signature);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`);

    if (typeof onProgress === 'function') {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url) {
            resolve({
              secureUrl: data.secure_url,
              publicId: data.public_id,
              width: data.width,
              height: data.height,
              format: data.format,
              raw: data,
            });
          } else {
            reject(new Error('Cloudinary response missing secure_url.'));
          }
        } catch (err) {
          reject(new Error('Invalid JSON response from Cloudinary.'));
        }
      } else {
        let message = `Cloudinary upload failed (HTTP ${xhr.status})`;
        try {
          const errData = JSON.parse(xhr.responseText);
          if (errData?.error?.message) message = `Cloudinary Error: ${errData.error.message}`;
        } catch (err) {
          // ignore
        }
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error('Network error contacting Cloudinary.'));
    xhr.send(formData);
  });
}

/**
 * Derive a Cloudinary public_id from a stored secure URL.
 * Returns null when the URL is not a Cloudinary upload URL.
 */
export function extractPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return null;
  try {
    const match = url.match(/\/image\/upload\/(?:v\d+\/)?(.+?)\.\w+$/);
    if (!match) return null;
    return decodeURIComponent(match[1]);
  } catch (err) {
    return null;
  }
}
