/**
 * Cloudinary API Service for Raikart Product Image Uploads
 * Handles configuration, credentials persistence, and secure URL image uploading.
 */

const STORAGE_KEYS = {
  CLOUD_NAME: 'raikart_cloudinary_cloud_name',
  API_KEY: 'raikart_cloudinary_api_key',
  API_SECRET: 'raikart_cloudinary_api_secret',
  PRESET: 'raikart_cloudinary_preset'
};

/**
 * Get active Cloudinary configuration parameters from localStorage or environment variables.
 */
export function getCloudinaryConfig() {
  const cloudName = localStorage.getItem(STORAGE_KEYS.CLOUD_NAME) || 
                    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 
                    'demo';

  const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || 
                 import.meta.env.VITE_CLOUDINARY_API_KEY || 
                 '';

  const apiSecret = localStorage.getItem(STORAGE_KEYS.API_SECRET) || 
                    import.meta.env.VITE_CLOUDINARY_API_SECRET || 
                    '';

  const uploadPreset = localStorage.getItem(STORAGE_KEYS.PRESET) || 
                       import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 
                       'unsigned_preset';

  return { cloudName, apiKey, apiSecret, uploadPreset };
}

/**
 * Update and persist Cloudinary credentials to localStorage.
 */
export function saveCloudinaryConfig(config) {
  if (config.cloudName !== undefined) localStorage.setItem(STORAGE_KEYS.CLOUD_NAME, config.cloudName.trim());
  if (config.apiKey !== undefined) localStorage.setItem(STORAGE_KEYS.API_KEY, config.apiKey.trim());
  if (config.apiSecret !== undefined) localStorage.setItem(STORAGE_KEYS.API_SECRET, config.apiSecret.trim());
  if (config.uploadPreset !== undefined) localStorage.setItem(STORAGE_KEYS.PRESET, config.uploadPreset.trim());
}

/**
 * Upload a product image file to Cloudinary API and return a secure HTTPS URL.
 * @param {File | Blob | string} file - File object or Base64/URL string to upload
 * @param {Object} options - Additional upload options (folder, tags, onProgress)
 * @returns {Promise<{ secureUrl: string, publicId: string, raw: object }>}
 */
export async function uploadProductImage(file, options = {}) {
  const config = getCloudinaryConfig();
  const cloudName = config.cloudName || 'demo';
  const uploadPreset = config.uploadPreset || 'unsigned_preset';
  const folder = options.folder || 'raikart/products';

  if (!file) {
    throw new Error('No image file provided for Cloudinary upload.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  if (config.apiKey) {
    formData.append('api_key', config.apiKey);
  }

  if (options.tags && Array.isArray(options.tags)) {
    formData.append('tags', options.tags.join(','));
  }

  const uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadEndpoint);

    if (options.onProgress && typeof options.onProgress === 'function') {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          options.onProgress(percent);
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
              raw: data
            });
          } else {
            reject(new Error('Cloudinary response missing secure_url property.'));
          }
        } catch (e) {
          reject(new Error('Invalid JSON response from Cloudinary API.'));
        }
      } else {
        let errorMessage = `Cloudinary API error (HTTP ${xhr.status})`;
        try {
          const errData = JSON.parse(xhr.responseText);
          if (errData.error && errData.error.message) {
            errorMessage = `Cloudinary Error: ${errData.error.message}`;
          }
        } catch (e) {
          // Ignore JSON parse error
        }
        reject(new Error(errorMessage));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error attempting to reach Cloudinary API endpoints.'));
    };

    xhr.send(formData);
  });
}
