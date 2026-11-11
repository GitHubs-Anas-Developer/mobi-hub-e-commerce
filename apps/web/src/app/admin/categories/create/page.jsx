
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import categoryService from "@/services/categoryService";
import adminProductService from "@/services/adminProductService";

import CategoryImageUpload from "@/components/admin/categories/CategoryImageUpload";

export default function CreateCategoryPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
    parentCategory: "",
    sortOrder: 0,
  });

  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetchingParents, setFetchingParents] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const response = await categoryService.getAdminCategories({
          isActive: true,
          parentCategory: "null",
        });

        setParentCategories(response.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to fetch parent categories",
        );
      } finally {
        setFetchingParents(false);
      }
    };

    fetchParentCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "sortOrder" ? Number(value) : value,
    }));
  };

  const handleImageUpload = async () => {
    if (!(formData.image instanceof File)) return;

    try {
      setUploading(true);
      setError("");

      const response = await adminProductService.uploadImages(
        [formData.image],
        "categories",
      );

      const uploadedImage = response.data?.[0];

      if (!uploadedImage?.url || !uploadedImage?.publicId) {
        throw new Error("Image upload response is invalid");
      }

      setFormData((prev) => ({
        ...prev,
        image: uploadedImage,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to upload category image",
      );
    } finally {
      setUploading(false);
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);
    setError("");

    let imageData = formData.image;

    // Automatically upload image if a new file is selected
    if (imageData instanceof File) {
      setUploading(true);

      const response = await adminProductService.uploadImages(
        [imageData],
        "categories",
      );

      imageData = response.data?.[0];

      if (!imageData?.url || !imageData?.publicId) {
        throw new Error("Image upload response is invalid");
      }

      setUploading(false);
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      image: imageData || undefined,
      parentCategory: formData.parentCategory || null,
      sortOrder: formData.sortOrder,
    };

    await categoryService.createCategory(payload);

    router.push("/admin/categories");
    router.refresh();
  } catch (err) {
    setError(
      err.response?.data?.message ||
        err.message ||
        "Failed to create category",
    );
  } finally {
    setLoading(false);
    setUploading(false);
  }
};

  return (
    <div className="space-y-6">
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
          Create Category
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a new product category to MOBI HUB.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Basic Information
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={100}
                placeholder="e.g. Mobile Accessories"
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
                maxLength={500}
                placeholder="Enter category description..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Parent Category
              </label>

              <select
                name="parentCategory"
                value={formData.parentCategory}
                onChange={handleChange}
                disabled={fetchingParents}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">None (Main Category)</option>

                {parentCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

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
          </div>
        </div>

    <CategoryImageUpload
  image={formData.image}
  onImageChange={(file) =>
    setFormData((prev) => ({
      ...prev,
      image: file,
    }))
  }
  onImageRemove={() =>
    setFormData((prev) => ({
      ...prev,
      image: null,
    }))
  }
/>

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
            disabled={loading || uploading}
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || uploading || fetchingParents}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
       {loading ? (
  <>
    <Loader2 size={17} className="animate-spin" />
    {uploading ? "Uploading Image..." : "Creating..."}
  </>
) : (
  <>
    <Save size={17} />
    Create Category
  </>
)}
          </button>
        </div>
      </form>
    </div>
  );
}
