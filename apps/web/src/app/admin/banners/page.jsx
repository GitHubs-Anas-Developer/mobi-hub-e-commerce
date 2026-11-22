
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  Loader2,
  ImageIcon,
  RefreshCw,
} from "lucide-react";

import {
  fetchAdminBanners,
  updateBanner,
  deleteBanner,
} from "@/store/thunks/bannerThunks";

const getTargetName = (target) => {
  if (!target) return "All";

  if (typeof target === "object") {
    return target.name || "All";
  }

  return "Not populated";
};

const formatLabel = (value) => {
  if (!value) return "Not set";

  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function AdminBannersPage() {
  const dispatch = useDispatch();

  const {
    adminBanners: banners = [],
    adminLoading: loading,
    error,
  } = useSelector((state) => state.banners);

  const [search, setSearch] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deletingBannerId, setDeletingBannerId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Fetch banners
  const refreshBanners = () => {
    dispatch(fetchAdminBanners());
  };

  useEffect(() => {
    dispatch(fetchAdminBanners());
  }, [dispatch]);

  // Search banners
  const filteredBanners = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) return banners;

    return banners.filter((banner) => {
      const categoryName = getTargetName(banner.targetCategory);
      const subCategoryName = getTargetName(
        banner.targetSubCategory,
      );

      return (
        banner.title?.toLowerCase().includes(searchTerm) ||
        banner.subtitle?.toLowerCase().includes(searchTerm) ||
        banner.buttonLink?.toLowerCase().includes(searchTerm) ||
        banner.placement?.toLowerCase().includes(searchTerm) ||
        banner.position?.toLowerCase().includes(searchTerm) ||
        categoryName.toLowerCase().includes(searchTerm) ||
        subCategoryName.toLowerCase().includes(searchTerm)
      );
    });
  }, [banners, search]);

  // Toggle banner status
  const handleToggleStatus = async (banner) => {
    if (updatingStatusId || deletingBannerId) return;

    try {
      setActionError("");
      setActionSuccess("");
      setUpdatingStatusId(banner._id);

      const response = await dispatch(
        updateBanner({
          bannerId: banner._id,
          bannerData: {
            isActive: !banner.isActive,
          },
          files: {},
        }),
      ).unwrap();

      setActionSuccess(
        response?.message || "Banner status updated successfully",
      );

      refreshBanners();
    } catch (err) {
      setActionError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to update banner status",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Delete banner
  const handleDeleteBanner = async (banner) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${banner.title}"?`,
    );

    if (!confirmed) return;

    try {
      setActionError("");
      setActionSuccess("");
      setDeletingBannerId(banner._id);

      await dispatch(deleteBanner(banner._id)).unwrap();

      setActionSuccess("Banner deleted successfully");

      refreshBanners();
    } catch (err) {
      setActionError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to delete banner",
      );
    } finally {
      setDeletingBannerId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Banners
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your promotional banners and campaigns.
          </p>
        </div>

        <Link
          href="/admin/banners/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <Plus size={18} />
          Add Banner
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total Banners
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {banners.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Active Banners
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {banners.filter((banner) => banner.isActive).length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Inactive Banners
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {banners.filter((banner) => !banner.isActive).length}
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
            placeholder="Search banners, placement, category..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="button"
          onClick={refreshBanners}
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

      {/* Banners Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Banner
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Placement
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Position
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Target
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Button Link
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Schedule
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Order
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-blue-700"
                    />

                    <p className="mt-2 text-sm text-slate-500">
                      Loading banners...
                    </p>
                  </td>
                </tr>
              ) : filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <ImageIcon
                      size={32}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 font-medium text-slate-700">
                      No banners found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {search
                        ? "Try a different search term."
                        : "Create your first banner to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner) => {
                  const isUpdating =
                    updatingStatusId === banner._id;

                  const isDeleting =
                    deletingBannerId === banner._id;

                  return (
                    <tr
                      key={banner._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Banner */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                            {banner.desktopImage ? (
                              <img
                                src={banner.desktopImage}
                                alt={banner.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon
                                size={22}
                                className="text-slate-400"
                              />
                            )}
                          </div>

                          <div className="max-w-[220px]">
                            <p className="font-semibold text-slate-900">
                              {banner.title}
                            </p>

                            <p className="text-xs text-slate-500">
                              {banner.subtitle || "No subtitle"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {banner.mobileImage
                                ? "Desktop + Mobile"
                                : "Desktop only"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Placement */}
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">
                          {formatLabel(banner.placement || "home")}
                        </span>
                      </td>

                      {/* Position */}
                      <td className="px-5 py-4">
                        <span className="text-sm capitalize text-slate-600">
                          {formatLabel(banner.position || "hero")}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="px-5 py-4 text-xs text-slate-600">
                        <p>
                          Category:{" "}
                          {getTargetName(banner.targetCategory)}
                        </p>

                        <p className="mt-1">
                          Subcategory:{" "}
                          {getTargetName(banner.targetSubCategory)}
                        </p>
                      </td>

                      {/* Button Link */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        <p>{banner.buttonText || "Shop Now"}</p>

                        <p className="mt-1 text-xs text-slate-400">
                          {banner.buttonLink || "/products"}
                        </p>
                      </td>

                      {/* Schedule */}
                      <td className="px-5 py-4 text-xs text-slate-600">
                        <p>
                          Start:{" "}
                          {banner.startDate
                            ? new Date(
                                banner.startDate,
                              ).toLocaleDateString()
                            : "Immediately"}
                        </p>

                        <p className="mt-1">
                          End:{" "}
                          {banner.endDate
                            ? new Date(
                                banner.endDate,
                              ).toLocaleDateString()
                            : "No expiry"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            banner.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Sort Order */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {banner.sortOrder ?? 0}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/banners/${banner._id}/edit`}
                            title="Edit Banner"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Pencil size={16} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(banner)}
                            disabled={
                              Boolean(updatingStatusId) ||
                              Boolean(deletingBannerId)
                            }
                            title={
                              banner.isActive
                                ? "Deactivate Banner"
                                : "Activate Banner"
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
                            onClick={() => handleDeleteBanner(banner)}
                            disabled={
                              Boolean(deletingBannerId) ||
                              Boolean(updatingStatusId)
                            }
                            title="Delete Banner"
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

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-3">
          <p className="text-xs text-slate-500">
            Showing {filteredBanners.length} of {banners.length} banners
          </p>
        </div>
      </div>
    </div>
  );
}
