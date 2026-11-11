
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react";

import brandService from "@/services/brandService";
import adminProductService from "@/services/adminProductService";

export default function CreateBrandPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

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
    setLogo(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    if (preview) URL.revokeObjectURL(preview);

    setLogo(null);
    setPreview("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Brand name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let logoData = {
        url: "",
        publicId: "",
      };

      if (logo) {
        const uploadResponse = await adminProductService.uploadImages(
          [logo],
          "brands",
        );

        const uploadedImage = uploadResponse.data?.[0];

        if (!uploadedImage?.url) {
          throw new Error("Brand logo upload failed");
        }

        logoData = {
          url: uploadedImage.url,
          publicId: uploadedImage.publicId || "",
        };
      }

      await brandService.createBrand({
        name: name.trim(),
        description: description.trim(),
        logo: logoData,
        isActive,
      });

      router.push("/admin/brands");
      router.refresh();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create brand",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/brands"
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={20} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Create Brand
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Add a new brand to your store.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-7"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Brand Name */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Brand Name <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Apple, Samsung, Sony"
            maxLength={100}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter brand description..."
            rows={4}
            maxLength={500}
            className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {description.length}/500
          </p>
        </div>

        {/* Brand Logo */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Brand Logo
          </label>

          {preview ? (
            <div className="relative flex h-40 w-40 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-3">
              <img
                src={preview}
                alt="Brand logo preview"
                className="h-full w-full object-contain"
              />

              <button
                type="button"
                onClick={removeLogo}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700"
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
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Brand Status
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Control whether this brand is active.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive((previous) => !previous)}
            className={`relative h-6 w-11 rounded-full transition ${
              isActive ? "bg-blue-700" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                isActive ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            href="/admin/brands"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save size={17} />
                Create Brand
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
