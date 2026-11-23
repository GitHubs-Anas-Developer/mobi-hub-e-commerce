
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Package } from "lucide-react";

export default function CategoryCard({
  category,
  index = 0,
  href,
}) {
  const reduceMotion = useReducedMotion();
  const [imageError, setImageError] = useState(false);

  const imageUrl =
    typeof category?.image === "string"
      ? category.image
      : category?.image?.url ||
        category?.image?.secure_url ||
        "";

  const categoryName = category?.name || "Category";

  const categoryHref =
    href ||
    (category?._id
      ? `/categories/${category._id}`
      : "/categories");

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : { opacity: 0, y: 18 }
      }
      whileInView={
        reduceMotion
          ? undefined
          : { opacity: 1, y: 0 }
      }
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.45,
        delay: reduceMotion ? 0 : (index % 5) * 0.05,
        ease: "easeOut",
      }}
      className="h-full"
    >
      <Link
        href={categoryHref}
        aria-label={`Explore ${categoryName}`}
        className="
          group flex h-full flex-col
          rounded-2xl bg-white
          p-2.5
          transition-all duration-300
          hover:-translate-y-1
          hover:shadow-[0_12px_35px_rgba(16,24,40,0.07)]
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#0755E9]
          focus-visible:ring-offset-2
          sm:rounded-3xl sm:p-3
        "
      >
        {/* Product Image */}
        <div
          className="
            relative flex aspect-square
            items-center justify-center
            overflow-hidden rounded-xl
            bg-[#F8FAFC]
            sm:rounded-2xl
          "
        >
          {/* Small label */}
          <span
            className="
              absolute left-3 top-3 z-10
              rounded-full bg-white
              px-2.5 py-1
              text-[9px] font-semibold
              uppercase tracking-[0.14em]
              text-slate-400
              shadow-sm
            "
          >
            Collection
          </span>

          {/* Image */}
          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={categoryName}
              fill
              sizes="
                (max-width: 640px) 45vw,
                (max-width: 1024px) 30vw,
                20vw
              "
              unoptimized
              onError={() => setImageError(true)}
              className="
                object-contain
                p-5 sm:p-7
                transition-transform duration-700
                ease-out
                group-hover:scale-110
              "
            />
          ) : (
            <Package
              size={52}
              strokeWidth={1}
              className="text-slate-300"
              aria-hidden="true"
            />
          )}

          {/* Arrow */}
          <span
            className="
              absolute bottom-3 right-3
              flex h-9 w-9 items-center
              justify-center rounded-full
              bg-white text-[#0755E9]
              shadow-sm
              transition-all duration-300
              group-hover:bg-[#0755E9]
              group-hover:text-white
              group-hover:rotate-45
            "
          >
            <ArrowUpRight
              size={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          </span>
        </div>

        {/* Category Details */}
        <div className="px-1 pb-2 pt-4">
          {/* Blue accent */}
          <div
            className="
              mb-3 h-[3px] w-7
              rounded-full bg-[#0755E9]
              transition-all duration-300
              group-hover:w-12
            "
          />

          <h3
            className="
              line-clamp-1
              text-sm font-bold
              tracking-tight text-[#101828]
              transition-colors duration-300
              group-hover:text-[#0755E9]
              sm:text-base
            "
          >
            {categoryName}
          </h3>

          <p className="mt-1 text-xs text-[#94A3B8]">
            Explore the collection
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
