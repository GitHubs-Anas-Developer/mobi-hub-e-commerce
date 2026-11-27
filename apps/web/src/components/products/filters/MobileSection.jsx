"use client";

export default function MobileSection({
  title,
  subtitle,
  icon: Icon,
  children,
}) {
  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
      <div className="mb-3.5 flex items-center gap-2.5">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
            <Icon size={17} aria-hidden="true" />
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#101828]">{title}</h3>
          {subtitle && (
            <p className="text-[11px] text-[#64748B]">{subtitle}</p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}
