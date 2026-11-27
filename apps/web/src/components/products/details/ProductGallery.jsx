"use client";

import { useState, useRef, useEffect } from "react";
import {
  Package,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  LoaderCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export default function ProductGallery({
  productImages = [],
  productName = "Product",
  selectedImage,
  setSelectedImage,
  discountPercentage = 0,
  onWishlist,
  isInWishlist = false,
  wishlistIsMutating = false,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartX = useRef(null);

  const images = Array.from(
    new Set(
      (Array.isArray(productImages) ? productImages : []).filter(
        (image) => typeof image === "string" && image.trim() !== ""
      )
    )
  );

  const safeSelectedImage = images.includes(selectedImage)
    ? selectedImage
    : images[0] || null;

  const currentIndex = safeSelectedImage
    ? images.indexOf(safeSelectedImage)
    : 0;

  const totalImages = images.length;

  useEffect(() => {
    if (!images.length) {
      if (selectedImage !== null) {
        setSelectedImage?.(null);
      }
      return;
    }

    if (!images.includes(selectedImage)) {
      setSelectedImage?.(images[0]);
    }
  }, [images, selectedImage, setSelectedImage]);

  useEffect(() => {
    setIsZoomed(false);
  }, [safeSelectedImage]);

  const showNext = () => {
    if (totalImages <= 1) return;
    const nextIndex = (currentIndex + 1) % totalImages;
    setSelectedImage?.(images[nextIndex]);
  };

  const showPrevious = () => {
    if (totalImages <= 1) return;
    const previousIndex = (currentIndex - 1 + totalImages) % totalImages;
    setSelectedImage?.(images[previousIndex]);
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const touchEndX = event.changedTouches[0].clientX;
    const difference = touchStartX.current - touchEndX;
    if (Math.abs(difference) > 50) {
      difference > 0 ? showNext() : showPrevious();
    }
    touchStartX.current = null;
  };

  const handleWishlist = (event) => {
    event.stopPropagation();
    if (!wishlistIsMutating) {
      onWishlist?.();
    }
  };

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
        setIsZoomed(false);
      }
      if (event.key === "ArrowRight") showNext();
      if (event.key === "ArrowLeft") showPrevious();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen, currentIndex, totalImages]);

  if (!totalImages) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3 text-[#64748B]">
          <Package size={48} strokeWidth={1.3} aria-hidden="true" />
          <p className="text-sm font-medium">Product image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full" aria-label="Product gallery">
      <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
        {/* Main Product Stage */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative aspect-square w-full flex-1 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white"
        >
          <button
            type="button"
            onClick={() => setIsZoomed((value) => !value)}
            aria-label={isZoomed ? "Reset product image zoom" : "Zoom product image"}
            className={`flex h-full w-full items-center justify-center overflow-hidden p-6 sm:p-8 ${
              isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
            }`}
          >
            <img
              src={safeSelectedImage}
              alt={`${productName} view ${currentIndex + 1}`}
              draggable="false"
              className={`h-full w-full select-none object-contain transition-transform duration-300 ease-out ${
                isZoomed ? "scale-125" : "scale-100"
              }`}
            />
          </button>

          {/* Discount Pill */}
          {Number(discountPercentage) > 0 && (
            <span className="absolute left-3.5 top-3.5 z-10 inline-flex items-center rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 sm:left-4 sm:top-4">
              {discountPercentage}% OFF
            </span>
          )}

          {/* Top-right Controls: Wishlist + Fullscreen */}
          <div className="absolute right-3.5 top-3.5 z-20 flex items-center gap-2 sm:right-4 sm:top-4">
            <button
              type="button"
              onClick={handleWishlist}
              disabled={wishlistIsMutating}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={isInWishlist}
              className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-xs backdrop-blur-xs transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:w-10 ${
                isInWishlist
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-[#E2E8F0] bg-white/95 text-[#64748B] hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              }`}
            >
              {wishlistIsMutating ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Heart
                  size={18}
                  strokeWidth={1.9}
                  fill={isInWishlist ? "currentColor" : "none"}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFullscreen(true);
                setIsZoomed(false);
              }}
              aria-label="View fullscreen image"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/95 text-[#64748B] shadow-xs backdrop-blur-xs transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] sm:h-10 sm:w-10"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          {/* Prev / Next Arrows */}
          {totalImages > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/95 text-[#101828] shadow-xs backdrop-blur-xs transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] sm:h-10 sm:w-10"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                onClick={showNext}
                aria-label="Next image"
                className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/95 text-[#101828] shadow-xs backdrop-blur-xs transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] sm:h-10 sm:w-10"
              >
                <ChevronRight size={19} />
              </button>
            </>
          )}

          {/* Bottom Bar: Zoom hint + Counter */}
          <div className="pointer-events-none absolute inset-x-3.5 bottom-3.5 z-10 flex items-center justify-between gap-2 sm:inset-x-4 sm:bottom-4">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[#64748B] backdrop-blur-xs">
              {isZoomed ? <ZoomOut size={12} /> : <ZoomIn size={12} />}
              <span className="hidden sm:inline">
                {isZoomed ? "Click to reset" : "Click to zoom"}
              </span>
            </span>

            {totalImages > 1 && (
              <span className="rounded-full bg-[#101828]/75 px-2.5 py-1 text-[11px] font-semibold text-white tabular-nums backdrop-blur-xs">
                {currentIndex + 1} / {totalImages}
              </span>
            )}
          </div>
        </div>

        {/* Thumbnails: Vertical column on Desktop, horizontal row on Mobile/Tablet */}
        {totalImages > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin] lg:max-h-[540px] lg:w-[82px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0">
            {images.map((image, index) => {
              const isActive = safeSelectedImage === image;

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage?.(image)}
                  aria-label={`Select image ${index + 1}`}
                  aria-pressed={isActive}
                  className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1.5 transition-all lg:h-[78px] lg:w-[78px] ${
                    isActive
                      ? "border-[#0755E9] ring-2 ring-[#EFF6FF]"
                      : "border-[#E2E8F0] hover:border-[#0755E9]/45"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${productName} thumbnail ${index + 1}`}
                    loading="lazy"
                    draggable="false"
                    className="h-full w-full object-contain"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen product gallery"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4"
          onClick={() => {
            setIsFullscreen(false);
            setIsZoomed(false);
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsFullscreen(false);
              setIsZoomed(false);
            }}
            aria-label="Close fullscreen"
            className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
          >
            <X size={22} />
          </button>

          <span className="absolute left-1/2 top-5 z-20 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white tabular-nums sm:text-sm">
            {currentIndex + 1} / {totalImages}
          </span>

          <div
            className="flex h-full w-full items-center justify-center overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={safeSelectedImage}
              alt={`${productName} fullscreen view ${currentIndex + 1}`}
              draggable="false"
              onClick={() => setIsZoomed((value) => !value)}
              className={`max-h-[85vh] max-w-full select-none object-contain transition-transform duration-300 ${
                isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
              }`}
            />
          </div>

          {totalImages > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
