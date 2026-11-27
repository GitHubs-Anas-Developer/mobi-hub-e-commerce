
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, A11y } from "swiper/modules";

import {
  Truck,
  ChevronRight,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Wallet,
  ShoppingBag,
} from "lucide-react";

import "swiper/css";

// ========================================
// ANNOUNCEMENTS
// ========================================

const announcements = [
  {
    id: 1,
    icon: Truck,
    message: "Free Delivery",
    highlight: "On All Orders",
    link: "/products",
    linkText: "Shop Now",
  },
  {
    id: 2,
    icon: Wallet,
    message: "Shop with Convenience",
    highlight: "Cash on Delivery Available",
    link: "/products",
    linkText: "Explore",
  },
  {
    id: 3,
    icon: RefreshCw,
    message: "Shop with Confidence",
    highlight: "7 Days Easy Returns",
    link: "/account/orders",
    linkText: "View Orders",
  },
  {
    id: 4,
    icon: ShieldCheck,
    message: "Your Payments are",
    highlight: "Safe & Secure",
    link: "/products",
    linkText: "Shop Securely",
  },
  {
    id: 5,
    icon: ShoppingBag,
    message: "Discover the Latest",
    highlight: "Gadgets & Accessories",
    link: "/products",
    linkText: "Browse Now",
  },
];

// ========================================
// ANNOUNCEMENT ITEM
// ========================================

function AnnouncementItem({ item }) {
  const Icon = item.icon;

  return (
    <div className="flex min-h-9 w-full items-center justify-center px-3 py-1.5 sm:min-h-10 sm:px-6">
      <div className="flex w-full max-w-[1440px] flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:gap-x-3">

        {/* ICON */}
        <Icon
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className="shrink-0 text-blue-300"
        />

        {/* MESSAGE */}
        <p className="text-center text-[11px] font-medium leading-relaxed text-blue-100 sm:text-xs">
          {item.message}{" "}
          <span className="font-semibold text-white">
            {item.highlight}
          </span>
        </p>

        {/* LINK */}
        <Link
          href={item.link}
          className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[11px] font-semibold text-white underline decoration-white/50 underline-offset-4 transition-colors hover:text-blue-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-xs"
        >
          {item.linkText}
          <ChevronRight
            size={12}
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
}

// ========================================
// ANNOUNCEMENT BAR
// ========================================

export default function AnnouncementBar() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ========================================
  // SSR FALLBACK
  // ========================================

  if (!isMounted) {
    return (
      <div
        aria-label="Store announcement"
        className="flex min-h-9 w-full items-center justify-center overflow-hidden bg-[#082B70] text-white sm:min-h-10"
      >
        <AnnouncementItem item={announcements[0]} />
      </div>
    );
  }

  // ========================================
  // SWIPER
  // ========================================

  return (
    <div
      aria-label="ELENZO store announcements"
      className="w-full overflow-hidden bg-[#082B70] text-white"
    >
      <Swiper
        modules={[Autoplay, A11y]}
        slidesPerView={1}
        loop={announcements.length > 1}
        speed={650}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        allowTouchMove
        a11y={{
          enabled: true,
          containerMessage: "ELENZO store announcements",
          slideRole: "group",
        }}
        className="w-full"
      >
        {announcements.map((item) => (
          <SwiperSlide key={item.id}>
            <AnnouncementItem item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
