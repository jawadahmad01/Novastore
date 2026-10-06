import React, { useState } from "react";
import { Package, ImageOff } from "lucide-react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  category?: string;
  altText?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = "Product Image",
  className = "",
  category,
  fallbackSrc,
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error || !src) {
    if (fallbackSrc && !error) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          onError={() => setError(true)}
          {...props}
        />
      );
    }

    return (
      <div
        className={`w-full h-full bg-stone-100 flex flex-col items-center justify-center p-3 text-stone-400 select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <Package className="w-8 h-8 stroke-[1.3] text-stone-400 mb-1" />
        <span className="text-[11px] font-medium text-stone-500 text-center line-clamp-1 px-2">
          {category || "Product Image"}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-100">
      {loading && (
        <div className="absolute inset-0 bg-stone-200/60 animate-pulse z-0" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        {...props}
      />
    </div>
  );
};
