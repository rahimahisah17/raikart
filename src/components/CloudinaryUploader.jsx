import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Check, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { auth } from '../firebase';
import {
  getMediaConfig,
  requestUploadSignature,
  uploadImageToCloudinary,
  destroyImage,
  extractPublicIdFromUrl,
} from '../services/cloudinaryService';

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export default function CloudinaryUploader({ value, onChange, label = 'Product Image' }) {
  const [configured, setConfigured] = useState(false);
  const [cloudName, setCloudName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load media config on mount (never blocks the rest of the app).
  useEffect(() => {
    let active = true;
    getMediaConfig().then((cfg) => {
      if (!active) return;
      setConfigured(Boolean(cfg.configured));
      setCloudName(cfg.cloudName || '');
    });
    return () => {
      active = false;
    };
  }, []);

  const getIdToken = async () => {
    if (!auth.currentUser) throw new Error('You must be signed in to upload images.');
    return auth.currentUser.getIdToken();
  };

  const validateFile = (file) => {
    if (!file) return 'No file selected.';
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Unsupported file type. Please choose a JPEG, PNG, WebP, GIF or AVIF image.';
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `Image is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFileUpload = async (file) => {
    setError(null);
    setSuccess(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const token = await getIdToken();
      const signature = await requestUploadSignature(token);
      const result = await uploadImageToCloudinary(file, signature, (percent) => setUploadProgress(percent));

      // Best-effort: remove the previous Cloudinary asset when replacing.
      const previousId = extractPublicIdFromUrl(value);
      if (previousId && previousId !== result.publicId) {
        try {
          await destroyImage(previousId, token);
        } catch (err) {
          console.warn('Could not remove previous image:', err.message || err);
        }
      }

      onChange(result.secureUrl);
      setSuccess('Image uploaded to Cloudinary.');
    } catch (err) {
      setError(err.message || 'Cloudinary upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setError(null);
    setSuccess(null);

    const id = extractPublicIdFromUrl(value);
    if (id) {
      try {
        const token = await getIdToken();
        await destroyImage(id, token);
      } catch (err) {
        setError('Could not delete the Cloudinary asset: ' + (err.message || err));
        return;
      }
    }
    onChange('');
    setSuccess('Image removed.');
  };

  const isCloudinaryImage = Boolean(value && value.includes('cloudinary.com'));

  return (
    <div className="bg-[#ffedd5]/30 border border-[#fdba74]/50 rounded-2xl p-4 space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-slate-600" />
          {label}
        </label>
        {configured ? (
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-1 rounded-full border border-emerald-200">
            Cloudinary connected
          </span>
        ) : (
          <span className="text-[10px] bg-slate-100 text-slate-500 font-extrabold px-2.5 py-1 rounded-full border border-slate-200">
            Cloudinary not configured
          </span>
        )}
      </div>

      {/* Image Preview & URL input */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Thumbnail Preview */}
        <div className="sm:col-span-3 aspect-square bg-[#fed7aa]/40 rounded-xl border border-[#fdba74]/60 overflow-hidden flex items-center justify-center relative">
          {value ? (
            <img src={value} alt="Product preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-2 text-slate-400">
              <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
              <span className="text-[10px] font-bold uppercase">No Image</span>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="sm:col-span-9 space-y-3">
          <div className="flex flex-wrap gap-2">
            {/* Direct File Input Button */}
            <label className="cursor-pointer bg-black text-white text-xs font-extrabold uppercase tracking-wider px-4 py-2.5 rounded-full hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload To Cloudinary</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                disabled={uploading || !configured}
                className="hidden"
              />
            </label>

            {value && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-full flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Image</span>
              </button>
            )}
          </div>

          {/* Manual URL override */}
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste image URL (https://res.cloudinary.com/...)"
            className="w-full bg-white border border-[#fdba74]/60 rounded-xl px-3 py-2 text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black"
          />

          {isCloudinaryImage && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg w-fit">
              <Check className="w-3.5 h-3.5" />
              <span>Hosted on Cloudinary CDN</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg w-fit">
              <Check className="w-3.5 h-3.5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
