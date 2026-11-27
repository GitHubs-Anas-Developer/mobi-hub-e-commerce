"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Input,
  Pagination,
  Statistic,
  Table,
  Tag,
} from "antd";
import { Mail, RefreshCw, Search, UserCheck, UserMinus } from "lucide-react";

import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import newsletterService from "@/services/newsletterService";

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

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ totalSubscribers: 0, unsubscribedCount: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNewsletter = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [subRes, statRes] = await Promise.all([
        newsletterService.getSubscribers({
          page: filters.page,
          limit: filters.limit,
          search: filters.search.trim(),
        }),
        newsletterService.getStats(),
      ]);

      setSubscribers(subRes.data?.subscribers || []);
      setPagination(subRes.data?.pagination || { total: 0, page: 1, limit: 10 });
      setStats(statRes.data || { totalSubscribers: 0, unsubscribedCount: 0 });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load newsletter subscribers.",
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadNewsletter();
    });
    return () => {
      active = false;
    };
  }, [loadNewsletter]);

  const columns = [
    {
      title: "Subscriber Email",
      dataIndex: "email",
      render: (email) => (
        <span className="font-semibold text-[#101828]">{email}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (st) => (
        <Tag color={st === "subscribed" ? "green" : "default"}>
          {st || "subscribed"}
        </Tag>
      ),
    },
    {
      title: "Subscribed On",
      dataIndex: "subscribedAt",
      render: (d, r) => (
        <span className="text-xs text-[#64748B]">
          {formatDate(d || r.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsletter Subscribers"
        subtitle="Track ELENZO email newsletter growth and active subscriber list."
        badge={`${stats.totalSubscribers || 0} Active`}
        extra={
          <Button
            icon={
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
            }
            onClick={loadNewsletter}
          >
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Active Subscribers"
            value={stats.totalSubscribers || 0}
            prefix={<UserCheck size={16} className="mr-1 text-emerald-600" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Unsubscribed"
            value={stats.unsubscribedCount || 0}
            prefix={<UserMinus size={16} className="mr-1 text-slate-500" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Filtered List"
            value={pagination.total || 0}
            prefix={<Mail size={16} className="mr-1 text-[#0755E9]" />}
          />
        </Card>
      </div>

      <Card className="!border-[#E2E8F0]">
        <Input
          allowClear
          value={filters.search}
          onChange={(e) =>
            setFilters((p) => ({ ...p, search: e.target.value, page: 1 }))
          }
          prefix={<Search size={15} className="text-[#94A3B8]" />}
          placeholder="Search subscriber email..."
          className="max-w-md"
        />
      </Card>

      {error && <Alert type="error" showIcon title={error} />}

      <Card className="!border-[#E2E8F0]" styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={subscribers}
          loading={loading}
          pagination={false}
          scroll={{ x: 580 }}
        />

        <div className="flex justify-end border-t border-[#E2E8F0] px-5 py-4">
          <Pagination
            current={pagination.page || filters.page}
            total={pagination.total || 0}
            pageSize={filters.limit}
            onChange={(page, limit) => setFilters((p) => ({ ...p, page, limit }))}
          />
        </div>
      </Card>
    </div>
  );
}

