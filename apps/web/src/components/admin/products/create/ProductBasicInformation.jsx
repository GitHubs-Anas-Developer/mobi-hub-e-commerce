"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Alert, Card, Collapse, Input, Select, Tag, InputNumber, Switch } from "antd";
import { FolderTree, Globe, Info, Truck } from "lucide-react";

const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#475569]";

export const generateSlugPreview = (name = "") =>
  String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getParentId = (category) => {
  if (!category?.parentCategory) return "";
  return typeof category.parentCategory === "string"
    ? category.parentCategory
    : category.parentCategory._id || "";
};

export default function ProductBasicInformation({
  formData,
  categories = [],
  brands = [],
  categoriesLoading = false,
  brandsLoading = false,
  selectedMainCategoryId,
  subCategories,
  subCategoriesLoading = false,
  onMainCategoryChange,
  onChange,
  fieldErrors = {},
}) {
  const triggerSynthetic = (name, value) => {
    onChange({ target: { name, value } });
  };

  const mainCategories = useMemo(
    () => categories.filter((cat) => !getParentId(cat)),
    [categories],
  );

  // Determine the current main category cleanly for both Create (dependent) and Edit flows
  const resolvedMainCategoryId = useMemo(() => {
    if (selectedMainCategoryId !== undefined) {
      return selectedMainCategoryId;
    }

    if (!formData.category) return "";
    const matched = categories.find((cat) => cat._id === formData.category);
    if (!matched) return "";
    return getParentId(matched) || matched._id;
  }, [selectedMainCategoryId, formData.category, categories]);

  const resolvedSubCategories = useMemo(() => {
    if (Array.isArray(subCategories)) {
      return subCategories;
    }

    if (!resolvedMainCategoryId) return [];
    return categories.filter(
      (cat) => getParentId(cat) === resolvedMainCategoryId,
    );
  }, [subCategories, resolvedMainCategoryId, categories]);

  const resolvedSubCategoryValue = useMemo(() => {
    if (!formData.category || !resolvedMainCategoryId) return undefined;
    if (formData.category === resolvedMainCategoryId) return undefined;
    return formData.category;
  }, [formData.category, resolvedMainCategoryId]);

  const slugPreview = useMemo(
    () => generateSlugPreview(formData.name),
    [formData.name],
  );

  const handleMainChange = (nextMainId) => {
    const cleanMainId = nextMainId || "";

    if (onMainCategoryChange) {
      onMainCategoryChange(cleanMainId);
      return;
    }

    triggerSynthetic("category", cleanMainId);
  };

  const handleSubChange = (nextSubId) => {
    if (nextSubId) {
      triggerSynthetic("category", nextSubId);
    } else {
      triggerSynthetic("category", resolvedMainCategoryId || "");
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Information Card */}
      <Card
        className="!border-[#E2E8F0] shadow-xs"
        title={
          <div className="flex items-center gap-2.5 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
              <Info size={17} />
            </div>
            <div>
              <h2 className="!m-0 text-base font-bold text-[#101828]">
                Product Information
              </h2>
              <p className="mt-0.5 text-xs font-normal text-[#64748B]">
                Provide a clear product title, brand, and comprehensive specification-ready description.
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Product Name */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor="product-name" className="!mb-0 block text-xs font-semibold uppercase tracking-wide text-[#475569]">
                Product Name *
              </label>
              <span className="text-[11px] font-medium text-[#64748B]">
                {(formData.name || "").length}/120 characters
              </span>
            </div>

            <Input
              id="product-name"
              name="name"
              size="large"
              maxLength={120}
              status={fieldErrors.name ? "error" : undefined}
              value={formData.name}
              onChange={onChange}
              placeholder="e.g. Apple AirPods Pro (2nd Gen) with MagSafe USB-C Case"
            />

            {fieldErrors.name ? (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {fieldErrors.name}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-[#64748B]">
                Use 2 to 120 characters. A unique URL slug is generated automatically from this name.
              </p>
            )}
          </div>

          {/* Full Description */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor="product-description" className="!mb-0 block text-xs font-semibold uppercase tracking-wide text-[#475569]">
                Full Description *
              </label>
              <span className="text-[11px] font-medium text-[#64748B]">
                Min 10 characters
              </span>
            </div>

            <Input.TextArea
              id="product-description"
              name="description"
              rows={6}
              showCount
              maxLength={5000}
              status={fieldErrors.description ? "error" : undefined}
              value={formData.description}
              onChange={onChange}
              placeholder="Highlight key electronics features, chipset/performance, battery endurance, device compatibility, warranty coverage, and what's in the box..."
              className="!text-sm"
            />

            {fieldErrors.description && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {fieldErrors.description}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Category & Brand Card */}
      <Card
        className="!border-[#E2E8F0] shadow-xs"
        title={
          <div className="flex items-center gap-2.5 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
              <FolderTree size={17} />
            </div>
            <div>
              <h2 className="!m-0 text-base font-bold text-[#101828]">
                Category & Brand Organization
              </h2>
              <p className="mt-0.5 text-xs font-normal text-[#64748B]">
                Assign the department category, optional subcategory, and official manufacturer brand.
              </p>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Main Category */}
          <div>
            <label className={labelClass}>Main Category *</label>
            <Select
              size="large"
              showSearch
              allowClear
              optionFilterProp="label"
              className="w-full"
              loading={categoriesLoading}
              disabled={categoriesLoading}
              status={fieldErrors.category ? "error" : undefined}
              value={resolvedMainCategoryId || undefined}
              placeholder={
                categoriesLoading
                  ? "Loading categories..."
                  : mainCategories.length === 0
                    ? "No active categories"
                    : "Select main category"
              }
              onChange={handleMainChange}
              options={mainCategories.map((cat) => ({
                value: cat._id,
                label: cat.name,
              }))}
            />
            {fieldErrors.category ? (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {fieldErrors.category}
              </p>
            ) : !categoriesLoading && mainCategories.length === 0 ? (
              <p className="mt-1.5 text-xs text-amber-700">
                No active categories found.{" "}
                <Link href="/admin/categories/create" className="font-semibold text-[#0755E9] underline">
                  Add Category
                </Link>
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-[#64748B]">
                Required top-level product department.
              </p>
            )}
          </div>

          {/* Dependent Subcategory */}
          <div>
            <label className={labelClass}>Subcategory</label>
            <Select
              size="large"
              showSearch
              allowClear
              optionFilterProp="label"
              className="w-full"
              loading={subCategoriesLoading}
              disabled={!resolvedMainCategoryId || subCategoriesLoading}
              value={resolvedSubCategoryValue}
              placeholder={
                !resolvedMainCategoryId
                  ? "Select main category first"
                  : subCategoriesLoading
                    ? "Loading subcategories..."
                    : resolvedSubCategories.length === 0
                      ? "No subcategories available"
                      : "Optional subcategory"
              }
              onChange={handleSubChange}
              options={resolvedSubCategories.map((sub) => ({
                value: sub._id,
                label: sub.name,
              }))}
            />
            <p className="mt-1.5 text-xs text-[#64748B]">
              {!resolvedMainCategoryId
                ? "Select a main category to view subcategories."
                : subCategoriesLoading
                  ? "Fetching child subcategories..."
                  : resolvedSubCategories.length === 0
                    ? "Assigns directly to the selected main category."
                    : `${resolvedSubCategories.length} active subcategor${
                        resolvedSubCategories.length === 1 ? "y" : "ies"
                      } available.`}
            </p>
          </div>

          {/* Brand */}
          <div>
            <label className={labelClass}>Brand *</label>
            <Select
              size="large"
              showSearch
              allowClear
              optionFilterProp="label"
              className="w-full"
              loading={brandsLoading}
              disabled={brandsLoading || brands.length === 0}
              status={fieldErrors.brand ? "error" : undefined}
              value={formData.brand || undefined}
              placeholder={
                brandsLoading
                  ? "Loading brands..."
                  : brands.length === 0
                    ? "No active brands"
                    : "Select brand"
              }
              onChange={(val) => triggerSynthetic("brand", val || "")}
              options={brands.map((brand) => ({
                value: brand.name,
                label: brand.name,
              }))}
            />
            {fieldErrors.brand ? (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {fieldErrors.brand}
              </p>
            ) : !brandsLoading && brands.length === 0 ? (
              <p className="mt-1.5 text-xs text-amber-700">
                No active brands found.{" "}
                <Link href="/admin/brands/create" className="font-semibold text-[#0755E9] underline">
                  Add Brand
                </Link>
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-[#64748B]">
                Only active ELENZO catalog brands appear here.
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card
        className="!border-[#E2E8F0] shadow-xs"
        title={<div className="flex items-center gap-2"><Truck size={16} className="text-[#0755E9]" /><span className="font-bold">SEO, Shipping & Tax</span></div>}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div><label className={labelClass}>SEO Title</label><Input maxLength={180} showCount value={formData.seoTitle || ""} onChange={(e) => triggerSynthetic("seoTitle", e.target.value)} /></div>
          <div><label className={labelClass}>SEO Keywords</label><Input value={formData.seoKeywords || ""} onChange={(e) => triggerSynthetic("seoKeywords", e.target.value)} placeholder="Comma separated" /></div>
          <div className="md:col-span-2"><label className={labelClass}>SEO Description</label><Input.TextArea maxLength={320} showCount rows={2} value={formData.seoDescription || ""} onChange={(e) => triggerSynthetic("seoDescription", e.target.value)} /></div>
          <div><label className={labelClass}>HSN Code</label><Input value={formData.hsnCode || ""} onChange={(e) => triggerSynthetic("hsnCode", e.target.value)} /></div>
          <div><label className={labelClass}>GST Rate (%)</label><InputNumber min={0} max={100} className="!w-full" value={formData.gstRate === "" ? null : Number(formData.gstRate)} onChange={(value) => triggerSynthetic("gstRate", value ?? "")} placeholder="Set only after tax review" /></div>
          <div><label className={labelClass}>Weight (grams)</label><InputNumber min={0} className="!w-full" value={formData.weight === "" ? null : Number(formData.weight)} onChange={(value) => triggerSynthetic("weight", value ?? "")} /></div>
          <div className="grid grid-cols-3 gap-2"><div><label className={labelClass}>Length (cm)</label><InputNumber min={0} className="!w-full" value={formData.length === "" ? null : Number(formData.length)} onChange={(value) => triggerSynthetic("length", value ?? "")} /></div><div><label className={labelClass}>Width (cm)</label><InputNumber min={0} className="!w-full" value={formData.width === "" ? null : Number(formData.width)} onChange={(value) => triggerSynthetic("width", value ?? "")} /></div><div><label className={labelClass}>Height (cm)</label><InputNumber min={0} className="!w-full" value={formData.height === "" ? null : Number(formData.height)} onChange={(value) => triggerSynthetic("height", value ?? "")} /></div></div>
          <div><label className={labelClass}>Warranty</label><Input value={formData.warranty || ""} onChange={(e) => triggerSynthetic("warranty", e.target.value)} placeholder="e.g. 1 year manufacturer warranty" /></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm"><Switch checked={formData.isTaxable !== false} onChange={(checked) => triggerSynthetic("isTaxable", checked)} /> Taxable</label>
          <label className="flex items-center gap-2 text-sm"><Switch checked={formData.returnEligible !== false} onChange={(checked) => triggerSynthetic("returnEligible", checked)} /> Returns eligible</label>
          <label className="flex items-center gap-2 text-sm"><Switch checked={Boolean(formData.isFreeShipping)} onChange={(checked) => triggerSynthetic("isFreeShipping", checked)} /> Free shipping</label>
        </div>
      </Card>

      {/* Collapsible SEO Slug Preview (Schema-supported auto-slug) */}
      <Collapse
        className="!border-[#E2E8F0] !bg-white shadow-xs"
        items={[
          {
            key: "seo-preview",
            label: (
              <div className="flex flex-wrap items-center gap-2">
                <Globe size={16} className="text-[#0755E9]" />
                <span className="text-sm font-bold text-[#101828]">
                  Storefront URL & SEO Slug Preview
                </span>
                <Tag color="blue" className="!m-0 !text-[11px]">
                  Auto-generated
                </Tag>
              </div>
            ),
            children: (
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Generated Product URL Slug</label>
                  <Input
                    size="large"
                    readOnly
                    value={slugPreview || "your-product-name"}
                    prefix={
                      <span className="text-xs font-medium text-[#64748B]">
                        /products/
                      </span>
                    }
                    className="!bg-[#F8FAFC] font-mono text-xs text-[#101828]"
                  />
                </div>
                <Alert
                  type="info"
                  showIcon
                  title="Automatic URL Generation"
                  description="ELENZO automatically derives clean, lowercase, unique product URLs from your Product Name during validation so links stay consistent across search engines and category pages."
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
