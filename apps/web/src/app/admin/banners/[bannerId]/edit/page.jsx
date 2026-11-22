
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  Loader2,
  ImagePlus,
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  fetchBannerById,
  updateBanner,
} from "@/store/thunks/bannerThunks";

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

const getId = (value) => {
  if (!value) return "";
  return typeof value === "object" ? value._id || "" : value;
};

// Convert date to local datetime input format
const formatDateTimeLocal = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  const offset = parsedDate.getTimezoneOffset() * 60000;

  return new Date(parsedDate.getTime() - offset)
    .toISOString()
    .slice(0, 16);
};

export default function EditBannerPage() {
  const { bannerId } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    selectedBanner,
    detailLoading,
    submitting,
    error,
  } = useSelector((state) => state.banners);

  const {
    adminCategories,
    subCategories,
    subCategoriesLoading,
  } = useSelector((state) => state.categories);

  const [formData, setFormData] = useState(initialFormData);

  const [desktopImage, setDesktopImage] = useState(null);
  const [mobileImage, setMobileImage] = useState(null);

  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");

  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  // Fetch banner and main categories
  useEffect(() => {
    if (bannerId) {
      dispatch(fetchBannerById(bannerId));
    }

    dispatch(fetchAdminCategories({ parentCategory: "" }));
  }, [dispatch, bannerId]);

  // Populate form when banner loads
  useEffect(() => {
    if (!selectedBanner || selectedBanner._id !== bannerId) return;

    setFormData({
      title: selectedBanner.title || "",
      subtitle: selectedBanner.subtitle || "",
      description: selectedBanner.description || "",
      buttonText: selectedBanner.buttonText || "Shop Now",
      buttonLink: selectedBanner.buttonLink || "/products",

      placement: selectedBanner.placement || "home",
      position: selectedBanner.position || "hero",

      targetCategory: getId(selectedBanner.targetCategory),
      targetSubCategory: getId(selectedBanner.targetSubCategory),

      isActive: selectedBanner.isActive ?? true,
      sortOrder: selectedBanner.sortOrder ?? 0,

      startDate: formatDateTimeLocal(selectedBanner.startDate),
      endDate: formatDateTimeLocal(selectedBanner.endDate),
    });

    setDesktopPreview(selectedBanner.desktopImage || "");
    setMobilePreview(selectedBanner.mobileImage || "");

    setDesktopImage(null);
    setMobileImage(null);
  }, [selectedBanner, bannerId]);

  // Fetch subcategories for selected category
  useEffect(() => {
    if (
      formData.targetCategory &&
      (formData.placement === "categories" ||
        formData.placement === "subcategory")
    ) {
      dispatch(fetchSubCategories(formData.targetCategory));
    }
  }, [
    dispatch,
    formData.targetCategory,
    formData.placement,
  ]);

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  const selectClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

  // Handle form fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormError("");
    setMessage("");

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

  // Handle image upload
  const handleImageChange = (e, type) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Only JPEG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    setFormError("");
    setMessage("");

    const preview = URL.createObjectURL(file);

    if (type === "desktop") {
      if (desktopPreview.startsWith("blob:")) {
        URL.revokeObjectURL(desktopPreview);
      }

      setDesktopImage(file);
      setDesktopPreview(preview);
    } else {
      if (mobilePreview.startsWith("blob:")) {
        URL.revokeObjectURL(mobilePreview);
      }

      setMobileImage(file);
      setMobilePreview(preview);
    }

    e.target.value = "";
  };

  // Submit updated banner
  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");
    setMessage("");

    if (!formData.title.trim()) {
      setFormError("Banner title is required.");
      return;
    }

    if (
      formData.placement === "categories" &&
      !formData.targetCategory
    ) {
      setFormError("Please select a target category.");
      return;
    }

    if (
      formData.placement === "subcategory" &&
      (!formData.targetCategory || !formData.targetSubCategory)
    ) {
      setFormError("Please select both category and subcategory.");
      return;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      setFormError("End date must be after the start date.");
      return;
    }

    try {
      const bannerData = {
        ...formData,

        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        description: formData.description.trim(),
        buttonText: formData.buttonText.trim(),
        buttonLink: formData.buttonLink.trim(),

        sortOrder: Number(formData.sortOrder),

        targetCategory: formData.targetCategory || null,
        targetSubCategory: formData.targetSubCategory || null,

        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : null,

        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : null,
      };

      await dispatch(
        updateBanner({
          bannerId,
          bannerData,
          files: {
            desktopImage,
            mobileImage,
          },
        }),
      ).unwrap();

      router.push("/admin/banners");
    } catch (err) {
      setFormError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to update banner.",
      );
    }
  };

  // Loading state
  if (
    detailLoading ||
    !selectedBanner ||
    selectedBanner._id !== bannerId
  ) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <Loader2
            className="animate-spin text-blue-700"
            size={32}
          />
        )}
      </div>
    );
  }

  const categoryOptions = [
    { value: "", label: "Select Category" },
    ...(adminCategories || []).map((category) => ({
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
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/banners"
          className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Banner
          </h1>

          <p className="text-sm text-slate-500">
            Update your promotional banner.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Banner Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Title *
              </label>

              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Subtitle
              </label>

              <input
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Placement Settings */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Banner Placement
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Placement *
              </label>

              <select
                name="placement"
                value={formData.placement}
                onChange={handleChange}
                required
                className={selectClass}
              >
                <option value="home">Home Page</option>
                <option value="products">Products Page</option>
                <option value="categories">Categories Page</option>
                <option value="subcategory">Subcategory Page</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Position *
              </label>

              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className={selectClass}
              >
                <option value="hero">Hero</option>
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>

            {(formData.placement === "categories" ||
              formData.placement === "subcategory") && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Target Category *
                </label>

                <select
                  name="targetCategory"
                  value={formData.targetCategory}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  {categoryOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.placement === "subcategory" && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Target Subcategory *
                </label>

                <select
                  name="targetSubCategory"
                  value={formData.targetSubCategory}
                  onChange={handleChange}
                  required
                  disabled={
                    !formData.targetCategory ||
                    subCategoriesLoading
                  }
                  className={selectClass}
                >
                  {subCategoriesLoading ? (
                    <option value="">
                      Loading subcategories...
                    </option>
                  ) : (
                    subCategoryOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))
                  )}
                </select>

                {subCategoriesLoading && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <Loader2
                      size={13}
                      className="animate-spin"
                    />
                    Loading subcategories...
                  </p>
                )}

                {!subCategoriesLoading &&
                  formData.targetCategory &&
                  subCategories.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      No subcategories found.
                    </p>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Banner Images
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Desktop Image */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Desktop Image
              </label>

              {desktopPreview && (
                <img
                  src={desktopPreview}
                  alt="Desktop banner preview"
                  className="mb-3 h-40 w-full rounded-lg border object-cover"
                />
              )}

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-4 text-sm text-slate-600 hover:border-blue-500">
                <ImagePlus size={18} />
                Replace Desktop Image

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) =>
                    handleImageChange(e, "desktop")
                  }
                />
              </label>
            </div>

            {/* Mobile Image */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Mobile Image
              </label>

              {mobilePreview && (
                <img
                  src={mobilePreview}
                  alt="Mobile banner preview"
                  className="mb-3 h-40 w-full rounded-lg border object-contain"
                />
              )}

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-4 text-sm text-slate-600 hover:border-blue-500">
                <ImagePlus size={18} />

                {mobilePreview
                  ? "Replace Mobile Image"
                  : "Upload Mobile Image"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) =>
                    handleImageChange(e, "mobile")
                  }
                />
              </label>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            JPEG, PNG or WEBP. Maximum 5MB per image.
            Existing images will remain if you do not replace them.
          </p>
        </div>

        {/* Button Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Button Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Button Text
              </label>

              <input
                name="buttonText"
                value={formData.buttonText}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Button Link
              </label>

              <input
                name="buttonLink"
                value={formData.buttonLink}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Settings and Schedule */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Settings & Schedule
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Sort Order
              </label>

              <input
                type="number"
                name="sortOrder"
                min="0"
                value={formData.sortOrder}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="flex items-center gap-3 pt-7">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                id="isActive"
                className="h-4 w-4 accent-blue-700"
              />

              <label
                htmlFor="isActive"
                className="text-sm font-medium"
              >
                Active Banner
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Start Date
              </label>

              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                End Date
              </label>

              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || undefined}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        {formError && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </p>
        )}

        {message && (
          <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Link
            href="/admin/banners"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}

            {submitting ? "Updating..." : "Update Banner"}
          </button>
        </div>
      </form>
    </div>
  );
}
