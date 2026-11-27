
"use client";

import Link from "next/link";
import { useState } from "react";

import {
  ChevronDown,
  ChevronRight,
  Smartphone,
  Headphones,
  BatteryCharging,
  Cable,
  ShieldCheck,
  Watch,
  Speaker,
  Gamepad2,
  LayoutGrid,
} from "lucide-react";

const categories = [
  {
    name: "Phone Cases",
    slug: "phone-cases",
    icon: Smartphone,
    description: "Stylish cases and covers",
  },
  {
    name: "Screen Protectors",
    slug: "screen-protectors",
    icon: ShieldCheck,
    description: "Protect your phone screen",
  },
  {
    name: "Chargers & Adapters",
    slug: "chargers-adapters",
    icon: BatteryCharging,
    description: "Fast charging accessories",
  },
  {
    name: "Cables",
    slug: "cables",
    icon: Cable,
    description: "USB-C, Lightning and more",
  },
  {
    name: "Audio & Earphones",
    slug: "audio-earphones",
    icon: Headphones,
    description: "Premium audio experience",
  },
  {
    name: "Smart Watches",
    slug: "smart-watches",
    icon: Watch,
    description: "Smart wearables",
  },
  {
    name: "Speakers",
    slug: "speakers",
    icon: Speaker,
    description: "Portable Bluetooth speakers",
  },
  {
    name: "Gaming Accessories",
    slug: "gaming-accessories",
    icon: Gamepad2,
    description: "Accessories for gaming",
  },
];

export default function CategoryDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative hidden xl:block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={`flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-200 ${
          isOpen
            ? "bg-blue-50 text-blue-700"
            : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        <LayoutGrid size={18} />

        All Categories

        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      <div
        className={`absolute left-0 top-full z-50 w-[620px] pt-3 transition-all duration-200 ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl shadow-slate-900/10">

          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Shop by Category
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Find the perfect accessories for your device
              </p>
            </div>

            <Link
              href="/categories"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
              onClick={() => setIsOpen(false)}
            >
              View All
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-blue-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-all duration-200 group-hover:bg-blue-100 group-hover:text-blue-600">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-blue-700">
                      {category.name}
                    </h4>

                    <p className="mt-1 truncate text-[11px] text-slate-400">
                      {category.description}
                    </p>
                  </div>

                  <ChevronRight
                    size={15}
                    className="shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600"
                  />
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
            <div>
              <p className="text-xs font-bold text-slate-800">
                Explore ELENZO
              </p>

              <p className="mt-1 text-[11px] text-slate-500">
                Everything your device needs
              </p>
            </div>

            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Shop Now
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
