
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

  // Stable server-rendered fallback.
  if (!isMounted) {
    const item = announcements[0];
    const Icon = item.icon;

    return (
      <div className="flex min-h-10 w-full items-center justify-center overflow-hidden bg-blue-700 px-3 text-white sm:px-6">
        <div className="flex items-center justify-center gap-2 text-[10px] font-medium sm:gap-3 sm:text-xs">
          <Icon
            size={16}
            strokeWidth={2}
            className="shrink-0 text-blue-100"
          />

          <p className="text-center">
            {item.message}{" "}
            <span className="font-bold text-white">
              {item.highlight}
            </span>
          </p>

          <Link
            href={item.link}
            className="inline-flex shrink-0 items-center gap-0.5 font-bold text-white underline decoration-white/60 underline-offset-4"
          >
            {item.linkText}
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-blue-700 text-white">
      <Swiper
        modules={[Autoplay, A11y]}
        slidesPerView={1}
        loop
        speed={700}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        allowTouchMove
        className="w-full"
      >
        {announcements.map((item) => {
          const Icon = item.icon;

          return (
            <SwiperSlide key={item.id}>
              <div className="flex min-h-10 w-full items-center justify-center px-3 sm:px-6">
                <div className="flex w-full items-center justify-center gap-2 text-[10px] font-medium sm:gap-3 sm:text-xs">
                  <Icon
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 text-blue-100"
                  />

                  <p className="min-w-0 text-center">
                    {item.message}{" "}
                    <span className="font-bold text-white">
                      {item.highlight}
                    </span>
                  </p>

                  <Link
                    href={item.link}
                    className="inline-flex shrink-0 items-center gap-0.5 font-bold text-white underline decoration-white/60 underline-offset-4 transition hover:text-blue-200"
                  >
                    {item.linkText}
                    <ChevronRight size={14} />
                  </Link>

                  <Sparkles
                    size={14}
                    className="hidden shrink-0 text-blue-200 sm:block"
                  />
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
