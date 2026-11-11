
"use client";

export default function ProductBasicInformation({
  formData,
  categories,
  brands = [],
  brandsLoading = false,
  onChange,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Basic Information
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Enter the basic details of your product.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Product Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Product Name *
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Enter product name"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Brand *
          </label>

          <select
            name="brand"
            value={formData.brand}
            onChange={onChange}
            required
            disabled={brandsLoading || brands.length === 0}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {brandsLoading
                ? "Loading brands..."
                : brands.length === 0
                  ? "No active brands available"
                  : "Select a brand"}
            </option>

            {brands.map((brand) => (
              <option key={brand._id} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>

          {brands.length === 0 && !brandsLoading && (
            <p className="mt-1.5 text-xs text-amber-600">
              Please create and activate a brand before adding a product.
            </p>
          )}
        </div>

        {/* Category */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category *
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={onChange}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select a category</option>

            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description *
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="Write a detailed product description..."
            rows={5}
            required
            className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </section>
  );
}
