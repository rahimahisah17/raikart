import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Check, Loader2, Settings, ExternalLink, RefreshCw, Copy } from 'lucide-react';
import { getCloudinaryConfig, saveCloudinaryConfig, uploadProductImage } from '../services/cloudinaryService';

export default function CloudinaryUploader({ value, onChange, label = "Product Image" }) {
  const [config, setConfig] = useState(getCloudinaryConfig);
  const [showConfig, setShowConfig] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const { cloudName, apiKey, apiSecret, uploadPreset } = config;

  const handleConfigChange = (key, val) => {
    const updated = { ...config, [key]: val };
    setConfig(updated);
    saveCloudinaryConfig(updated);
  };

  // Load Cloudinary Upload Widget script dynamically
  useEffect(() => {
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadProgress(10);

    try {
      const result = await uploadProductImage(file, {
        onProgress: (percent) => setUploadProgress(percent)
      });

      setUploading(false);
      if (result && result.secureUrl) {
        onChange(result.secureUrl);
        setError(null);
      }
    } catch (err) {
      setUploading(false);
      const errMsg = err.message || "Cloudinary upload failed.";
      setError(`${errMsg} (Falling back to local preview)`);

      // Fallback to Base64/DataURL so user is never blocked
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenWidget = () => {
    if (window.cloudinary) {
      try {
        const myWidget = window.cloudinary.createUploadWidget(
          {
            cloudName: cloudName || 'demo',
            uploadPreset: uploadPreset || 'unsigned_preset',
            sources: ['local', 'url', 'camera', 'unsplash'],
            multiple: false,
            cropping: true,
            defaultSource: 'local',
            styles: {
              palette: {
                window: "#FFFFFF",
                windowBorder: "#909D9D",
                tabIcon: "#000000",
                menuBg: "#F4F6F8",
                link: "#000000",
                action: "#000000",
                activeTab: "#FFFFFF",
                error: "#F44236",
                inProgress: "#0078FF",
                complete: "#20B832",
                sourceBg: "#E4E7EB"
              }
            }
          },
          (err, result) => {
            if (!err && result && result.event === "success") {
              onChange(result.info.secure_url);
            }
          }
        );
        myWidget.open();
      } catch (err) {
        setError("Could not open widget: " + err.message);
      }
    } else {
      setError("Cloudinary Widget script still loading. Please try again in a moment.");
    }
  };

  const copyUrl = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#ffedd5]/30 border border-[#fdba74]/50 rounded-2xl p-4 space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-slate-600" />
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="text-xs font-bold text-slate-600 hover:text-black flex items-center gap-1 bg-[#ffedd5] px-2.5 py-1 rounded-full border border-[#fdba74]/40"
        >
          <Settings className="w-3.5 h-3.5" />
          {showConfig ? 'Hide Settings' : 'Cloudinary Settings'}
        </button>
      </div>

      {/* Cloudinary Settings Drawer */}
      {showConfig && (
        <div className="bg-[#fff2e6] border border-[#fdba74] rounded-xl p-3 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex justify-between items-center border-b border-[#fdba74]/40 pb-2">
            <span className="font-bold text-slate-900">Cloudinary Credentials Config</span>
            <span className="text-[10px] bg-sky-100 text-sky-800 font-extrabold px-2 py-0.5 rounded-full">
              Cloudinary API v1_1
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Cloud Name</label>
              <input
                type="text"
                value={cloudName}
                onChange={(e) => handleConfigChange('cloudName', e.target.value)}
                placeholder="e.g. raikart-cloud"
                className="w-full bg-white border border-[#fdba74]/60 rounded-lg p-2 font-mono text-xs text-black"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Cloudinary API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                placeholder="e.g. 123456789012345"
                className="w-full bg-white border border-[#fdba74]/60 rounded-lg p-2 font-mono text-xs text-black"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Cloudinary Secret Key</label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => handleConfigChange('apiSecret', e.target.value)}
                placeholder="e.g. secret_key_..."
                className="w-full bg-white border border-[#fdba74]/60 rounded-lg p-2 font-mono text-xs text-black"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Upload Preset</label>
              <input
                type="text"
                value={uploadPreset}
                onChange={(e) => handleConfigChange('uploadPreset', e.target.value)}
                placeholder="e.g. unsigned_preset"
                className="w-full bg-white border border-[#fdba74]/60 rounded-lg p-2 font-mono text-xs text-black"
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic">
            Tip: Create an Unsigned Upload Preset in your Cloudinary Dashboard under Settings &rarr; Upload.
          </p>
        </div>
      )}

      {/* Image Preview & URL input */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Thumbnail Preview */}
        <div className="sm:col-span-3 aspect-square bg-[#fed7aa]/40 rounded-xl border border-[#fdba74]/60 overflow-hidden flex items-center justify-center relative group">
          {value ? (
            <>
              <img src={value} alt="Product preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={copyUrl}
                  className="p-1.5 bg-white text-black rounded-full shadow hover:scale-105"
                  title="Copy Image URL"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-white text-black rounded-full shadow hover:scale-105"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </>
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
                disabled={uploading}
                className="hidden"
              />
            </label>

            {/* Cloudinary Widget Button */}
            <button
              type="button"
              onClick={handleOpenWidget}
              className="bg-[#ffedd5] text-black border border-[#fdba74] text-xs font-bold uppercase px-3.5 py-2.5 rounded-full hover:bg-[#fed7aa] transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              <span>Cloudinary Widget</span>
            </button>
          </div>

          {/* URL text field */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Or paste image URL (https://res.cloudinary.com/...)"
              className="w-full bg-white border border-[#fdba74]/60 rounded-xl px-3 py-2 text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Cloudinary Status Indicator */}
          {value && value.includes('cloudinary.com') && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg w-fit">
              <Check className="w-3.5 h-3.5" />
              <span>Hosted on Cloudinary CDN</span>
            </div>
          )}

          {error && (
            <div className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
