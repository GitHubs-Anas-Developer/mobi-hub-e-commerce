
export default function ProductDescription({ description }) {
  return (
    <section className="mt-16 border-t border-[#E2E8F0] pt-10">
      <h2 className="text-xl font-extrabold text-[#0F172A]">
        Product Description
      </h2>

      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
        {description || "No description available."}
      </p>
    </section>
  );
}
