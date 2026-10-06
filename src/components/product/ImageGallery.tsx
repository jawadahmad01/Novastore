import React, { useState, useEffect, useRef } from "react";
import { Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "@/src/components/common/ImageWithFallback";

interface ImageGalleryProps {
  images: string[];
  productTitle: string;
  variantImage?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  productTitle,
  variantImage,
}) => {
  // If variantImage is provided and not in images, combine them
  const displayImages = React.useMemo(() => {
    if (!images || images.length === 0) {
      return variantImage ? [variantImage] : [];
    }
    if (variantImage && !images.includes(variantImage)) {
      return [variantImage, ...images];
    }
    return images;
  }, [images, variantImage]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Touch swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // If variant image changes, switch to it
  useEffect(() => {
    if (variantImage) {
      const idx = displayImages.indexOf(variantImage);
      if (idx !== -1) {
        setSelectedIndex(idx);
      }
    }
  }, [variantImage, displayImages]);

  // Handle escape key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const activeImage = displayImages[selectedIndex] || displayImages[0] || "";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (displayImages.length <= 1) return;
    setSelectedIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (displayImages.length <= 1) return;
    setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;
    if (diff > minSwipeDistance) {
      // Swiped left -> next
      nextImage();
    } else if (diff < -minSwipeDistance) {
      // Swiped right -> prev
      prevImage();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3 sm:gap-4 w-full">
      {/* Thumbnail Bar (Horizontal on mobile, vertical column on desktop) */}
      {displayImages.length > 1 && (
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pb-1 lg:pb-0 shrink-0 no-scrollbar">
          {displayImages.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`View ${productTitle} image ${idx + 1}`}
                className={`w-14 h-14 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-stone-100 border-2 transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "border-stone-900 shadow-xs ring-1 ring-stone-900"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <ImageWithFallback
                  src={img}
                  alt={`${productTitle} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Large Stage */}
      <div className="flex-1 flex flex-col gap-2">
        <div
          className="relative aspect-square rounded-2xl bg-stone-100 overflow-hidden border border-stone-200/90 shadow-2xs group touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="w-full h-full lg:cursor-crosshair overflow-hidden"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <ImageWithFallback
              src={activeImage}
              alt={productTitle}
              className={`w-full h-full object-cover transition-transform duration-200 ${
                isZoomed ? "lg:scale-150" : "scale-100"
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    }
                  : undefined
              }
            />
          </div>

          {/* Desktop & Mobile Next / Previous Navigation Buttons */}
          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                aria-label="Previous photo"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-transform active:scale-95 z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next photo"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-transform active:scale-95 z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Fullscreen Trigger Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            aria-label="View full size image"
            className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 rounded-xl backdrop-blur-xs shadow-xs border border-stone-200/80 transition-colors z-10"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Image Counter Badge */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-stone-900/80 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs z-10">
              {selectedIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* Mobile Indicator Dots */}
        {displayImages.length > 1 && (
          <div className="flex sm:hidden items-center justify-center gap-1.5 py-1">
            {displayImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  selectedIndex === idx ? "w-6 bg-stone-900" : "w-1.5 bg-stone-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/95 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Product Image Lightbox"
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            aria-label="Close fullscreen view"
            className="absolute top-5 right-5 p-2.5 text-stone-300 hover:text-white rounded-full bg-stone-800/80 hover:bg-stone-800 transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>

          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute left-4 p-3 text-stone-300 hover:text-white rounded-full bg-stone-800/80 hover:bg-stone-800 transition-colors z-20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-4 p-3 text-stone-300 hover:text-white rounded-full bg-stone-800/80 hover:bg-stone-800 transition-colors z-20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={activeImage}
            alt={productTitle}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl select-none"
          />
        </div>
      )}
    </div>
  );
};
