
"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Package } from "lucide-react";

export default function CategoryCard({
  category,
  index = 0,
  href,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.35,
        delay: (index % 5) * 0.04,
      }}
    >
      <Link
        href={href || `/categories/${category._id}`}
        className="group block h-full overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5"
      >
        {/* Category Image */}
        <div className="relative flex aspect-[1.2/1] items-center justify-center overflow-hidden bg-white p-5 sm:p-7">
          {category.image?.url ? (
            <img
              src={category.image.url}
              alt={category.name || "Category"}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <Package
              size={48}
              strokeWidth={1}
              className="text-slate-300"
            />
          )}

          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-all duration-300 group-hover:bg-[#0755E9] group-hover:text-white">
            <ArrowUpRight size={16} />
          </span>
        </div>

        {/* Category Details */}
        <div className="p-3 sm:p-4">
          <h3 className="truncate text-sm font-bold text-[#101828] transition-colors group-hover:text-[#0755E9] sm:text-base">
            {category.name}
          </h3>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 sm:text-xs">
              Explore collection
            </span>

            <span className="text-xs font-semibold text-[#0755E9]">
              Explore
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
