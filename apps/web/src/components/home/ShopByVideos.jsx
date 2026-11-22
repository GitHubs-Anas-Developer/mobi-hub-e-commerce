
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

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
} from "lucide-react";

import {
  motion,
  useReducedMotion,
} from "motion/react";

import {
  Swiper,
  SwiperSlide,
} from "swiper/react";

import {
  FreeMode,
  A11y,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";

// ========================================
// VIDEO DATA
// ========================================

const videos = [
  {
    id: 1,
    category: "WIRELESS AUDIO",
    title: "Premium Wireless Earbuds",
    description: "Discover your perfect sound.",
    price: "₹1,499",
    video:
      "https://videos.pexels.com/video-files/9130470/9130470-uhd_2160_3840_30fps.mp4",
    poster:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&q=85&fit=crop",
    href: "/products",
  },
  {
    id: 2,
    category: "CHARGING ESSENTIALS",
    title: "Fast Charging Accessories",
    description: "Power your everyday devices.",
    price: "₹799",
    video:
      "https://videos.pexels.com/video-files/9141886/9141886-uhd_2160_3840_30fps.mp4",
    poster:
      "https://images.unsplash.com/photo-1609592806596-b43bada2f4c7?w=600&q=85&fit=crop",
    href: "/products",
  },
  {
    id: 3,
    category: "TECH COLLECTION",
    title: "Modern Tech Accessories",
    description: "Explore your everyday essentials.",
    price: "₹999",
    video:
      "https://videos.pexels.com/video-files/32017987/13646383_1080_1920_60fps.mp4",
    poster:
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600&q=85&fit=crop",
    href: "/products",
  },
  {
    id: 4,
    category: "SMARTPHONE COLLECTION",
    title: "Explore Smartphone Design",
    description: "Discover modern technology.",
    price: "₹499",
    video:
      "https://videos.pexels.com/video-files/28646608/12441653_1080_1920_30fps.mp4",
    poster:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=85&fit=crop",
    href: "/products",
  },
];

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

  // Observe card visibility
  useEffect(() => {
    const video = videoRef.current;

    if (!video || !autoPreviewEnabled) {
      if (video) {
        video.pause();
        setIsPlaying(false);
      }

      return;
    }

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
      {
        threshold: [0, 0.6, 1],
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [
    item.id,
    setActiveCardId,
    autoPreviewEnabled,
  ]);

  // Play only the active card
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    let cancelled = false;

    if (
      activeCardId === item.id &&
      autoPreviewEnabled
    ) {
      video.muted = true;

      video
        .play()
        .then(() => {
          if (!cancelled) {
            setIsPlaying(true);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setIsPlaying(false);
          }
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }

    return () => {
      cancelled = true;
    };
  }, [
    activeCardId,
    item.id,
    autoPreviewEnabled,
  ]);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 sm:rounded-2xl">

      {/* VIDEO AREA */}
      <div className="relative m-2 overflow-hidden rounded-lg bg-[#EFF6FF] sm:m-2.5 sm:rounded-xl">

        <div className="aspect-[4/4.5] overflow-hidden">
          <video
            ref={videoRef}
            src={item.video}
            poster={item.poster}
            muted
            loop
            playsInline
            preload="none"
            aria-label={`Preview of ${item.title}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Category */}
        <div className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3">
          <span className="rounded-full border border-white/80 bg-white/95 px-2.5 py-1 text-[8px] font-extrabold tracking-wider text-[#0755E9] shadow-sm sm:px-3 sm:py-1.5 sm:text-[9px]">
            {item.category}
          </span>
        </div>

        {/* Video Status */}
        <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-md sm:right-3 sm:top-3 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[10px]">

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
          className="absolute bottom-2.5 left-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#0755E9] text-white shadow-lg shadow-blue-900/20 transition-all duration-300 hover:scale-110 hover:bg-[#0645C4] active:scale-95 sm:bottom-3 sm:left-3 sm:h-11 sm:w-11"
        >
          <Play
            size={16}
            fill="currentColor"
          />
        </button>

        {/* Video Label */}
        <div className="absolute bottom-4 right-2.5 flex items-center gap-1 text-[9px] font-bold text-white drop-shadow-md sm:bottom-5 sm:right-3 sm:gap-1.5 sm:text-[10px]">
          <Video size={12} />
          WATCH VIDEO
        </div>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-1 sm:px-4 sm:pb-4">

        <div className="flex-1">

          <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2">
            <Sparkles
              size={11}
              className="text-[#0755E9]"
            />

            <span className="text-[8px] font-bold uppercase tracking-wider text-[#0755E9] sm:text-[9px]">
              Featured Product
            </span>
          </div>

          <h3 className="line-clamp-2 text-xs font-extrabold leading-5 text-[#101828] transition-colors group-hover:text-[#0755E9] sm:text-sm">
            {item.title}
          </h3>

          <p className="mt-1 line-clamp-1 text-[10px] text-slate-500 sm:mt-1.5 sm:text-xs">
            {item.description}
          </p>
        </div>

        {/* PRICE + ACTION */}
        <div className="mt-3 flex items-end justify-between gap-2 border-t border-slate-100 pt-2.5 sm:mt-4 sm:pt-3">

          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[9px]">
              Starting at
            </p>

            <p className="mt-0.5 text-base font-extrabold text-[#101828] sm:text-lg">
              {item.price}
            </p>
          </div>

          <Link
            href={item.href}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#0755E9] px-2.5 py-2 text-[10px] font-bold text-white transition hover:bg-[#0645C4] active:scale-95 sm:gap-1.5 sm:px-3 sm:py-2.5 sm:text-[11px]"
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
// MAIN COMPONENT
// ========================================

export default function ShopByVideos() {
  const shouldReduceMotion = useReducedMotion();

  // FIX: Mount Swiper only in the browser
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

  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

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

  const handleSwiper = useCallback(
    (instance) => {
      setSwiper(instance);
      updateNavigation(instance);
    },
    [updateNavigation]
  );

  // ========================================
  // OPEN VIDEO MODAL
  // ========================================

  const openVideo = useCallback((item) => {
    previousFocusRef.current = document.activeElement;

    setActiveCardId(null);
    setMuted(true);
    setVideoError(false);
    setActiveVideo(item);
  }, []);

  // ========================================
  // CLOSE VIDEO MODAL
  // ========================================

  const closeVideo = useCallback(() => {
    setActiveVideo(null);
    setVideoError(false);
    setMuted(true);
  }, []);

  // ========================================
  // MODAL ACCESSIBILITY
  // ========================================

  useEffect(() => {
    if (!activeVideo) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeVideo();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements =
        dialogRef.current?.querySelectorAll(
          'button:not([disabled]), a[href], video[controls]'
        );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];

      const lastElement =
        focusableElements[focusableElements.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
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
        <motion.div
          initial={revealAnimation}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.4,
            ease: "easeOut",
          }}
          className="mb-5 flex items-end justify-between gap-3 sm:mb-7"
        >
          <div className="min-w-0">

            <div className="mb-2 inline-flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-[#0755E9] sm:h-6" />

              <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#0755E9] sm:text-[10px]">
                Mobi Hub Exclusives
              </span>
            </div>

            <h2 className="text-lg font-black tracking-tight text-[#101828] sm:text-xl lg:text-2xl">
              Watch. Discover.
              <span className="text-[#0755E9]">
                {" "}Shop.
              </span>
            </h2>

            <p className="mt-1.5 max-w-lg text-[11px] leading-5 text-slate-500 sm:text-xs">
              Get a closer look at the tech that makes everyday life better.
            </p>
          </div>

          {/* NAVIGATION */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

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
            {videos.map((item) => (
              <SwiperSlide
                key={item.id}
                className="!h-auto !w-[220px] sm:!w-[255px] lg:!w-[275px]"
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
          <div className="flex gap-2.5 overflow-hidden pb-4">
            {videos.map((item) => (
              <div
                key={item.id}
                className="h-[360px] w-[220px] shrink-0 animate-pulse rounded-xl bg-slate-100 sm:w-[255px] lg:w-[275px]"
              />
            ))}
          </div>
        )}

        {/* FOOTER LINK */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:mt-5 sm:pt-4">

          <div>
            <p className="text-[11px] font-bold text-[#101828] sm:text-xs">
              Explore more technology
            </p>

            <p className="mt-1 text-[9px] text-slate-400 sm:text-[11px]">
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
          role="presentation"
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

            {/* CLOSE BUTTON */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeVideo}
              aria-label="Close video"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-white hover:text-[#0755E9]"
            >
              <X size={19} />
            </button>

            {/* SOUND BUTTON */}
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

            {/* VIDEO PLAYER */}
            {videoError ? (
              <div className="flex aspect-[9/16] flex-col items-center justify-center gap-3 bg-slate-900 p-6 text-center text-white">

                <Video size={34} />

                <p className="text-sm font-semibold">
                  Unable to play this video.
                </p>

                <p className="text-xs text-slate-400">
                  Please check your connection or try another video.
                </p>
              </div>
            ) : (
              <video
                key={activeVideo.id}
                src={activeVideo.video}
                poster={activeVideo.poster}
                autoPlay
                controls
                playsInline
                muted={muted}
                preload="metadata"
                onError={() => setVideoError(true)}
                className="aspect-[9/16] max-h-[75vh] w-full bg-black object-contain"
              />
            )}

            {/* VIDEO DETAILS */}
            <div className="bg-white px-4 py-4 sm:px-5">

              <p className="text-[9px] font-bold uppercase tracking-wider text-[#0755E9] sm:text-[10px]">
                {activeVideo.category}
              </p>

              <h3
                id="shop-video-title"
                className="mt-1 text-sm font-extrabold text-[#101828] sm:text-base"
              >
                {activeVideo.title}
              </h3>

              <p
                id="shop-video-description"
                className="mt-1 text-[11px] text-slate-500 sm:text-xs"
              >
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
                href={activeVideo.href}
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
