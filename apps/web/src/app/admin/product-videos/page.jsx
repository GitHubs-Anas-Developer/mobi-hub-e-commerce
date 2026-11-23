
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
  Video,
  RefreshCw,
  Play,
  Film,
} from "lucide-react";

import {
  fetchAdminProductVideos,
  updateProductVideo,
  deleteProductVideo,
} from "@/store/thunks/productVideoThunks";

export default function AdminProductVideosPage() {
  const dispatch = useDispatch();

  const {
    adminVideos: videos = [],
    loading,
    error,
  } = useSelector((state) => state.productVideos);

  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [previewVideo, setPreviewVideo] = useState(null);

  const refreshVideos = () => {
    dispatch(fetchAdminProductVideos());
  };

  useEffect(() => {
    refreshVideos();
  }, [dispatch]);

  const filteredVideos = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return videos;

    return videos.filter((video) =>
      [
        video.title,
        video.description,
        video.product?.name,
      ].some((value) => value?.toLowerCase().includes(term))
    );
  }, [videos, search]);

  const handleToggleStatus = async (video) => {
    if (updatingId || deletingId) return;

    try {
      setActionError("");
      setActionSuccess("");
      setUpdatingId(video._id);

      await dispatch(
        updateProductVideo({
          videoId: video._id,
          videoData: {
            isActive: !video.isActive,
          },
        })
      ).unwrap();

      setActionSuccess("Video status updated successfully");
    } catch (err) {
      setActionError(
        typeof err === "string" ? err : "Failed to update video"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (video) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${video.title}"?`
    );

    if (!confirmed || updatingId || deletingId) return;

    try {
      setActionError("");
      setActionSuccess("");
      setDeletingId(video._id);

      await dispatch(deleteProductVideo(video._id)).unwrap();

      setActionSuccess("Product video deleted successfully");
    } catch (err) {
      setActionError(
        typeof err === "string" ? err : "Failed to delete video"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Product Videos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your product reels and video shopping content.
          </p>
        </div>

        <Link
          href="/admin/product-videos/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <Plus size={18} />
          Add Product Video
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Videos</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {videos.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active Videos</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {videos.filter((video) => video.isActive).length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Inactive Videos</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {videos.filter((video) => !video.isActive).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search videos or products..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="button"
          onClick={refreshVideos}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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

      {/* Videos table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {[
                  "Video",
                  "Product",
                  "Duration",
                  "Views",
                  "Status",
                  "Order",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-xs font-semibold uppercase text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-blue-700" />
                    <p className="mt-2 text-sm text-slate-500">
                      Loading videos...
                    </p>
                  </td>
                </tr>
              ) : filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Film className="mx-auto text-slate-300" size={32} />
                    <p className="mt-2 font-medium text-slate-700">
                      No videos found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {search
                        ? "Try a different search term."
                        : "Upload your first product video."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredVideos.map((video) => {
                  const isUpdating = updatingId === video._id;
                  const isDeleting = deletingId === video._id;

                  return (
                    <tr
                      key={video._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Video */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPreviewVideo(video)}
                            className="group relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-900"
                            title="Preview video"
                          >
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Video className="mx-auto text-white" />
                            )}
                            <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white opacity-0 transition group-hover:opacity-100">
                              <Play size={20} fill="currentColor" />
                            </span>
                          </button>

                          <div className="max-w-[230px]">
                            <p className="font-semibold text-slate-900">
                              {video.title}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                              {video.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {video.product?.name || "Product not found"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {Math.floor(video.duration || 0)} sec
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {video.views || 0}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            video.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {video.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {video.displayOrder ?? 0}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(video)}
                            disabled={Boolean(updatingId || deletingId)}
                            title={video.isActive ? "Deactivate" : "Activate"}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Power size={16} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(video)}
                            disabled={Boolean(updatingId || deletingId)}
                            title="Delete video"
                            className="rounded-lg border border-slate-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <Loader2 size={16} className="animate-spin" />
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
            Showing {filteredVideos.length} of {videos.length} videos
          </p>
        </div>
      </div>

      {/* Video preview */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="relative w-full max-w-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewVideo(null)}
              className="mb-3 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900"
            >
              Close preview
            </button>

            <video
              src={previewVideo.videoUrl}
              controls
              autoPlay
              playsInline
              className="max-h-[75vh] w-full rounded-xl bg-black"
            />
            <p className="mt-2 text-center text-sm font-medium text-white">
              {previewVideo.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
