"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import {
  Play,
  X,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Volume2,
  VolumeX,
  Video,
  Sparkles,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";

// ========================================
// HELPERS
// ========================================

const getProduct = (item) => {
  return item?.product && typeof item.product === "object"
    ? item.product
    : null;
};

const getVideoTitle = (item) => {
  const product = getProduct(item);

  return (
    item?.title ||
    product?.name ||
    product?.title ||
    "Featured Product"
  );
};

const getVideoDescription = (item) => {
  const product = getProduct(item);

  return (
    item?.description ||
    product?.shortDescription ||
    product?.description ||
    "Discover the latest technology at Mobi Hub."
  );
};

const getVideoCategory = (item) => {
  const product = getProduct(item);

  const category =
    product?.category?.name ||
    product?.categoryName ||
    product?.category;

  return typeof category === "string"
    ? category.toUpperCase()
    : "MOBI HUB EXCLUSIVES";
};

const getVideoPrice = (item) => {
  const product = getProduct(item);

  const price =
    product?.price ??
    product?.sellingPrice ??
    product?.salePrice ??
    null;

  if (price === null || price === undefined || price === "") {
    return null;
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return null;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

const getVideoUrl = (item) => {
  return item?.videoUrl || "";
};

const getThumbnailUrl = (item) => {
  return item?.thumbnailUrl || "";
};

const getProductHref = (item) => {
  const product = getProduct(item);

  // Change this route if your product details page uses another URL pattern.
  if (product?.slug) {
    return `/products/${product.slug}`;
  }

  return "/products";
};

// ========================================
// VIDEO CARD
// ========================================

function VideoCard({
  item,
  onPlay,
  activeCardId,
  setActiveCardId,
  autoPreviewEnabled,
}) {
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);

  // Autoplay when visible
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= 0.6
        ) {
          setActiveCardId(item.id);
        } else {
          setActiveCardId((current) =>
            current === item.id ? null : current
          );
        }
      },
      { threshold: [0, 0.6, 1] }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, []);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 sm:rounded-2xl">

      {/* VIDEO AREA */}
      <div className="relative m-2.5 overflow-hidden rounded-xl bg-[#EFF6FF]">
        <div className="aspect-[4/4.5] overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnailUrl || undefined}
            muted
            loop
            playsInline
            preload="none"
            aria-label={`Preview of ${title}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Category */}
        <div className="absolute left-3 top-3">
          <span className="rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-[9px] font-extrabold tracking-wider text-[#0755E9] shadow-sm">
            {item.category}
          </span>
        </div>

        {/* Video status */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isPlaying
                ? "animate-pulse bg-green-400"
                : "bg-white"
            }`}
          />

          {isPlaying ? "Live Preview" : "Video"}
        </div>

        {/* Play Button */}

        <button
          type="button"
          onClick={() => onPlay(item)}
          aria-label={`Watch ${item.title}`}
          className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#0755E9] text-white shadow-lg shadow-blue-900/20 transition-all duration-300 hover:scale-110 hover:bg-[#0645C4]"
        >
          <Play
            size={16}
            fill="currentColor"
          />
        </button>

        {/* Video label */}
        <div className="absolute bottom-5 right-3 flex items-center gap-1.5 text-[10px] font-bold text-white drop-shadow-md">
          <Video size={13} />
          WATCH VIDEO
        </div>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-1">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#0755E9]" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#0755E9]">
              Featured Product
            </span>
          </div>

          <h3 className="line-clamp-2 text-sm font-extrabold leading-5 text-[#101828] transition-colors group-hover:text-[#0755E9]">
            {item.title}
          </h3>

          <p className="mt-1.5 line-clamp-1 text-xs text-slate-500">
            {item.description}
          </p>
        </div>

        {/* Price + Action */}
        <div className="mt-4 flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Starting at
            </p>
            <p className="mt-0.5 text-lg font-extrabold text-[#101828]">
              {item.price}
            </p>
          </div>

          <Link
            href={item.href}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0755E9] px-3 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#0645C4] active:scale-95"
          >
            <ShoppingBag size={13} />
            Shop Now
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ========================================
// LOADING SKELETON
// ========================================

