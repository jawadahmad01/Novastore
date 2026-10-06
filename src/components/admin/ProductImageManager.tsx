import React, { useState } from "react";
import { storageService } from "@/src/lib/services/storageService";
import {
  ImagePlus,
  Trash2,
  Star,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface ProductImageManagerProps {
  images: string[];
  thumbnail: string;
  onChange: (images: string[], thumbnail: string) => void;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  images,
  thumbnail,
  onChange,
}) => {
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState("");
  const presets = storageService.getPresetImages();

  const handleAddUrl = () => {
    const clean = urlInput.trim();
    if (!clean) {
      setError("Please enter a valid image URL.");
      return;
    }
    if (!storageService.isValidImageUrl(clean)) {
      setError("URL must start with http:// or https://");
      return;
    }
    if (images.includes(clean)) {
      setError("This image URL has already been added.");
      return;
    }

    const nextImages = [...images, clean];
    const nextThumb = thumbnail || clean;
    onChange(nextImages, nextThumb);
    setUrlInput("");
    setError("");
  };

  const handleRemove = (url: string) => {
    const nextImages = images.filter((img) => img !== url);
    let nextThumb = thumbnail;
    if (thumbnail === url) {
      nextThumb = nextImages.length > 0 ? nextImages[0] : "";
    }
    onChange(nextImages, nextThumb);
  };

  const handleSetThumbnail = (url: string) => {
    onChange(images, url);
  };

  const handleAddPreset = (url: string) => {
    if (!images.includes(url)) {
      const nextImages = [...images, url];
      onChange(nextImages, thumbnail || url);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-stone-900 mb-1">
          Product Gallery & Featured Thumbnail
        </label>
        <p className="text-[11px] text-stone-500">
          Add image URLs or select high-resolution stock photos. Click the star icon to designate the primary catalog thumbnail.
        </p>
      </div>

      {/* URL Input Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="https://images.unsplash.com/... or direct image link"
            className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
        >
          <ImagePlus className="w-4 h-4" />
          <span>Add Image</span>
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}

      {/* Preset Image Chooser */}
      <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-stone-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Quick Stock Presets:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {presets.map((p) => (
            <button
              key={p.url}
              type="button"
              onClick={() => handleAddPreset(p.url)}
              title={p.title}
              className={`shrink-0 w-12 h-12 rounded-xl border overflow-hidden transition-all relative group ${
                images.includes(p.url)
                  ? "border-emerald-500 ring-2 ring-emerald-500/30"
                  : "border-stone-200 hover:border-stone-400"
              }`}
            >
              <img
                src={p.url}
                alt={p.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of added images */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
          {images.map((imgUrl, index) => {
            const isThumb = thumbnail === imgUrl || (index === 0 && !thumbnail);
            return (
              <div
                key={imgUrl}
                className={`relative group rounded-2xl border bg-white overflow-hidden p-1 transition-all ${
                  isThumb
                    ? "border-amber-500 ring-2 ring-amber-500/30 shadow-xs"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative">
                  <img
                    src={imgUrl}
                    alt={`Product gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary Badge */}
                  {isThumb && (
                    <span className="absolute top-1.5 left-1.5 bg-amber-400 text-stone-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <Star className="w-3 h-3 fill-stone-950" />
                      <span>Primary</span>
                    </span>
                  )}

                  {/* Action Overlays */}
                  <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    {!isThumb && (
                      <button
                        type="button"
                        onClick={() => handleSetThumbnail(imgUrl)}
                        className="p-2 bg-white text-stone-900 hover:bg-amber-400 rounded-xl transition-colors text-xs font-bold"
                        title="Set as Main Thumbnail"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(imgUrl)}
                      className="p-2 bg-rose-600 text-white hover:bg-rose-700 rounded-xl transition-colors text-xs"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 border-2 border-dashed border-stone-200 rounded-2xl text-center space-y-1">
          <p className="text-xs text-stone-500">No images added yet.</p>
          <p className="text-[11px] text-stone-400">Add at least one product photo.</p>
        </div>
      )}
    </div>
  );
};

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
