import Link from "next/link";
import {
  Mail,
  Phone,
  Clock3,
  MapPin,
  ArrowRight,
  HelpCircle,
  MessageSquareText,
  ShoppingBag,
} from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import ContactForm from "@/components/contact/ContactForm";
import { FEATURED_FAQS } from "@/components/info/faqData";
import { BRAND_NAME, BRAND_SUPPORT_EMAIL } from "@/config/brand";

export const metadata = {
  title: "Contact Us",
  description: `Get in touch with ${BRAND_NAME} support for questions about gadgets, electronics orders, returns, and assistance.`,
};

export default function ContactPage() {
  return (
    <main className="min-h-screen w-full bg-[#F8FAFC] pb-24 xl:pb-12">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <Breadcrumb items={[{ label: "Contact Us" }]} className="mb-4" />

        {/* Hero Section */}
        <section className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0755E9]/20 bg-[#EFF6FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0755E9]">
                <MessageSquareText size={13} aria-hidden="true" />
                <span>{BRAND_NAME} Customer Support</span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl lg:text-4xl">
                Let&apos;s Talk. We&apos;re Here to Help.
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-base">
                Have a question about a product, your order or need assistance?
                Our team is here to help.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:max-w-md lg:w-[340px]">
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
                  <Mail size={19} aria-hidden="true" />
                </div>
                <p className="mt-3 text-xs font-extrabold text-[#101828]">
                  Email Support
                </p>
                <p className="mt-0.5 truncate text-[11px] text-[#64748B]">
                  {BRAND_SUPPORT_EMAIL}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
                  <HelpCircle size={19} aria-hidden="true" />
                </div>
                <p className="mt-3 text-xs font-extrabold text-[#101828]">
                  Self-Service
                </p>
                <Link
                  href="/faq"
                  className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#0755E9] hover:underline"
                >
                  Browse FAQs
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information Cards */}
        <section
          aria-label="Contact options"
          className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Email Support */}
          <div className="flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
              <Mail size={20} aria-hidden="true" />
            </div>

            <h2 className="mt-4 text-base font-extrabold text-[#101828]">
              Email Support
            </h2>

            <p className="mt-1 break-all text-sm font-bold text-[#0755E9]">
              {BRAND_SUPPORT_EMAIL}
            </p>

            <p className="mt-2 flex-1 text-xs leading-5 text-[#64748B]">
              Reach out for order updates, returns, or product inquiries.
            </p>

            <a
              href={`mailto:${BRAND_SUPPORT_EMAIL}?subject=${encodeURIComponent(
                `${BRAND_NAME} Customer Support Inquiry`
              )}`}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white transition hover:bg-[#0645C4]"
            >
              Send Email
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>

          {/* Phone Support (not yet configured in project settings) */}
          <div className="flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
              <Phone size={20} aria-hidden="true" />
            </div>

            <h2 className="mt-4 text-base font-extrabold text-[#101828]">
              Phone Support
            </h2>

            <p className="mt-1 text-sm font-semibold text-[#64748B]">
              Not published yet
            </p>

            <p className="mt-2 flex-1 text-xs leading-5 text-[#64748B]">
              Direct phone support is currently unavailable. Please contact us
              via {BRAND_SUPPORT_EMAIL} for assistance.
            </p>
          </div>

          {/* Business Hours */}
          <div className="flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
              <Clock3 size={20} aria-hidden="true" />
            </div>

            <h2 className="mt-4 text-base font-extrabold text-[#101828]">
              Business Hours
            </h2>

            <p className="mt-1 text-sm font-semibold text-[#64748B]">
              Standard support schedule pending
            </p>

            <p className="mt-2 flex-1 text-xs leading-5 text-[#64748B]">
              Official customer care hours are not yet published. You can
              always check live order status in My Orders.
            </p>
          </div>

          {/* Location */}
          <div className="flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
              <MapPin size={20} aria-hidden="true" />
            </div>

            <h2 className="mt-4 text-base font-extrabold text-[#101828]">
              Store Region
            </h2>

            <p className="mt-1 text-sm font-bold text-[#101828]">India</p>

            <p className="mt-2 flex-1 text-xs leading-5 text-[#64748B]">
              Online electronics store. A physical office or walk-in address is
              not published.
            </p>
          </div>
        </section>

        {/* Contact Form + FAQ Preview */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <ContactForm />

          <aside className="space-y-6">
            {/* Quick FAQ Preview */}
            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-6">
              <div className="mb-4 flex items-center gap-2.5 border-b border-[#E2E8F0] pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
                  <HelpCircle size={19} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#101828]">
                    Looking for a quick answer?
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Popular topics from our Help Center
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {FEATURED_FAQS.map((item) => (
                  <Link
                    key={item.id}
                    href={`/faq?category=${item.category}`}
                    className="group flex items-start justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 transition hover:border-[#0755E9]/35 hover:bg-[#EFF6FF]"
                  >
                    <span className="text-xs font-bold leading-5 text-[#101828] group-hover:text-[#082B70]">
                      {item.question}
                    </span>
                    <ArrowRight
                      size={14}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-[#64748B] transition group-hover:translate-x-0.5 group-hover:text-[#0755E9]"
                    />
                  </Link>
                ))}
              </div>

              <Link
                href="/faq"
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#0755E9]/25 bg-[#EFF6FF] px-4 text-xs font-bold text-[#0755E9] transition hover:bg-[#0755E9] hover:text-white"
              >
                View All FAQs
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </section>
          </aside>
        </div>

        {/* Contact CTA */}
        <section className="mt-8 rounded-2xl border border-[#082B70] bg-[#082B70] p-6 text-white sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <h2 className="text-xl font-extrabold sm:text-2xl">
                Need help choosing the right gadget?
              </h2>
              <p className="mt-2 text-sm text-blue-100">
                We&apos;re happy to help you find the right product across our
                electronics catalog.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-sm font-bold text-white transition hover:bg-[#0645C4]"
              >
                <ShoppingBag size={16} aria-hidden="true" />
                Shop Now
              </Link>
              <Link
                href="/categories"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