function VideoSkeleton() {
  return (
    <div className="w-[245px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:w-[280px] lg:w-[290px]">
      <div className="m-2.5 aspect-[4/4.5] animate-pulse rounded-xl bg-slate-100" />

      <div className="space-y-3 px-4 pb-5">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="mt-4 h-10 animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

// ========================================
// MAIN COMPONENT
// ========================================

export default function ShopByVideos() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [swiper, setSwiper] = useState(null);

  const [navigation, setNavigation] = useState({
    isBeginning: true,
    isEnd: true,
  });

  const [activeCardId, setActiveCardId] = useState(null);

  const [activeVideo, setActiveVideo] = useState(null);

  const [muted, setMuted] = useState(true);

  const [videoError, setVideoError] = useState(false);

  // Mount only in browser
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ========================================
  // NAVIGATION
  // ========================================

  const updateNavigation = useCallback((instance) => {
    if (!instance || instance.destroyed) return;

    setNavigation({
      isBeginning: instance.isBeginning,
      isEnd: instance.isEnd,
    });
  }, []);

  // Open video
  const openVideo = (item) => {
    setMuted(true);
    setVideoError(false);
    setActiveVideo(item);
  }, []);

  // Close video
  const closeVideo = useCallback(() => {
    setActiveVideo(null);
    setVideoError(false);
    setMuted(true);
  }, []);

  // Modal keyboard and body scroll
  useEffect(() => {
    if (!activeVideo) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") closeVideo();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      previousFocusRef.current?.focus?.();
    };
  }, [activeVideo, closeVideo]);

  // ========================================
  // RETRY FETCH
  // ========================================

  const handleRetry = () => {
    dispatch(fetchActiveProductVideos());
  };

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading && activeVideos.length === 0) {
    return (
      <section className="w-full overflow-hidden bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-10">
          <SectionHeader />

          <div className="flex gap-3 overflow-hidden pb-4 sm:gap-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <VideoSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ========================================
  // ERROR STATE
  // ========================================

  if (error && activeVideos.length === 0) {
    return (
      <section className="w-full bg-white py-12 sm:py-16">
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Video size={25} />
          </div>

          <h3 className="mt-4 text-base font-extrabold text-[#101828]">
            Unable to load videos
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0755E9] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0645C4]"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </section>
    );
  }

  // ========================================
  // EMPTY STATE
  // ========================================

  if (!activeVideos.length) {
    return null;
  }

  // ========================================
  // MAIN UI
  // ========================================

  // ========================================
  // PAUSE PREVIEWS WHEN MODAL OPENS
  // ========================================

  useEffect(() => {
    if (activeVideo) {
      setActiveCardId(null);
    }
  }, [activeVideo]);

  // ========================================
  // REDUCED MOTION
  // ========================================

  const canNavigate =
    swiper &&
    !swiper.destroyed &&
    !swiper.isLocked;

  const revealAnimation = shouldReduceMotion
    ? false
    : { opacity: 0, y: 16 };

  return (
    <section className="w-full overflow-hidden bg-white">

      {/* SECTION CONTAINER */}
      <div className="w-full">

        {/* HEADER */}
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-[#0755E9]" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#0755E9]">
                Mobi Hub Exclusives
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-[#101828] sm:text-3xl lg:text-4xl">
              Watch. Discover.
              <span className="text-[#0755E9]"> Shop.</span>
            </h2>

            <p className="mt-2 max-w-lg text-xs leading-5 text-slate-500 sm:text-sm">
              Get a closer look at the tech that makes everyday life better.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => swiper?.slidePrev(400)}
              disabled={
                !canNavigate || navigation.isBeginning
              }
              aria-label="Previous videos"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              onClick={() => swiper?.slideNext(400)}
              disabled={
                !canNavigate || navigation.isEnd
              }
              aria-label="Next videos"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </motion.div>

        {/* VIDEO CAROUSEL */}

        {isMounted ? (
          <Swiper
            modules={[FreeMode, A11y]}
            onSwiper={handleSwiper}
            onSlideChange={updateNavigation}
            onResize={updateNavigation}
            onReachBeginning={updateNavigation}
            onReachEnd={updateNavigation}
            onFromEdge={updateNavigation}
            onTransitionEnd={updateNavigation}
            slidesPerView="auto"
            spaceBetween={10}
            freeMode={{
              enabled: true,
              momentum: true,
              sticky: false,
            }}
            grabCursor
            watchOverflow
            breakpoints={{
              640: {
                spaceBetween: 14,
              },
              1024: {
                spaceBetween: 18,
              },
            }}
            a11y={{
              enabled: true,
              containerMessage: "Mobi Hub video collection",
            }}
            className="!overflow-visible !pb-4"
          >
            {activeVideos.map((item) => (
              <SwiperSlide
                key={item.id}
                className="!h-auto !w-[245px] sm:!w-[280px] lg:!w-[290px]"
              >
                <VideoCard
                  item={item}
                  onPlay={openVideo}
                  activeCardId={activeCardId}
                  setActiveCardId={setActiveCardId}
                  autoPreviewEnabled={
                    !shouldReduceMotion && !activeVideo
                  }
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          // Server-rendered fallback before Swiper mounts
          <div className="flex gap-3 overflow-hidden pb-4 sm:gap-5">
            {videos.map((item) => (
              <div
                key={item.id}
                className="w-[245px] shrink-0 sm:w-[280px] lg:w-[290px]"
              >
                <VideoCard item={item} onPlay={openVideo} />
              </div>
            ))}
          </div>
        )}

        {/* FOOTER LINK */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
          <div>
            <p className="text-[11px] font-bold text-[#101828] sm:text-xs">
              Explore more technology
            </p>
            <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
              Discover the complete collection at Mobi Hub.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#0755E9] transition hover:text-[#0645C4] sm:text-xs"
          >
            View All
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* VIDEO MODAL */}

      {activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
          onClick={closeVideo}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07152D]/90 p-3 backdrop-blur-md sm:p-5"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shop-video-title"
            aria-describedby="shop-video-description"
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[95vh] w-full max-w-[400px] overflow-y-auto rounded-xl bg-black shadow-2xl sm:rounded-2xl"
          >
            {/* Close */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeVideo}
              aria-label="Close video"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-white hover:text-[#0755E9]"
            >
              <X size={19} />
            </button>

            {/* Sound */}
            {!videoError && (
              <button
                type="button"
                onClick={() =>
                  setMuted((previous) => !previous)
                }
                aria-label={
                  muted ? "Unmute video" : "Mute video"
                }
                className="absolute right-14 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-white hover:text-[#0755E9]"
              >
                {muted ? (
                  <VolumeX size={17} />
                ) : (
                  <Volume2 size={17} />
                )}
              </button>
            )}

            {/* Player */}
            {videoError ? (
              <div className="flex aspect-[9/16] flex-col items-center justify-center gap-3 bg-slate-900 p-6 text-center text-white">
                <Video size={36} />
                <p className="text-sm font-semibold">
                  Unable to play this video.
                </p>

                <p className="text-xs text-slate-400">
                  Please check your connection or try another video.
                </p>
              </div>
            ) : (
              <video
                key={activeVideo._id}
                src={getVideoUrl(activeVideo)}
                poster={getThumbnailUrl(activeVideo) || undefined}
                autoPlay
                controls
                playsInline
                muted={muted}
                preload="metadata"
                onError={() => setVideoError(true)}
                className="aspect-[9/16] max-h-[75vh] w-full bg-black object-contain"
              />
            )}

            {/* Details */}
            <div className="bg-white px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#0755E9]">
                {activeVideo.category}
              </p>

              <h3 className="mt-1 text-base font-extrabold text-[#101828]">
                {activeVideo.title}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {activeVideo.description}
              </p>

              {/* PRICE */}
              <div className="mt-3">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Starting at
                </p>

                <p className="text-lg font-extrabold text-[#101828]">
                  {activeVideo.price}
                </p>
              </div>

              {/* PRODUCT LINK */}
              <Link
                href={getProductHref(activeVideo)}
                onClick={closeVideo}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0755E9] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0645C4] sm:mt-4 sm:py-3 sm:text-sm"
              >
                <ShoppingBag size={16} />
                Explore Products
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ========================================
// SECTION HEADER
// ========================================

function SectionHeader() {
  return (
    <div className="min-w-0">
      <div className="mb-3 inline-flex items-center gap-2">
        <span className="h-6 w-1 rounded-full bg-[#0755E9]" />

        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#0755E9]">
          Mobi Hub Exclusives
        </span>
      </div>

      <h2 className="text-2xl font-black tracking-tight text-[#101828] sm:text-3xl lg:text-4xl">
        Watch. Discover.
        <span className="text-[#0755E9]"> Shop.</span>
      </h2>

      <p className="mt-2 max-w-lg text-xs leading-5 text-slate-500 sm:text-sm">
        Get a closer look at the tech that makes everyday life better.
      </p>
    </div>
  );
}