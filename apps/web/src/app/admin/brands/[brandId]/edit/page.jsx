
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react";

import brandService from "@/services/brandService";
import adminProductService from "@/services/adminProductService";

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = params.brandId;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: null,
    isActive: true,
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Fetch brand
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await brandService.getBrandById(brandId);
        const brand = response.data;

        setFormData({
          name: brand.name || "",
          description: brand.description || "",
          logo: brand.logo?.url
            ? {
                url: brand.logo.url,
                publicId: brand.logo.publicId || "",
              }
            : null,
          isActive: brand.isActive ?? true,
        });

        setPreview(brand.logo?.url || "");
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch brand",
        );
      } finally {
        setLoading(false);
      }
    };

    if (brandId) {
      fetchBrand();
    }
  }, [brandId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle logo selection
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Logo size cannot exceed 5MB");
      return;
    }

    setError("");

    setFormData((prev) => ({
      ...prev,
      logo: file,
    }));

    setPreview(URL.createObjectURL(file));

    // Allow selecting the same file again
    e.target.value = "";
  };

  // Remove logo
  const handleLogoRemove = () => {
    setFormData((prev) => ({
      ...prev,
      logo: null,
    }));

    setPreview("");
  };

  // Update brand
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      let logoData = formData.logo;

      // Automatically upload new logo to Cloudinary
      if (logoData instanceof File) {
        setUploading(true);

        const response = await adminProductService.uploadImages(
          [logoData],
          "brands",
        );

        logoData = response.data?.[0];

        if (!logoData?.url || !logoData?.publicId) {
          throw new Error("Logo upload response is invalid");
        }

        setUploading(false);
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        logo: logoData || {
          url: "",
          publicId: "",
        },
        isActive: formData.isActive,
      };

      await brandService.updateBrand(brandId, payload);

      router.push("/admin/brands");
      router.refresh();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update brand",
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  // Fetch error
  if (error && !formData.name) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push("/admin/brands")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Brands
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <button
          type="button"
          onClick={() => router.push("/admin/brands")}
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Brands
        </button>

        <h1 className="text-2xl font-bold text-slate-900">
          Edit Brand
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update brand information.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Basic Information
          </h2>

          <div className="space-y-5">
            {/* Brand Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Brand Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={100}
                disabled={saving}
                placeholder="Enter brand name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                disabled={saving}
                placeholder="Enter brand description..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {formData.description.length}/500
              </p>
            </div>
          </div>
        </div>

        {/* Brand Logo */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Brand Logo
          </h2>

          {preview ? (
            <div className="relative flex h-40 w-40 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-3">
              <img
                src={preview}
                alt="Brand logo preview"
                className="h-full w-full object-contain"
              />

              <button
                type="button"
                onClick={handleLogoRemove}
                disabled={saving}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700 disabled:opacity-50"
                title="Remove logo"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex h-40 w-full max-w-xs cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-500 hover:bg-blue-50">
              <ImagePlus size={30} className="text-slate-400" />

              <span className="mt-2 text-sm font-medium text-slate-700">
                Choose Brand Logo
              </span>

              <span className="mt-1 text-xs text-slate-400">
                PNG, JPG, WEBP (Max 5MB)
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                disabled={saving}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Brand Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Brand Status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Control whether this brand is active.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={formData.isActive}
              disabled={saving}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: !prev.isActive,
                }))
              }
              className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${
                formData.isActive ? "bg-blue-700" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  formData.isActive ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Current status: {formData.isActive ? "Active" : "Inactive"}
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/admin/brands")}
            disabled={saving}
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                {uploading ? "Uploading Logo..." : "Saving..."}
              </>
            ) : (
              <>
                <Save size={17} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
