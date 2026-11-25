"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const BackButton = ({
  label = "Back to Products",
  fallbackUrl = "/products",
  className = "",
  showLabel = true,
  disabled = false,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (disabled) return;

    router.push(fallbackUrl);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      disabled={disabled}
      aria-label={label}
      className={`
        group flex w-full min-h-12
        items-center justify-start
        gap-2 rounded-lg
        border border-slate-200
        bg-white px-2.5 py-2
        text-xs font-semibold
        text-[#101828]
        shadow-sm
        transition-all duration-200 ease-in-out

        hover:border-[#0755e9]
        hover:bg-[#f8fbff]
        hover:shadow-md

        active:scale-[0.99]

        disabled:cursor-not-allowed
        disabled:opacity-50

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#0755e9]
        focus-visible:ring-offset-2

        ${className}
      `}
    >
      {/* Icon */}
      <span
        className="
          flex h-8 w-8 shrink-0
          items-center justify-center
          rounded-md
          border border-[#dbeafe]
          bg-[#eff6ff]
          text-[#0755e9]
          transition-all duration-200

          group-hover:border-[#0755e9]
          group-hover:bg-[#0755e9]
          group-hover:text-white
        "
      >
        <ArrowLeft
          size={16}
          strokeWidth={2.2}
          className="
            transition-transform duration-200
            group-hover:-translate-x-0.5
          "
        />
      </span>

      {/* Label */}
      {showLabel && (
        <span className="whitespace-nowrap">
          {label}
        </span>
      )}
    </button>
  );
};

export default BackButton;