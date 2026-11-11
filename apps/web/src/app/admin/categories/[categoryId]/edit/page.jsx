
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import categoryService from "@/services/categoryService";
import adminProductService from "@/services/adminProductService";

import CategoryImageUpload from "@/components/admin/categories/CategoryImageUpload";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
    parentCategory: "",
    sortOrder: 0,
  });

  const [parentCategories, setParentCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Fetch category and parent categories
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError("");

        const [categoryResponse, parentResponse] = await Promise.all([
          categoryService.getCategoryById(categoryId),
          categoryService.getAdminCategories({
            isActive: true,
            parentCategory: "null",
          }),
        ]);

        const category = categoryResponse.data;

        setFormData({
          name: category.name || "",
          description: category.description || "",
          image: category.image?.url
            ? {
                url: category.image.url,
                publicId: category.image.publicId || "",
              }
            : null,
          parentCategory: category.parentCategory?._id
            ? category.parentCategory._id
            : category.parentCategory || "",
          sortOrder: category.sortOrder ?? 0,
        });

        setParentCategories(
          (parentResponse.data || []).filter(
            (item) => item._id !== categoryId,
          ),
        );
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch category",
        );
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "sortOrder" ? Number(value) : value,
    }));
  };

  // Handle image selection
  const handleImageChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  // Handle image removal
  const handleImageRemove = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
  };

  // Update category
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      let imageData = formData.image;

      // Automatically upload new image to Cloudinary
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

      await categoryService.updateCategory(categoryId, payload);

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update category",
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // Page loading
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
          onClick={() => router.push("/admin/categories")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Categories
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
          onClick={() => router.push("/admin/categories")}
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Categories
        </button>

        <h1 className="text-2xl font-bold text-slate-900">
          Edit Category
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update category information.
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
            {/* Category Name */}
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
                disabled={saving}
                placeholder="Enter category name"
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
                placeholder="Enter category description..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </div>

            {/* Parent Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Parent Category
              </label>

              <select
                name="parentCategory"
                value={formData.parentCategory}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              >
                <option value="">None (Main Category)</option>

                {parentCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
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
                disabled={saving}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Category Image */}
        <CategoryImageUpload
          image={formData.image}
          onImageChange={handleImageChange}
          onImageRemove={handleImageRemove}
        />

        {/* Form Actions */}
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
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
                {uploading ? "Uploading Image..." : "Saving..."}
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
