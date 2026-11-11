
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
  Tag,
  RefreshCw,
} from "lucide-react";

import useAdminBrands from "@/hooks/useAdminBrands";
import brandService from "@/services/brandService";

export default function AdminBrandsPage() {
  const {
    brands,
    loading,
    error,
    refreshBrands,
  } = useAdminBrands();

  const [search, setSearch] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deletingBrandId, setDeletingBrandId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const filteredBrands = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) return brands;

    return brands.filter((brand) => {
      return (
        brand.name?.toLowerCase().includes(searchTerm) ||
        brand.slug?.toLowerCase().includes(searchTerm) ||
        brand.description?.toLowerCase().includes(searchTerm)
      );
    });
  }, [brands, search]);

  const handleToggleStatus = async (brand) => {
    if (updatingStatusId || deletingBrandId) return;

    try {
      setActionError("");
      setActionSuccess("");
      setUpdatingStatusId(brand._id);

      const response = await brandService.toggleBrandStatus(brand._id);

      setActionSuccess(
        response.message || "Brand status updated successfully",
      );

      await refreshBrands();
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to update brand status",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteBrand = async (brand) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${brand.name}"?`,
    );

    if (!confirmed) return;

    try {
      setActionError("");
      setActionSuccess("");
      setDeletingBrandId(brand._id);

      const response = await brandService.deleteBrand(brand._id);

      setActionSuccess(
        response.message || "Brand deleted successfully",
      );

      await refreshBrands();
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to delete brand",
      );
    } finally {
      setDeletingBrandId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Brands
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your store brands and their information.
          </p>
        </div>

        <Link
          href="/admin/brands/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <Plus size={18} />
          Add Brand
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Brands</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {brands.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active Brands</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {brands.filter((brand) => brand.isActive).length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Inactive Brands</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {brands.filter((brand) => !brand.isActive).length}
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
            placeholder="Search brands..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="button"
          onClick={refreshBrands}
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

      {/* Brands Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Brand
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Slug
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Description
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
                      Loading brands...
                    </p>
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <Tag
                      size={32}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-2 font-medium text-slate-700">
                      No brands found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {search
                        ? "Try a different search term."
                        : "Create your first brand to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => {
                  const isUpdating =
                    updatingStatusId === brand._id;

                  const isDeleting =
                    deletingBrandId === brand._id;

                  return (
                    <tr
                      key={brand._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                            {brand.logo?.url ? (
                              <img
                                src={brand.logo.url}
                                alt={brand.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Tag
                                size={20}
                                className="text-slate-400"
                              />
                            )}
                          </div>

                          <p className="font-semibold text-slate-900">
                            {brand.name}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {brand.slug}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                        <p className="truncate">
                          {brand.description || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            brand.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {brand.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/brands/${brand._id}/edit`}
                            title="Edit Brand"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Pencil size={16} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(brand)}
                            disabled={
                              Boolean(updatingStatusId) ||
                              Boolean(deletingBrandId)
                            }
                            title={
                              brand.isActive
                                ? "Deactivate Brand"
                                : "Activate Brand"
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
                            onClick={() => handleDeleteBrand(brand)}
                            disabled={
                              Boolean(deletingBrandId) ||
                              Boolean(updatingStatusId)
                            }
                            title="Delete Brand"
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
            Showing {filteredBrands.length} of {brands.length} brands
          </p>
        </div>
      </div>
    </div>
  );
}
