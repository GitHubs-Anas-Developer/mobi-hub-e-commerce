
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eye,
  Trash2,
  Power,
  Loader2,
} from "lucide-react";

import useAdminProducts from "@/hooks/useAdminProducts";
import adminProductService from "@/services/adminProductService";
import categoryService from "@/services/categoryService";
import ProductDeleteModal from "@/components/admin/products/ProductDeleteModal";

export default function AdminProductsPage() {
  const {
    products,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    changePage,
    refreshProducts,
  } = useAdminProducts();

  const [searchInput, setSearchInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);

        const response = await categoryService.getCategories();

        setCategories(response.data || []);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Search products
  const handleSearch = (e) => {
    e.preventDefault();

    updateFilters({
      search: searchInput.trim(),
    });
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchInput("");

    updateFilters({
      search: "",
      isActive: "",
      category: "",
      brand: "",
      sort: "newest",
    });
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!selectedProduct?._id || deletingProduct) return;

    try {
      setDeletingProduct(true);
      setDeletingProductId(selectedProduct._id);
      setActionError("");
      setActionSuccess("");

      const response = await adminProductService.deleteProduct(
        selectedProduct._id,
      );

      setSelectedProduct(null);

      setActionSuccess(
        response.message || "Product deleted successfully.",
      );

      await refreshProducts();
    } catch (error) {
      console.error("Delete Product Error:", error);

      setActionError(
        error.response?.data?.message ||
          "Unable to delete product. Please try again.",
      );
    } finally {
      setDeletingProduct(false);
      setDeletingProductId(null);
    }
  };

  // Toggle product status
  const handleToggleStatus = async (product) => {
    if (!product?._id || updatingStatusId || deletingProductId) return;

    try {
      setUpdatingStatusId(product._id);
      setActionError("");
      setActionSuccess("");

      const response = await adminProductService.toggleProductStatus(
        product._id,
      );

      setActionSuccess(
        response.message ||
          `Product ${product.isActive ? "deactivated" : "activated"} successfully.`,
      );

      await refreshProducts();
    } catch (error) {
      console.error("Toggle Product Status Error:", error);

      setActionError(
        error.response?.data?.message ||
          "Unable to update product status. Please try again.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your MOBI HUB product catalogue.
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Action Feedback */}
      {actionError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{actionError}</p>

          <button
            type="button"
            onClick={() => setActionError("")}
            className="text-sm font-semibold text-red-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm text-green-700">{actionSuccess}</p>

          <button
            type="button"
            onClick={() => setActionSuccess("")}
            className="text-sm font-semibold text-green-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Search
            </button>
          </form>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => updateFilters({ category: e.target.value })}
            disabled={categoriesLoading}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 disabled:opacity-50"
          >
            <option value="">
              {categoriesLoading ? "Loading categories..." : "All Categories"}
            </option>

            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.isActive}
            onChange={(e) => updateFilters({ isActive: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="nameAZ">Name A-Z</option>
            <option value="nameZA">Name Z-A</option>
            <option value="priceLowToHigh">Price: Low to High</option>
            <option value="priceHighToLow">Price: High to Low</option>
          </select>

          {/* Refresh */}
          <button
            type="button"
            onClick={refreshProducts}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          {/* Clear Filters */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              All Products
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {pagination.total || 0} products found
            </p>
          </div>
        </div>

        {/* Error State */}
        {error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={refreshProducts}
              className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package
              className="mx-auto mb-3 text-slate-300"
              size={40}
            />

            <h3 className="font-semibold text-slate-800">
              No products found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* Product Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Brand</th>
                    <th className="px-5 py-3 font-semibold">Price</th>
                    <th className="px-5 py-3 font-semibold">Stock</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => {
                    const isUpdating = updatingStatusId === product._id;

                    return (
                      <tr
                        key={product._id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* Product */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {product.thumbnail?.url ? (
                              <img
                                src={product.thumbnail.url}
                                alt={product.name}
                                className="h-11 w-11 rounded-lg border border-slate-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
                                <Package
                                  size={20}
                                  className="text-slate-400"
                                />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">
                                {product.name}
                              </p>

                              <p className="text-xs text-slate-400">
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4 text-slate-600">
                          {product.category?.name || "—"}
                        </td>

                        {/* Brand */}
                        <td className="px-5 py-4 text-slate-600">
                          {product.brand || "—"}
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4 font-medium text-slate-900">
                          ₹{Number(product.basePrice || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-4 text-slate-600">
                          {product.totalStock ?? 0}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              product.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {/* View */}
                            <Link
                              href={`/products/${product.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                              title="View Product"
                            >
                              <Eye size={16} />
                            </Link>

                            {/* Edit */}
                            <Link
                              href={`/admin/products/${product._id}/edit`}
                              className="rounded-lg border border-slate-200 p-2 text-blue-700 transition hover:bg-blue-50"
                              title="Edit Product"
                            >
                              <Pencil size={16} />
                            </Link>

                            {/* Activate / Deactivate */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(product)}
                              disabled={Boolean(updatingStatusId) || Boolean(deletingProductId)}
                              className={`rounded-lg border p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                product.isActive
                                  ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                  : "border-green-200 text-green-700 hover:bg-green-50"
                              }`}
                              title={
                                product.isActive
                                  ? "Deactivate Product"
                                  : "Activate Product"
                              }
                            >
                              {isUpdating ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Power size={16} />
                              )}
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                setActionError("");
                                setActionSuccess("");
                                setSelectedProduct(product);
                              }}
                              disabled={Boolean(deletingProductId) || Boolean(updatingStatusId)}
                              className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {pagination.page || 1} of{" "}
                {pagination.totalPages || 1}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changePage((pagination.page || 1) - 1)}
                  disabled={!pagination.hasPrevPage || loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() => changePage((pagination.page || 1) + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ProductDeleteModal
        product={selectedProduct}
        loading={deletingProduct}
        onConfirm={handleDeleteProduct}
        onCancel={() => {
          if (!deletingProduct) {
            setSelectedProduct(null);
          }
        }}
      />
    </div>
  );
}
