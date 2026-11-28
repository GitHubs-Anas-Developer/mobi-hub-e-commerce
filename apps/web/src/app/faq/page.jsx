import { Suspense } from "react";
import Link from "next/link";
import { HelpCircle, MessageSquareText, ShoppingBag, ArrowRight } from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import FaqExplorer from "@/components/faq/FaqExplorer";
import { BRAND_NAME } from "@/config/brand";

export const metadata = {
  title: "Frequently Asked Questions",
  description: `Find quick answers about shopping, orders, payments, shipping, returns, cancellations, and accounts at ${BRAND_NAME}.`,
  alternates: { canonical: "/faq" },
};

function FaqFallback() {
  return (
    <div className="space-y-4" aria-label="Loading FAQs" aria-busy="true">
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
        <div className="h-12 w-full animate-pulse rounded-xl bg-[#F8FAFC]" />
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 animate-pulse rounded-full bg-slate-100"
            />
          ))}
        </div>
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-2xl border border-[#E2E8F0] bg-white"
        />
      ))}
    </div>
  );
}

export default function FaqPage() {
  return (
    <main className="min-h-screen w-full bg-[#F8FAFC] pb-24 xl:pb-12">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <Breadcrumb items={[{ label: "FAQ" }]} className="mb-4" />

        {/* FAQ Hero Section */}
        <section className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#0755E9]/20 bg-[#EFF6FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0755E9]">
                <HelpCircle size={13} aria-hidden="true" />
                <span>{BRAND_NAME} Help Center</span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl lg:text-4xl">
                Frequently Asked Questions
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-[#64748B] sm:text-base">
                Find quick answers about shopping, payments, orders, delivery and
                more.
              </p>
            </div>

            <Link
              href="/account/orders"
              className="inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
            >
              Track My Orders
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Interactive Search, Topic Tabs & Accordion */}
        <Suspense fallback={<FaqFallback />}>
          <FaqExplorer />
        </Suspense>

        {/* Bottom Contact CTA */}
        <section className="mt-8 rounded-2xl border border-[#082B70] bg-[#082B70] p-6 text-white sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <h2 className="text-xl font-extrabold sm:text-2xl">
                Still need help?
              </h2>
              <p className="mt-2 text-sm text-blue-100">
                Our team is ready to help with your questions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-sm font-bold text-white transition hover:bg-[#0645C4]"
              >
                <MessageSquareText size={16} aria-hidden="true" />
                Contact Us
              </Link>

              <Link
                href="/products"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/20"
              >
                <ShoppingBag size={16} aria-hidden="true" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

