"use client";

import { useMemo } from "react";
import {
  FileText,
  SlidersHorizontal,
  Sparkles,
  Truck,
  MessageSquareText,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

import ProductDescription from "./ProductDescription";
import ProductSpecifications from "./ProductSpecifications";
import ReviewSection from "@/components/reviews/ReviewSection";

export default function ProductDetailTabs({
  product,
  specifications = [],
  activeTab,
  setActiveTab,
  isAuthenticated,
  onRequireLogin,
}) {
  const hasDescription =
    typeof product?.description === "string" && product.description.trim() !== "";

  const validSpecs = useMemo(
    () =>
      (Array.isArray(specifications) ? specifications : []).filter((item) => {
        const [k, v] = Array.isArray(item) ? item : [item?.key, item?.value];
        return k != null && v != null && String(k).trim() !== "" && String(v).trim() !== "";
      }),
    [specifications]
  );

  const features = useMemo(() => {
    if (Array.isArray(product?.features)) {
      return product.features.filter((f) => typeof f === "string" && f.trim());
    }
    return [];
  }, [product?.features]);

  const reviewCount = Number(
    product?.ratings?.count ?? product?.rating?.count ?? 0
  );

  const tabs = useMemo(() => {
    const list = [];
    if (hasDescription) {
      list.push({ id: "description", label: "Description", icon: FileText });
    }
    if (validSpecs.length > 0) {
      list.push({
        id: "specifications",
        label: `Specifications (${validSpecs.length})`,
        icon: SlidersHorizontal,
      });
    }
    if (features.length > 0) {
      list.push({ id: "features", label: "Features", icon: Sparkles });
    }
    list.push({
      id: "reviews",
      label: reviewCount > 0 ? `Reviews (${reviewCount})` : "Reviews",
      icon: MessageSquareText,
    });
    list.push({
      id: "shipping",
      label: "Shipping & Returns",
      icon: Truck,
    });
    return list;
  }, [hasDescription, validSpecs.length, features.length, reviewCount]);

  const resolvedTab = tabs.some((t) => t.id === activeTab)
    ? activeTab
    : tabs[0]?.id || "reviews";

  return (
    <section
      id="reviews-section"
      aria-label="Detailed product information"
      className="mt-12 border-t border-[#E2E8F0] pt-8 sm:mt-14 sm:pt-10"
    >
      {/* Scrollable Tab Header */}
      <div
        role="tablist"
        aria-label="Product sections"
        className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2.5"
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = resolvedTab === id;

          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${id}`}
              id={`tab-${id}`}
              onClick={() => setActiveTab?.(id)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-4 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 sm:text-sm ${
                isActive
                  ? "border-[#0755E9] bg-[#0755E9] text-white shadow-xs"
                  : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
              }`}
            >
              <Icon size={15} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <div className="mt-5">
        {resolvedTab === "description" && hasDescription && (
          <div
            role="tabpanel"
            id="panel-description"
            aria-labelledby="tab-description"
          >
            <ProductDescription description={product.description} embedded />
          </div>
        )}

        {resolvedTab === "specifications" && validSpecs.length > 0 && (
          <div
            role="tabpanel"
            id="panel-specifications"
            aria-labelledby="tab-specifications"
          >
            <ProductSpecifications specifications={validSpecs} embedded />
          </div>
        )}

        {resolvedTab === "features" && features.length > 0 && (
          <div
            role="tabpanel"
            id="panel-features"
            aria-labelledby="tab-features"
            className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-6"
          >
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {features.map((feature, index) => (
                <li
                  key={`feature-${index}`}
                  className="flex items-start gap-2.5 text-sm text-[#101828]"
                >
                  <CheckCircle2
                    size={16}
                    className="mt-1 shrink-0 text-[#0755E9]"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {resolvedTab === "reviews" && (
          <div
            role="tabpanel"
            id="panel-reviews"
            aria-labelledby="tab-reviews"
          >
            <ReviewSection
              productId={product?._id}
              isAuthenticated={isAuthenticated}
              onRequireLogin={onRequireLogin}
            />
          </div>
        )}

        {resolvedTab === "shipping" && (
          <div
            role="tabpanel"
            id="panel-shipping"
            aria-labelledby="tab-shipping"
            className="grid grid-cols-1 gap-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:grid-cols-3 sm:p-6"
          >
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
                <Truck size={18} aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[#101828]">
                Standard Shipping
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                Orders are dispatched securely from ELENZO fulfillment centers. Exact delivery address verification happens cleanly during checkout.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
                <RotateCcw size={18} aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[#101828]">
                Return &amp; Support Policy
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                Eligible defective or damaged items can be raised through your ELENZO Order History for assistance and resolution.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
                <ShieldCheck size={18} aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[#101828]">
                Payment Protection
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                Every transaction supports encrypted Razorpay online payment as well as Cash on Delivery where eligible.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

