import Link from "next/link";
import {
  FileText,
  Mail,
  MessageSquareText,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import PolicyTableOfContents from "@/components/policies/PolicyTableOfContents";
import {
  POLICY_BUSINESS_CONFIG,
  POLICY_LINKS,
} from "@/components/policies/policyConfig";

export default function PolicyPageShell({
  activeId,
  title,
  introduction,
  sections = [],
}) {
  const { brandName, supportEmail, effectiveDate } = POLICY_BUSINESS_CONFIG;

  return (
    <main className="min-h-screen w-full bg-[#F8FAFC] pb-24 xl:pb-12">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: "Policies", href: "/privacy-policy" },
            { label: title },
          ]}
          className="mb-4"
        />

        {/* Policy Hero Header */}
        <header className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#0755E9]/20 bg-[#EFF6FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0755E9]">
                <FileText size={13} aria-hidden="true" />
                <span>{brandName} Legal &amp; Store Policies</span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl lg:text-4xl">
                {title}
              </h1>

              <p className="mt-2.5 text-sm leading-relaxed text-[#64748B] sm:text-base">
                {introduction}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs">
              <span className="font-semibold text-[#64748B]">
                Effective Status
              </span>
              <span className="font-extrabold text-[#101828]">
                {effectiveDate || "Current Published Policy"}
              </span>
              <span className="text-[11px] text-[#64748B]">
                Support:{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="font-bold text-[#0755E9] hover:underline"
                >
                  {supportEmail}
                </a>
              </span>
            </div>
          </div>

          {/* Quick Policy Switcher */}
          <nav
            aria-label="Store policy documents"
            className="mt-6 flex items-center gap-2 overflow-x-auto border-t border-[#E2E8F0] pt-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap"
          >
            {POLICY_LINKS.map((policy) => {
              const active = policy.id === activeId;
              return (
                <Link
                  key={policy.id}
                  href={policy.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-xs font-bold transition ${
                    active
                      ? "border-[#0755E9] bg-[#0755E9] text-white shadow-xs"
                      : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                  }`}
                >
                  {policy.title}
                </Link>
              );
            })}
          </nav>
        </header>

        {/* Main 2-Column Policy Layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          {/* Left Column: TOC + Support Snippet */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <PolicyTableOfContents sections={sections} />

            <div className="hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs lg:block">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#101828]">
                Questions?
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-[#64748B]">
                Contact {brandName} Support for clarification on orders,
                returns, or policies.
              </p>
              <a
                href={`mailto:${supportEmail}`}
                className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-[#EFF6FF] px-3 text-xs font-bold text-[#0755E9] transition hover:bg-[#0755E9] hover:text-white"
              >
                <Mail size={13} aria-hidden="true" />
                {supportEmail}
              </a>
            </div>
          </aside>

          {/* Right Column: Readable Policy Document */}
          <div className="min-w-0 space-y-4">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-8">
              <div className="divide-y divide-[#E2E8F0]">
                {sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28 py-6 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#0755E9]">
                        {section.number}.
                      </span>
                      <h2 className="text-lg font-extrabold tracking-tight text-[#101828] sm:text-xl">
                        {section.title}
                      </h2>
                    </div>

                    {Array.isArray(section.paragraphs) &&
                      section.paragraphs.map((text, idx) => (
                        <p
                          key={idx}
                          className="mt-3 text-sm leading-7 text-[#64748B]"
                        >
                          {text}
                        </p>
                      ))}

                    {Array.isArray(section.bullets) &&
                      section.bullets.length > 0 && (
                        <ul className="mt-3.5 space-y-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                          {section.bullets.map((bullet, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2.5 text-xs leading-6 text-[#101828] sm:text-sm"
                            >
                              <CheckCircle2
                                size={15}
                                className="mt-1 shrink-0 text-[#0755E9]"
                                aria-hidden="true"
                              />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                  </section>
                ))}
              </div>
            </div>

            {/* Policy Bottom CTA */}
            <section className="rounded-2xl border border-[#082B70] bg-[#082B70] p-6 text-white sm:p-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-extrabold sm:text-xl">
                    Need help regarding this policy?
                  </h2>
                  <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                    Reach our team anytime or check our Help Center for quick
                    answers.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <Link
                    href="/contact"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white transition hover:bg-[#0645C4]"
                  >
                    <MessageSquareText size={14} aria-hidden="true" />
                    Contact Us
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-xs font-bold text-white transition hover:bg-white/20"
                  >
                    <ShoppingBag size={14} aria-hidden="true" />
                    Shop Gadgets
                    <ArrowRight size={13} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

