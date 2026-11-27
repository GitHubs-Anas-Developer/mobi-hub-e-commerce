"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  App,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Select,
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  CheckCircle2,
  Eye,
  Film,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Video as VideoIcon,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import {
  deleteProductVideo,
  fetchAdminProductVideos,
  updateProductVideo,
} from "@/store/thunks/productVideoThunks";

export default function AdminProductVideosPage() {
  const dispatch = useDispatch();
  const { message } = App.useApp();

  const {
    adminVideos = [],
    loading,
    error,
  } = useSelector((state) => state.productVideos);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    dispatch(fetchAdminProductVideos());
  }, [dispatch]);

  const refreshVideos = () => {
    setActionError("");
    dispatch(fetchAdminProductVideos());
  };

  const filteredVideos = useMemo(() => {
    const query = search.trim().toLowerCase();

    return adminVideos.filter((video) => {
      if (statusFilter === "active" && !video.isActive) return false;
      if (statusFilter === "inactive" && video.isActive) return false;

      if (!query) return true;

      return (
        video.title?.toLowerCase().includes(query) ||
        video.description?.toLowerCase().includes(query) ||
        video.product?.name?.toLowerCase().includes(query)
      );
    });
  }, [adminVideos, search, statusFilter]);

  const activeCount = useMemo(
    () => adminVideos.filter((video) => video.isActive).length,
    [adminVideos],
  );

  const totalViews = useMemo(
    () =>
      adminVideos.reduce((sum, video) => sum + (Number(video.views) || 0), 0),
    [adminVideos],
  );

  const handleToggleStatus = async (video) => {
    try {
      setActionError("");
      setUpdatingId(video._id);
      const nextStatus = !video.isActive;

      await dispatch(
        updateProductVideo({
          videoId: video._id,
          videoData: { isActive: nextStatus },
        }),
      ).unwrap();

      message.success(
        `Video "${video.title}" ${nextStatus ? "activated" : "deactivated"}.`,
      );
    } catch (err) {
      setActionError(err || "Failed to update video status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;

    try {
      setActionError("");
      setDeletingId(videoToDelete._id);
      await dispatch(deleteProductVideo(videoToDelete._id)).unwrap();
      message.success(`Video "${videoToDelete.title}" deleted.`);
      setVideoToDelete(null);
    } catch (err) {
      setActionError(err || "Failed to delete video.");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      title: "Video",
      key: "video",
      width: 310,
      render: (_, video) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewVideo(video)}
            className="group relative flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#0F172A]"
            title="Preview video"
          >
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <VideoIcon size={20} className="text-white" />
            )}

            <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white opacity-0 transition group-hover:opacity-100">
              <Play size={18} fill="currentColor" />
            </span>
          </button>

          <div className="min-w-0">
            <p className="truncate font-semibold text-[#101828]">
              {video.title}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-[#64748B]">
              {video.description || "No description"}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Linked Product",
      key: "product",
      width: 220,
      render: (_, video) => (
        <span className="text-sm font-medium text-[#334155]">
          {video.product?.name || "Product not found"}
        </span>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 110,
      render: (duration) => (
        <span className="text-sm text-[#475569]">
          {Math.floor(duration || 0)} sec
        </span>
      ),
    },
    {
      title: "Views",
      dataIndex: "views",
      key: "views",
      width: 110,
      render: (views) => (
        <span className="font-semibold text-[#101828]">
          {Number(views || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      title: "Order",
      dataIndex: "displayOrder",
      key: "displayOrder",
      width: 90,
      align: "center",
      render: (order) => (
        <span className="font-medium text-[#475569]">{order ?? 0}</span>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 145,
      render: (_, video) => (
        <div className="flex items-center gap-2">
          <Switch
            size="small"
            checked={Boolean(video.isActive)}
            loading={updatingId === video._id}
            disabled={Boolean(deletingId)}
            onChange={() => handleToggleStatus(video)}
            aria-label={`Toggle ${video.title}`}
          />
          <Tag color={video.isActive ? "success" : "default"}>
            {video.isActive ? "Active" : "Inactive"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      align: "right",
      render: (_, video) => {
        const isBusy = updatingId === video._id || deletingId === video._id;

        return (
          <div className="flex items-center justify-end gap-2">
            <Tooltip title="Watch preview">
              <Button
                size="small"
                icon={<Play size={14} />}
                onClick={() => setPreviewVideo(video)}
                disabled={isBusy}
              />
            </Tooltip>

            <Tooltip title="Delete video">
              <Button
                size="small"
                danger
                icon={<Trash2 size={14} />}
                loading={deletingId === video._id}
                disabled={isBusy}
                onClick={() => setVideoToDelete(video)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Product Videos"
        subtitle="Manage shoppable video reels and product showcases across the ELENZO storefront."
        badge={`${adminVideos.length} Videos`}
        extra={
          <>
            <Button
              icon={
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
              }
              onClick={refreshVideos}
              disabled={loading}
            >
              Refresh
            </Button>

            <Link href="/admin/product-videos/create">
              <Button type="primary" icon={<Plus size={16} />}>
                Upload Video
              </Button>
            </Link>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-[#E2E8F0] shadow-xs">
          <Statistic
            title="Total Videos"
            value={adminVideos.length}
            prefix={<Film size={18} className="text-[#0755E9]" />}
          />
        </Card>

        <Card className="border-[#E2E8F0] shadow-xs">
          <Statistic
            title="Active Videos"
            value={activeCount}
            prefix={<CheckCircle2 size={18} className="text-emerald-600" />}
            styles={{ content: { color: "#059669" } }}
          />
        </Card>

        <Card className="border-[#E2E8F0] shadow-xs">
          <Statistic
            title="Total Video Views"
            value={totalViews}
            prefix={<Eye size={18} className="text-[#0755E9]" />}
          />
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-[#E2E8F0] shadow-xs">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-8">
            <Input
              size="large"
              allowClear
              prefix={<Search size={16} className="text-[#64748B]" />}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search videos by title, description, or product name..."
            />
          </div>

          <div className="md:col-span-4">
            <Select
              size="large"
              className="w-full"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: "All Status", value: "all" },
                { label: "Active Only", value: "active" },
                { label: "Inactive Only", value: "inactive" },
              ]}
            />
          </div>
        </div>
      </Card>

      {(actionError || error) && (
        <Alert
          type="error"
          showIcon
          title={actionError || error}
          closable={Boolean(actionError)}
          onClose={() => setActionError("")}
        />
      )}

      {/* Table */}
      <Card
        className="overflow-hidden border-[#E2E8F0] shadow-xs"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredVideos}
          loading={loading}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          scroll={{ x: 980 }}
          locale={{
            emptyText: (
              <Empty description="No product videos found" className="py-10" />
            ),
          }}
        />
      </Card>

      {/* Preview Modal */}
      <Modal
        open={Boolean(previewVideo)}
        title={previewVideo?.title || "Video Preview"}
        footer={null}
        onCancel={() => setPreviewVideo(null)}
        centered
      >
        {previewVideo && (
          <div className="space-y-3">
            <video
              src={previewVideo.videoUrl}
              controls
              autoPlay
              playsInline
              className="max-h-[68vh] w-full rounded-xl bg-black"
            />
            {previewVideo.product?.name && (
              <p className="text-xs text-[#64748B]">
                Product:{" "}
                <span className="font-semibold text-[#101828]">
                  {previewVideo.product.name}
                </span>
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={Boolean(videoToDelete)}
        title="Delete Product Video"
        onCancel={() => !deletingId && setVideoToDelete(null)}
        onOk={handleConfirmDelete}
        okText="Delete Video"
        okButtonProps={{ danger: true, loading: Boolean(deletingId) }}
        cancelButtonProps={{ disabled: Boolean(deletingId) }}
      >
        <p className="text-sm text-[#475569]">
          Are you sure you want to delete video{" "}
          <span className="font-semibold text-[#101828]">
            {videoToDelete?.title}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
