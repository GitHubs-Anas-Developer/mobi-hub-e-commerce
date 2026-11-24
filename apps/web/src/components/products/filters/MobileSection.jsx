
"use client";

export default function MobileSection({
  title,
  subtitle,
  icon: Icon,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={17} />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {title}
          </h3>

          <p className="text-[10px] text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}
