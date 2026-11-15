
"use client";

import { useRef, useState } from "react";

import {
  Package,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ProductGallery({
  product,
  productImages = [],
  selectedImage,
  setSelectedImage,
  discount = 0,
}) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const currentIndex = productImages.indexOf(selectedImage);

  /* ----------------------------------
     Image Navigation
  ---------------------------------- */

  const showPrevious = () => {
    if (productImages.length <= 1) return;

    const previousIndex =
      currentIndex <= 0
        ? productImages.length - 1
        : currentIndex - 1;

    setSelectedImage(productImages[previousIndex]);
  };

  const showNext = () => {
    if (productImages.length <= 1) return;

    const nextIndex =
      currentIndex >= productImages.length - 1
        ? 0
        : currentIndex + 1;

    setSelectedImage(productImages[nextIndex]);
  };

  /* ----------------------------------
     Touch Swipe
  ---------------------------------- */

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = (event) => {
    if (productImages.length <= 1) return;

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const differenceX = touchStartX.current - touchEndX;
    const differenceY = touchStartY.current - touchEndY;

    // Ignore vertical scrolling and small movements
    if (
      Math.abs(differenceX) < 50 ||
      Math.abs(differenceX) < Math.abs(differenceY)
    ) {
      return;
    }

    if (differenceX > 0) {
      // Swipe left → Next image
      showNext();
    } else {
      // Swipe right → Previous image
      showPrevious();
    }
  };

  /* ----------------------------------
     Thumbnail Selection
  ---------------------------------- */

  const handleThumbnailClick = (image) => {
    setSelectedImage(image);
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-3 lg:sticky lg:top-24 lg:self-start">

        {/* ----------------------------------
            Thumbnail Gallery
        ---------------------------------- */}

        {productImages.length > 1 && (
          <div className="order-2 flex gap-3 overflow-x-auto pb-2 sm:order-1 sm:w-[76px] sm:shrink-0 sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:pb-0">

            {productImages.map((image, index) => {
              const isActive = selectedImage === image;

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => handleThumbnailClick(image)}
                  aria-label={`View product image ${index + 1}`}
                  aria-pressed={isActive}
                  className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border bg-white p-2 transition-all duration-200 sm:h-[76px] sm:w-[76px] ${
                    isActive
                      ? "border-[#0755e9] ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-[#0755e9]"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name || "Product"} view ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* ----------------------------------
            Main Product Image
        ---------------------------------- */}

        <div className="relative order-1 min-w-0 flex-1">

          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-[#F8FAFC] touch-pan-y"
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name || "Product image"}
                draggable={false}
                className="h-full w-full select-none object-contain p-7 transition-transform duration-500 group-hover:scale-105 sm:p-10 lg:p-12"
              />
            ) : (
              <Package
                size={80}
                strokeWidth={1.2}
                className="text-slate-300"
              />
            )}

            {/* Discount Badge */}
            {discount > 0 && (
              <span className="absolute left-4 top-4 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
                {discount}% OFF
              </span>
            )}

            {/* Previous Button */}
            {productImages.length > 1 && (
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Previous product image"
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 opacity-100 shadow-sm transition hover:bg-white hover:text-[#0755e9] sm:opacity-0 sm:group-hover:opacity-100"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Next Button */}
            {productImages.length > 1 && (
              <button
                type="button"
                onClick={showNext}
                aria-label="Next product image"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 opacity-100 shadow-sm transition hover:bg-white hover:text-[#0755e9] sm:opacity-0 sm:group-hover:opacity-100"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Zoom Button */}
            {selectedImage && (
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                aria-label="View fullscreen image"
                className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#0755e9] hover:text-[#0755e9]"
              >
                <Maximize2 size={19} />
              </button>
            )}
          </div>

          {/* Image Counter */}
          {productImages.length > 1 && (
            <div className="mt-3 text-center text-xs font-medium text-slate-400">
              {currentIndex + 1} / {productImages.length}
            </div>
          )}

          {productImages.length <= 1 && (
            <p className="mt-3 text-center text-xs text-slate-400">
              Product Image
            </p>
          )}
        </div>
      </div>

      {/* ----------------------------------
          Fullscreen Image Preview
      ---------------------------------- */}

      {isZoomOpen && selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsZoomOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            aria-label="Close image preview"
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 transition hover:bg-slate-200"
          >
            <X size={22} />
          </button>

          {/* Previous Button */}
          {productImages.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 hover:bg-white sm:left-8"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Fullscreen Image */}
          <img
            src={selectedImage}
            alt={product.name || "Product preview"}
            draggable={false}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] select-none object-contain"
          />

          {/* Next Button */}
          {productImages.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 hover:bg-white sm:right-8"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Image Counter */}
          {productImages.length > 1 && (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white">
              {currentIndex + 1} / {productImages.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
