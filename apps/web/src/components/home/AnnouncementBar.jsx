
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
} from "lucide-react";

import "swiper/css";

const announcements = [
  {
    id: 1,
    icon: Truck,
    message: "Free Shipping on Orders Above",
    highlight: "₹999",
    link: "/products",
    linkText: "Shop Now",
  },
  {
    id: 2,
    icon: RefreshCw,
    message: "Shop with Confidence",
    highlight: "7 Days Easy Returns",
    link: "/return-policy",
    linkText: "Learn More",
  },
  {
    id: 3,
    icon: ShieldCheck,
    message: "Your Shopping is Safe with",
    highlight: "Secure Payments",
    link: "/products",
    linkText: "Explore Now",
  },
];

export default function AnnouncementBar() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const renderAnnouncement = (item, isFallback = false) => {
    const Icon = item.icon;

    return (
      <div
        className={`flex min-h-9 w-full items-center justify-center px-3 sm:min-h-10 sm:px-6 ${
          isFallback ? "" : ""
        }`}
      >
        <div className="flex w-full items-center justify-center gap-2 sm:gap-3">
          <Icon
            size={15}
            strokeWidth={2}
            className="shrink-0 text-blue-100"
          />

          <p className="min-w-0 text-center text-[11px] font-medium leading-tight text-white sm:text-xs">
            {item.message}{" "}
            <span className="font-bold text-white">
              {item.highlight}
            </span>
          </p>

          <Link
            href={item.link}
            className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[11px] font-semibold text-white underline decoration-white/60 underline-offset-4 transition hover:text-blue-200 sm:text-xs"
          >
            {item.linkText}
            <ChevronRight size={13} />
          </Link>

          <Sparkles
            size={13}
            className="hidden shrink-0 text-blue-200 sm:block"
          />
        </div>
      </div>
    );
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-9 w-full items-center justify-center overflow-hidden bg-blue-700 text-white sm:min-h-10">
        {renderAnnouncement(announcements[0], true)}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-blue-700 text-white">
      <Swiper
        modules={[Autoplay, A11y]}
        slidesPerView={1}
        loop={announcements.length > 1}
        speed={600}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        allowTouchMove
        a11y={{
          enabled: true,
          containerMessage: "Mobi Hub store announcements",
        }}
        className="w-full"
      >
        {announcements.map((item) => (
          <SwiperSlide key={item.id}>
            {renderAnnouncement(item)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
