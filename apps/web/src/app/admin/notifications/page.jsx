"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Pagination,
  Space,
  Table,
  Tag,
} from "antd";
import { Bell, CheckCheck, RefreshCw, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import {
  deleteAllNotifications,
  deleteNotification,
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/store/thunks/notificationThunks";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default function AdminNotificationsPage() {
  const dispatch = useDispatch();
  const { notification } = AntdApp.useApp();
  const { notifications, pagination, unreadCount, isLoading, isMutating, error } =
    useSelector((state) => state.notifications);

  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchNotifications({ page, limit: 10 }));
  }, [dispatch, page]);

  const handleMarkRead = async (id) => {
    try {
      await dispatch(markNotificationAsRead(id)).unwrap();
    } catch (err) {
      notification.error({ message: err || "Unable to update notification" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteNotification(id)).unwrap();
      notification.success({ message: "Notification removed" });
    } catch (err) {
      notification.error({ message: err || "Unable to delete notification" });
    }
  };

  const columns = [
    {
      title: "Notification",
      key: "title",
      render: (_, r) => (
        <div>
          <div className="flex items-center gap-2">
            {!r.isRead && (
              <span className="h-2 w-2 rounded-full bg-[#0755E9]" />
            )}
            <span className="font-bold text-[#101828]">{r.title}</span>
            <Tag className="!m-0 !text-[10px]">{r.type}</Tag>
          </div>
          <p className="mt-1 text-xs text-[#64748B]">{r.message}</p>
        </div>
      ),
    },
    {
      title: "Received",
      dataIndex: "createdAt",
      width: 170,
      render: (d) => <span className="text-xs text-[#64748B]">{formatDate(d)}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 210,
      render: (_, r) => (
        <Space size="small">
          {r.relatedModel === "Order" && r.relatedId && (
            <Link href={`/admin/orders/${r.relatedId}`}>
              <Button size="small" type="primary">
                Order
              </Button>
            </Link>
          )}
          {!r.isRead && (
            <Button
              size="small"
              loading={isMutating}
              onClick={() => handleMarkRead(r._id)}
            >
              Read
            </Button>
          )}
          <Button
            size="small"
            danger
            icon={<Trash2 size={13} />}
            loading={isMutating}
            onClick={() => handleDelete(r._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifications Center"
        subtitle="System alerts for incoming orders, cancellations, and refunds."
        badge={`${unreadCount} Unread`}
        extra={
          <Space wrap>
            <Button
              icon={
                <RefreshCw
                  size={14}
                  className={isLoading ? "animate-spin" : ""}
                />
              }
              onClick={() => dispatch(fetchNotifications({ page, limit: 10 }))}
            >
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                icon={<CheckCheck size={14} />}
                onClick={() => dispatch(markAllNotificationsAsRead())}
              >
                Mark All Read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                danger
                icon={<Trash2 size={14} />}
                onClick={() => dispatch(deleteAllNotifications())}
              >
                Clear All
              </Button>
            )}
          </Space>
        }
      />

      {error && <Alert type="error" showIcon title={error} />}

      <Card className="!border-[#E2E8F0]" styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={notifications}
          loading={isLoading}
          pagination={false}
          scroll={{ x: 650 }}
          locale={{
            emptyText: (
              <div className="py-8 text-center">
                <Bell size={28} className="mx-auto mb-2 text-[#94A3B8]" />
                <p className="text-sm text-[#64748B]">All caught up!</p>
              </div>
            ),
          }}
        />
        <div className="flex justify-end border-t border-[#E2E8F0] px-5 py-4">
          <Pagination
            current={pagination?.page || page}
            total={pagination?.total || 0}
            pageSize={10}
            onChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
}

