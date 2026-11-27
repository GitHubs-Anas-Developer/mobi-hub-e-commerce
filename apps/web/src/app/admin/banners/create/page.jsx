
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Loader2,
  Save,
  ImagePlus,
  X,
} from "lucide-react";

import { createBanner } from "@/store/thunks/bannerThunks";
import {
  fetchAdminCategories,
  fetchSubCategories,
} from "@/store/thunks/categoryThunks";

const initialFormData = {
  title: "",
  subtitle: "",
  description: "",
  buttonText: "Shop Now",
  buttonLink: "/products",

  placement: "home",
  position: "hero",
  targetCategory: "",
  targetSubCategory: "",

  isActive: true,
  sortOrder: 0,
  startDate: "",
  endDate: "",
};

function ImageUpload({ label, file, onChange, required = false }) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label} {required && "*"}
      </label>

      <div className="relative flex min-h-48 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
        {preview ? (
          <>
            <img
              src={preview}
              alt={label}
              className="h-48 w-full object-contain"
            />

            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-3 top-3 rounded-full bg-white p-2 text-red-600 shadow hover:bg-red-50"
              aria-label="Remove image"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <label className="flex w-full cursor-pointer flex-col items-center justify-center p-6 text-center">
            <ImagePlus size={32} className="mb-3 text-slate-400" />

            <span className="text-sm font-medium text-slate-700">
              Click to upload image
            </span>

            <span className="mt-1 text-xs text-slate-500">
              JPG, PNG or WEBP (Max 5MB)
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={required && !file}
              className="hidden"
              onChange={(e) => {
                onChange(e.target.files?.[0] || null);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label} {required && "*"}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CreateBannerPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const submitting = useSelector(
    (state) => state.banners.submitting,
  );

  const reduxError = useSelector(
    (state) => state.banners.error,
  );

  const mainCategories = useSelector(
    (state) => state.categories.adminCategories,
  );

  const subCategories = useSelector(
    (state) => state.categories.subCategories,
  );

  const subCategoriesLoading = useSelector(
    (state) => state.categories.subCategoriesLoading,
  );

  const [formData, setFormData] = useState(initialFormData);
  const [desktopImage, setDesktopImage] = useState(null);
  const [mobileImage, setMobileImage] = useState(null);
  const [error, setError] = useState("");

  // Fetch main categories when page loads
  useEffect(() => {
    dispatch(fetchAdminCategories({ parentCategory: "" }));
  }, [dispatch]);

  // Fetch subcategories when a main category is selected
  useEffect(() => {
    if (
      formData.targetCategory &&
      (formData.placement === "categories" ||
        formData.placement === "subcategory")
    ) {
      dispatch(fetchSubCategories(formData.targetCategory));
    }
  }, [dispatch, formData.targetCategory, formData.placement]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setError("");

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : name === "sortOrder"
              ? Number(value)
              : value,
      };

      if (name === "placement") {
        if (value === "home" || value === "products") {
          updated.targetCategory = "";
          updated.targetSubCategory = "";
        }

        if (value === "categories") {
          updated.targetSubCategory = "";
        }
      }

      if (name === "targetCategory") {
        updated.targetSubCategory = "";
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!desktopImage) {
      setError("Please select a desktop banner image");
      return;
    }

    if (desktopImage.size > 5 * 1024 * 1024) {
      setError("Desktop image must be smaller than 5MB");
      return;
    }

    if (mobileImage && mobileImage.size > 5 * 1024 * 1024) {
      setError("Mobile image must be smaller than 5MB");
      return;
    }

    if (
      formData.placement === "subcategory" &&
      (!formData.targetCategory || !formData.targetSubCategory)
    ) {
      setError("Please select both category and subcategory");
      return;
    }

    if (
      formData.placement === "categories" &&
      !formData.targetCategory
    ) {
      setError("Please select a category");
      return;
    }

    try {
      setError("");

      const bannerData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        description: formData.description.trim(),
        buttonText: formData.buttonText.trim(),
        buttonLink: formData.buttonLink.trim(),

        placement: formData.placement,
        position: formData.position,

        targetCategory: formData.targetCategory || null,
        targetSubCategory: formData.targetSubCategory || null,

        isActive: formData.isActive,
        sortOrder: formData.sortOrder,

        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : "",

        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : "",
      };

      await dispatch(
        createBanner({
          bannerData,
          files: {
            desktopImage,
            mobileImage,
          },
        }),
      ).unwrap();

      router.push("/admin/banners");
      router.refresh();
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to create banner",
      );
    }
  };

  const categoryOptions = [
    { value: "", label: "Select Category" },
    ...(mainCategories || []).map((category) => ({
      value: category._id,
      label: category.name,
    })),
  ];

  const subCategoryOptions = [
    { value: "", label: "Select Subcategory" },
    ...(subCategories || []).map((category) => ({
      value: category._id,
      label: category.name,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900">
          Create Banner
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a promotional banner to ELENZO.
        </p>
      </div>

      {/* Error */}
      {(error || reduxError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || reduxError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Basic Information
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Banner Title *
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                minLength={1}
                maxLength={150}
                placeholder="e.g. Upgrade Your Mobile Experience"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Subtitle
              </label>

              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="e.g. Premium Accessories at Best Prices"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Enter banner description..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Banner Placement */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Banner Placement
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Placement"
              name="placement"
              value={formData.placement}
              onChange={handleChange}
              required
              options={[
                { value: "home", label: "Home Page" },
                { value: "products", label: "Products Page" },
                { value: "categories", label: "Categories Page" },
                { value: "subcategory", label: "Subcategory Page" },
              ]}
            />

            <SelectField
              label="Position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              options={[
                { value: "hero", label: "Hero" },
                { value: "top", label: "Top" },
                { value: "middle", label: "Middle" },
                { value: "bottom", label: "Bottom" },
              ]}
            />

            {(formData.placement === "categories" ||
              formData.placement === "subcategory") && (
              <SelectField
                label="Target Category"
                name="targetCategory"
                value={formData.targetCategory}
                onChange={handleChange}
                required
                options={categoryOptions}
              />
            )}

            {formData.placement === "subcategory" && (
              <div>
                <SelectField
                  label="Target Subcategory"
                  name="targetSubCategory"
                  value={formData.targetSubCategory}
                  onChange={handleChange}
                  required
                  disabled={
                    !formData.targetCategory || subCategoriesLoading
                  }
                  options={
                    subCategoriesLoading
                      ? [{ value: "", label: "Loading subcategories..." }]
                      : subCategoryOptions
                  }
                />

                {subCategoriesLoading && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 size={13} className="animate-spin" />
                    Loading subcategories...
                  </p>
                )}

                {!subCategoriesLoading &&
                  formData.targetCategory &&
                  subCategories.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      No subcategories found for this category.
                    </p>
                  )}
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Select where this banner should appear on the ELENZO website.
          </p>
        </div>

        {/* Banner Images */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            Banner Images
          </h2>

          <p className="mb-5 text-sm text-slate-500">
            Upload separate images for desktop and mobile screens.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <ImageUpload
              label="Desktop Banner Image"
              file={desktopImage}
              onChange={setDesktopImage}
              required
            />

            <ImageUpload
              label="Mobile Banner Image"
              file={mobileImage}
              onChange={setMobileImage}
            />
          </div>
        </div>

        {/* Button Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Button Information
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Button Text
              </label>

              <input
                type="text"
                name="buttonText"
                value={formData.buttonText}
                onChange={handleChange}
                placeholder="Shop Now"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Button Link
              </label>

              <input
                type="text"
                name="buttonLink"
                value={formData.buttonLink}
                onChange={handleChange}
                placeholder="/products"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Scheduling and Settings */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Display Settings
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sort Order
              </label>

              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleChange}
                min={0}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-3 pt-7">
              <input
                id="isActive"
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />

              <label
                htmlFor="isActive"
                className="text-sm font-medium text-slate-700"
              >
                Active Banner
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Start Date
              </label>

              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                End Date
              </label>

              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || undefined}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/admin/banners")}
            disabled={submitting}
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Creating Banner...
              </>
            ) : (
              <>
                <Save size={17} />
                Create Banner
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
