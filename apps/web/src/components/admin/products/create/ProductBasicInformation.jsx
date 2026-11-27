"use client";

import { Card, Input, Select } from "antd";

export default function ProductBasicInformation({
  formData,
  categories,
  brands = [],
  brandsLoading = false,
  onChange,
}) {
  const triggerSynthetic = (name, value) => {
    onChange({ target: { name, value } });
  };

  return (
    <Card
      className="!border-[#E2E8F0]"
      title={
        <div>
          <h3 className="!m-0 text-base font-bold text-[#101828]">
            Basic Information
          </h3>
          <p className="mt-0.5 text-xs font-normal text-[#64748B]">
            Enter product title, brand, category, and rich description.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748B]">
            Product Name *
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="e.g. Apple AirPods Pro (2nd Gen)"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748B]">
            Brand *
          </label>
          <Select
            showSearch
            optionFilterProp="label"
            className="w-full"
            value={formData.brand || undefined}
            loading={brandsLoading}
            disabled={brandsLoading || brands.length === 0}
            placeholder={
              brandsLoading
                ? "Loading brands..."
                : brands.length === 0
                  ? "No active brands available"
                  : "Select a brand"
            }
            onChange={(val) => triggerSynthetic("brand", val || "")}
            options={brands.map((brand) => ({
              value: brand.name,
              label: brand.name,
            }))}
          />
          {brands.length === 0 && !brandsLoading && (
            <p className="mt-1 text-xs text-amber-600">
              Please create and activate a brand before adding a product.
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748B]">
            Category *
          </label>
          <Select
            showSearch
            optionFilterProp="label"
            className="w-full"
            value={formData.category || undefined}
            placeholder="Select a category"
            onChange={(val) => triggerSynthetic("category", val || "")}
            options={categories.map((cat) => ({
              value: cat._id,
              label: cat.parentCategory?.name
                ? `${cat.parentCategory.name} -> ${cat.name}`
                : cat.name,
            }))}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748B]">
            Description *
          </label>
          <Input.TextArea
            name="description"
            rows={4}
            value={formData.description}
            onChange={onChange}
            placeholder="Describe key features, materials, compatibility, and box contents..."
          />
        </div>
      </div>
    </Card>
  );
}
