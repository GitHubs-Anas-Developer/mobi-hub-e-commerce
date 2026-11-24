
"use client";

import { useState, useRef, useEffect } from "react";

import {
  Package,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
} from "lucide-react";

export default function ProductGallery({
  productImages = [],
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

  const images = productImages.filter(
    (image) => typeof image === "string" && image.trim() !== ""
  );

  const safeSelectedImage = images.includes(selectedImage)
    ? selectedImage
    : images[0] || null;

  const currentIndex = safeSelectedImage
    ? images.indexOf(safeSelectedImage)
    : 0;

  const totalImages = images.length;

  // Keep selected image valid when product images change.
  useEffect(() => {
    if (!images.length) {
      if (selectedImage !== null) {
        setSelectedImage(null);
      }
      return;
    }

    if (!images.includes(selectedImage)) {
      setSelectedImage(images[0]);
    }
  }, [images, selectedImage, setSelectedImage]);

  // Reset zoom when image changes.
  useEffect(() => {
    setIsZoomed(false);
  }, [safeSelectedImage]);

  const showNext = () => {
    if (totalImages <= 1) return;

    const nextIndex = (currentIndex + 1) % totalImages;
    setSelectedImage(images[nextIndex]);
  };

  const showPrevious = () => {
    if (totalImages <= 1) return;

    const previousIndex =
      (currentIndex - 1 + totalImages) % totalImages;

    setSelectedImage(images[previousIndex]);
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

  // Prevent background scrolling in fullscreen.
  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
        setIsZoomed(false);
      }

      if (event.key === "ArrowRight") {
        showNext();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen, currentIndex, totalImages]);

  if (!totalImages) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Package size={48} strokeWidth={1.3} />
          <p className="text-sm font-medium">
            Product image unavailable
          </p>
        </div>
      </div>
    );
  }

  const renderWishlistButton = () => (
    <button
      type="button"
      onClick={handleWishlist}
      disabled={wishlistIsMutating}
      aria-label={
        isInWishlist
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      aria-pressed={isInWishlist}
      className={`
        absolute right-4 top-4 z-20
        flex h-11 w-11 items-center justify-center
        rounded-full border shadow-sm backdrop-blur-md
        transition-all duration-200
        disabled:cursor-not-allowed disabled:opacity-60
        ${
          isInWishlist
            ? "border-red-200 bg-red-50 text-red-500"
            : "border-slate-200 bg-white/90 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
        }
      `}
    >
      {wishlistIsMutating ? (
        <Loader2 size={19} className="animate-spin" />
      ) : (
        <Heart
          size={20}
          fill={isInWishlist ? "currentColor" : "none"}
        />
      )}
    </button>
  );

  const renderImageNavigation = () => (
    <>
      {totalImages > 1 && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Previous image"
            className="
              absolute left-3 top-1/2 z-10
              flex h-10 w-10 -translate-y-1/2
              items-center justify-center rounded-full
              border border-slate-200 bg-white/90
              text-slate-700 shadow-sm backdrop-blur
              transition hover:bg-white hover:text-[#0755e9]
            "
          >
            <ChevronLeft size={21} />
          </button>

          <button
            type="button"
            onClick={showNext}
            aria-label="Next image"
            className="
              absolute right-3 top-1/2 z-10
              flex h-10 w-10 -translate-y-1/2
              items-center justify-center rounded-full
              border border-slate-200 bg-white/90
              text-slate-700 shadow-sm backdrop-blur
              transition hover:bg-white hover:text-[#0755e9]
            "
          >
            <ChevronRight size={21} />
          </button>
        </>
      )}
    </>
  );

  return (
    <section className="w-full">
      {/* Main Gallery */}
      <div
        className="
          relative aspect-square w-full overflow-hidden
          rounded-2xl border border-slate-200
          bg-white shadow-sm
        "
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Image */}
        <button
          type="button"
          onClick={() => setIsZoomed(!isZoomed)}
          className="flex h-full w-full items-center justify-center overflow-hidden p-5 sm:p-8"
          aria-label="Zoom product image"
        >
          <img
            src={safeSelectedImage}
            alt="Product image"
            draggable="false"
            className={`
              h-full w-full select-none object-contain
              transition-transform duration-300
              ${isZoomed ? "scale-125" : "scale-100"}
            `}
          />
        </button>

        {/* Wishlist */}
        {renderWishlistButton()}

        {/* Discount Badge */}
        {Number(discountPercentage) > 0 && (
          <span className="
            absolute left-4 top-4 z-10
            rounded-full bg-red-500 px-3 py-1.5
            text-xs font-bold text-white shadow-sm
          ">
            {discountPercentage}% OFF
          </span>
        )}

        {/* Image Navigation */}
        {renderImageNavigation()}

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={() => {
            setIsFullscreen(true);
            setIsZoomed(false);
          }}
          aria-label="Open fullscreen image"
          className="
            absolute bottom-4 right-4 z-10
            flex h-10 w-10 items-center justify-center
            rounded-full border border-slate-200
            bg-white/90 text-slate-600 shadow-sm
            backdrop-blur transition
            hover:bg-blue-50 hover:text-[#0755e9]
          "
        >
          <Maximize2 size={18} />
        </button>

        {/* Image Counter */}
        {totalImages > 1 && (
          <span className="
            absolute bottom-4 left-4 z-10
            rounded-full bg-slate-900/70
            px-3 py-1.5 text-xs font-medium
            text-white backdrop-blur
          ">
            {currentIndex + 1} / {totalImages}
          </span>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {totalImages > 1 && (
        <div className="
          mt-4 flex gap-3 overflow-x-auto pb-2
          scrollbar-thin scrollbar-thumb-slate-300
        ">
          {images.map((image, index) => {
            const isActive = safeSelectedImage === image;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(image)}
                aria-label={`View product image ${index + 1}`}
                aria-pressed={isActive}
                className={`
                  relative h-20 w-20 shrink-0
                  overflow-hidden rounded-xl border-2
                  bg-white p-1 transition-all
                  ${
                    isActive
                      ? "border-[#0755e9] shadow-sm"
                      : "border-slate-200 hover:border-slate-400"
                  }
                `}
              >
                <img
                  src={image}
                  alt={`Product thumbnail ${index + 1}`}
                  loading="lazy"
                  draggable="false"
                  className="h-full w-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Preview */}
      {isFullscreen && (
        <div
          className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            bg-black/95 p-4
          "
          onClick={() => {
            setIsFullscreen(false);
            setIsZoomed(false);
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => {
              setIsFullscreen(false);
              setIsZoomed(false);
            }}
            aria-label="Close fullscreen"
            className="
              absolute right-5 top-5 z-30
              flex h-11 w-11 items-center justify-center
              rounded-full bg-white/10 text-white
              transition hover:bg-white/20
            "
          >
            <X size={23} />
          </button>

          {/* Fullscreen Counter */}
          <span className="
            absolute left-1/2 top-6 z-20
            -translate-x-1/2 rounded-full
            bg-white/10 px-4 py-2
            text-sm font-medium text-white
          ">
            {currentIndex + 1} / {totalImages}
          </span>

          {/* Fullscreen Image */}
          <div
            className="flex h-full w-full items-center justify-center overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={safeSelectedImage}
              alt="Product fullscreen"
              draggable="false"
              onClick={() => setIsZoomed(!isZoomed)}
              className={`
                max-h-full max-w-full select-none
                object-contain transition-transform duration-300
                ${isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"}
              `}
            />
          </div>

          {/* Fullscreen Navigation */}
          {totalImages > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
                aria-label="Previous image"
                className="
                  absolute left-3 top-1/2 z-20
                  flex h-11 w-11 -translate-y-1/2
                  items-center justify-center rounded-full
                  bg-white/10 text-white
                  transition hover:bg-white/20
                "
              >
                <ChevronLeft size={25} />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                aria-label="Next image"
                className="
                  absolute right-3 top-1/2 z-20
                  flex h-11 w-11 -translate-y-1/2
                  items-center justify-center rounded-full
                  bg-white/10 text-white
                  transition hover:bg-white/20
                "
              >
                <ChevronRight size={25} />
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
