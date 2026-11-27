import Image from "next/image";
import Link from "next/link";
import {
  Target,
  Compass,
  CheckCircle2,
  ShoppingBag,
  Layers3,
  ShieldCheck,
  Truck,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import AboutCategoriesShowcase from "@/components/about/AboutCategoriesShowcase";
import { BRAND_ASSETS, BRAND_NAME } from "@/config/brand";

export const metadata = {
  title: "About Us",
  description: `Learn about ${BRAND_NAME}, our mission, vision, and approach to making everyday gadgets and electronics simple to shop.`,
};

const WHY_CHOOSE_FEATURES = [
  {
    icon: Sparkles,
    title: "Carefully Selected Products",
    description:
      "Curated electronics, smartphones, audio gear, charging essentials, and everyday tech accessories.",
  },
  {
    icon: ShoppingBag,
    title: "Convenient Online Shopping",
    description:
      "Streamlined browsing, cart management, wishlists, and saved addresses built for mobile and desktop.",
  },
  {
    icon: Layers3,
    title: "Easy Product Discovery",
    description:
      "Structured departments, subcategories, instant search suggestions, and brand and price filtering.",
  },
  {
    icon: Users,
    title: "Customer-Focused Experience",
    description:
      "Clear product pricing, variant details, order summaries, and dedicated customer support access.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    description:
      "Supports verified online checkout via Razorpay as well as Cash on Delivery at checkout.",
  },
  {
    icon: Truck,
    title: "Order Tracking",
    description:
      "Follow confirmed orders with milestone tracking and courier updates directly in My Orders.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full bg-[#F8FAFC] pb-24 xl:pb-12">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <Breadcrumb items={[{ label: "About Us" }]} className="mb-4" />

        {/* Hero Section */}
        <section className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8 lg:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.25fr)_380px]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0755E9]/20 bg-[#EFF6FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0755E9]">
                <span>About {BRAND_NAME}</span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-4xl lg:text-[42px] lg:leading-[1.12]">
                Technology That Fits Your Lifestyle.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#64748B] sm:text-base">
                Discover gadgets and electronics selected to make everyday life
                smarter, easier and more connected.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-sm font-bold text-white transition hover:bg-[#0645C4]"
                >
                  <ShoppingBag size={16} aria-hidden="true" />
                  Shop Collection
                </Link>

                <Link
                  href="/categories"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 text-sm font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                >
                  Explore Categories
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
              <div className="flex items-center gap-4 border-b border-[#E2E8F0] pb-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-xs">
                  <Image
                    src={BRAND_ASSETS.icon}
                    alt={`${BRAND_NAME} emblem`}
                    width={48}
                    height={48}
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <div>
                  <p className="text-lg font-extrabold tracking-tight text-[#101828]">
                    {BRAND_NAME}
                  </p>
                  <p className="text-xs font-semibold text-[#0755E9]">
                    Gadgets &amp; Electronics Store
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-3">
                {[
                  "Smart everyday devices & tech accessories",
                  "Clear specifications, pricing & live stock",
                  "Dedicated order tracking & support access",
                ].map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-xs font-medium text-[#101828]"
                  >
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-[#0755E9]"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Brand Story */}
        <section className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8">
          <div className="max-w-3xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0755E9]">
              Who We Are
            </span>
            <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-[#101828] sm:text-2xl">
              Our Story
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#64748B] sm:text-base">
              <p>
                {BRAND_NAME} is a gadget and electronics shopping destination
                focused on bringing useful technology and everyday accessories
                together in one convenient place.
              </p>
              <p>
                Our goal is to make discovering and shopping for gadgets simple,
                accessible and enjoyable.
              </p>
            </div>
          </div>
        </section>

        {/* Our Mission & Vision */}
        <section
          aria-label="Mission and vision"
          className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
              <Target size={21} aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-extrabold text-[#101828] sm:text-xl">
              Our Mission
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              To make discovering and shopping for useful technology simple and
              convenient.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
              <Compass size={21} aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-extrabold text-[#101828] sm:text-xl">
              Our Vision
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              To become a trusted destination for gadgets and electronics
              through a customer-focused shopping experience.
            </p>
          </div>
        </section>

        {/* Why Choose ELENZO */}
        <section className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8">
          <div className="mb-6 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0755E9]">
              Store Experience
            </span>
            <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-[#101828] sm:text-2xl">
              Why Choose {BRAND_NAME}?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 transition hover:border-[#0755E9]/35 hover:bg-white hover:shadow-xs"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
                    <Icon size={19} aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-sm font-extrabold text-[#101828] sm:text-base">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-[#64748B] sm:text-sm sm:leading-6">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Product Categories Showcase */}
        <section className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8">
          <div className="mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0755E9]">
              Browse Departments
            </span>
            <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-[#101828] sm:text-2xl">
              Product Categories
            </h2>
            <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
              Explore live product categories available in the {BRAND_NAME} store.
            </p>
          </div>

          <AboutCategoriesShowcase />
        </section>

        {/* Closing Section */}
        <section className="rounded-2xl border border-[#082B70] bg-[#082B70] p-6 text-white sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <h2 className="text-xl font-extrabold sm:text-2xl lg:text-3xl">
                Discover Something Smarter.
              </h2>
              <p className="mt-2 text-sm text-blue-100 sm:text-base">
                Explore the {BRAND_NAME} collection and find technology that
                fits your everyday needs.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-sm font-bold text-white transition hover:bg-[#0645C4]"
              >
                <ShoppingBag size={16} aria-hidden="true" />
                Shop Now
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

