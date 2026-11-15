
"use client";

import { useState } from "react";
import Image from "next/image";

import { motion, useReducedMotion } from "motion/react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, A11y } from "swiper/modules";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "swiper/css";
import "swiper/css/effect-fade";

const banners = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=85",
    alt: "Premium headphones",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=1600&q=85",
    alt: "Premium mobile accessories",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1600&q=85",
    alt: "Wireless earbuds",
  },
];

export default function ShopBanner() {
  const [swiper, setSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const shouldReduceMotion = useReducedMotion();

  const initialState = shouldReduceMotion
    ? false
    : {
        opacity: 0,
        y: 20,
      };

  const handlePrevious = () => {
    swiper?.slidePrev();
  };

  const handleNext = () => {
    swiper?.slideNext();
  };

  const handleIndicatorClick = (index) => {
    swiper?.slideToLoop(index);
  };

  return (
    <motion.section
      initial={initialState}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.6,
        ease: "easeOut",
      }}
      className="relative mb-6 w-full min-w-0 overflow-hidden rounded-xl bg-slate-100 sm:rounded-2xl"
      aria-label="Featured shopping banners"
    >
      {/* Banner Slider */}
      <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[16/6] lg:aspect-[16/5.5]">

        <Swiper
          modules={[Autoplay, EffectFade, A11y]}
          onSwiper={setSwiper}
          onSlideChange={(instance) =>
            setActiveIndex(instance.realIndex)
          }
          slidesPerView={1}
          effect="fade"
          fadeEffect={{
            crossFade: true,
          }}
          loop
          speed={900}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          allowTouchMove
          className="h-full w-full"
        >
          {banners.map((banner, index) => (
            <SwiperSlide
              key={banner.id}
              className="h-full overflow-hidden"
            >
              {/* Animated Banner Image */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? { scale: 1 }
                    : {
                        scale:
                          activeIndex === index ? 1.06 : 1,
                      }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 5,
                  ease: "linear",
                }}
                className="absolute inset-0"
              >
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  className="object-cover"
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrevious}
          aria-label="Previous banner"
          className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/90 text-slate-800 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white sm:left-4 sm:h-10 sm:w-10"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next banner"
          className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/90 text-slate-800 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white sm:right-4 sm:h-10 sm:w-10"
        >
          <ChevronRight size={20} />
        </button>

        {/* Custom Indicators */}
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-5">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`Go to banner ${index + 1}`}
              aria-current={
                activeIndex === index ? "true" : undefined
              }
              onClick={() => handleIndicatorClick(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? "w-7 bg-blue-600"
                  : "w-2 bg-white/80 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
