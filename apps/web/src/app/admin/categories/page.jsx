
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  Loader2,
  FolderTree,
  RefreshCw,
} from "lucide-react";

import useAdminCategories from "@/hooks/useAdminCategories";
import categoryService from "@/services/categoryService";

export default function AdminCategoriesPage() {
  const {
    categories,
    loading,
    error,
    refreshCategories,
  } = useAdminCategories();

  const [search, setSearch] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const filteredCategories = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) return categories;

    return categories.filter((category) => {
      return (
        category.name?.toLowerCase().includes(searchTerm) ||
        category.slug?.toLowerCase().includes(searchTerm) ||
        category.parentCategory?.name?.toLowerCase().includes(searchTerm)
      );
    });
  }, [categories, search]);

  const handleToggleStatus = async (category) => {
    if (updatingStatusId || deletingCategoryId) return;

    try {
      setActionError("");
      setActionSuccess("");
      setUpdatingStatusId(category._id);

      const response = await categoryService.toggleCategoryStatus(
        category._id,
      );

      setActionSuccess(
        response.message || "Category status updated successfully",
      );

      await refreshCategories();
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to update category status",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) return;

    try {
      setActionError("");
      setActionSuccess("");
      setDeletingCategoryId(category._id);

      const response = await categoryService.deleteCategory(category._id);

      setActionSuccess(
        response.message || "Category deleted successfully",
      );

      await refreshCategories();
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to delete category",
      );
    } finally {
      setDeletingCategoryId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Categories
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your store categories and subcategories.
          </p>
        </div>

        <Link
          href="/admin/categories/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <Plus size={18} />
          Add Category
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Categories</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {categories.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active Categories</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {categories.filter((category) => category.isActive).length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Inactive Categories</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {categories.filter((category) => !category.isActive).length}
          </p>
        </div>
      </div>

      {/* Search and Refresh */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="button"
          onClick={refreshCategories}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Feedback */}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionSuccess}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Categories Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Category
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Slug
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Parent Category
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-blue-700"
                    />
                    <p className="mt-2 text-sm text-slate-500">
                      Loading categories...
                    </p>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <FolderTree
                      size={32}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-2 font-medium text-slate-700">
                      No categories found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {search
                        ? "Try a different search term."
                        : "Create your first category to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => {
                  const isUpdating =
                    updatingStatusId === category._id;

                  const isDeleting =
                    deletingCategoryId === category._id;

                  return (
                    <tr
                      key={category._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                            {category.image?.url ? (
                              <img
                                src={category.image.url}
                                alt={category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <FolderTree
                                size={20}
                                className="text-slate-400"
                              />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {category.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              Order: {category.sortOrder ?? 0}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {category.slug}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {category.parentCategory?.name || "Main Category"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            category.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/categories/${category._id}/edit`}
                            title="Edit Category"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Pencil size={16} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(category)}
                            disabled={
                              Boolean(updatingStatusId) ||
                              Boolean(deletingCategoryId)
                            }
                            title={
                              category.isActive
                                ? "Deactivate Category"
                                : "Activate Category"
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Power size={16} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category)}
                            disabled={
                              Boolean(deletingCategoryId) ||
                              Boolean(updatingStatusId)
                            }
                            title="Delete Category"
                            className="rounded-lg border border-slate-200 p-2 text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3">
          <p className="text-xs text-slate-500">
            Showing {filteredCategories.length} of {categories.length} categories
          </p>
        </div>
      </div>
    </div>
  );
}
