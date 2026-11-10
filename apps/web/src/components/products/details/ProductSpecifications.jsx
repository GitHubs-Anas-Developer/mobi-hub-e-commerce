
export default function ProductSpecifications({ specifications = [] }) {
  if (specifications.length === 0) return null;

  return (
    <section className="mt-12 border-t border-[#E2E8F0] pt-10">
      <h2 className="text-xl font-extrabold text-[#0F172A]">
        Technical Specifications
      </h2>

      <div className="mt-5 overflow-hidden rounded-xl border border-[#E2E8F0]">
        {specifications.map(([key, value], index) => (
          <div
            key={key}
            className={`grid grid-cols-1 gap-2 p-4 sm:grid-cols-3 ${
              index % 2 === 0 ? "bg-slate-50" : "bg-white"
            }`}
          >
            <span className="text-sm font-semibold text-[#0F172A]">
              {key}
            </span>

            <span className="text-sm text-slate-600 sm:col-span-2">
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
