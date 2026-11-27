"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Drawer,
  Input,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import { Eye, RefreshCw, Search, Truck } from "lucide-react";

import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import adminOrderService from "@/services/adminOrderService";

const SHIPMENT_COLORS = {
  PENDING: "gold",
  NEW: "blue",
  "PICKUP SCHEDULED": "cyan",
  "PICKED UP": "geekblue",
  "IN TRANSIT": "purple",
  "OUT FOR DELIVERY": "orange",
  DELIVERED: "green",
};

export default function AdminShippingPage() {
  const { notification } = AntdApp.useApp();

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    totalOrders: 0,
    currentPage: 1,
    limit: 10,
  });
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [drawerOrder, setDrawerOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    provider: "SHIPROCKET",
    courierName: "",
    shipmentId: "",
    awbCode: "",
    status: "",
    description: "",
    location: "",
  });

  const loadShipments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: filters.page,
        limit: filters.limit,
        sort: "newest",
      };
      if (filters.status !== "all") params.status = filters.status;
      if (filters.search.trim()) params.search = filters.search.trim();

      const res = await adminOrderService.getOrders(params);
      setOrders(res.data?.orders || []);
      setPagination(
        res.data?.pagination || { totalOrders: 0, currentPage: 1, limit: 10 },
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load shipment queue.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadShipments();
    });
    return () => {
      active = false;
    };
  }, [loadShipments]);

  const openUpdateDrawer = (order) => {
    const s = order.shipment || {};
    setDrawerOrder(order);
    setFormState({
      provider: s.provider || "SHIPROCKET",
      courierName: s.courierName || "",
      shipmentId: s.shipmentId || "",
      awbCode: s.awbCode || "",
      status: "",
      description: "",
      location: s.lastLocation || "",
    });
  };

  const handleSaveTracking = async (event) => {
    event.preventDefault();
    if (!drawerOrder?._id || saving) return;

    try {
      setSaving(true);
      const payload = {
        provider: formState.provider,
        ...(formState.courierName.trim()
          ? { courierName: formState.courierName.trim() }
          : {}),
        ...(formState.shipmentId.trim()
          ? { shipmentId: formState.shipmentId.trim() }
          : {}),
        ...(formState.awbCode.trim()
          ? { awbCode: formState.awbCode.trim() }
          : {}),
        ...(formState.location.trim()
          ? { location: formState.location.trim() }
          : {}),
        ...(formState.status
          ? {
              status: formState.status,
              description:
                formState.description.trim() ||
                `Shipment marked as ${formState.status}`,
            }
          : {}),
      };

      await adminOrderService.updateShipmentTracking(drawerOrder._id, payload);
      notification.success({
        message: "Shipment Updated",
        description: `Tracking updated for ${drawerOrder.orderNumber}.`,
      });
      setDrawerOrder(null);
      await loadShipments();
    } catch (err) {
      notification.error({
        message: "Update Failed",
        description:
          err.response?.data?.message || "Unable to update shipment tracking.",
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (num, record) => (
        <Link
          href={`/admin/orders/${record._id}`}
          className="font-bold text-[#0755E9] hover:underline"
        >
          {num}
        </Link>
      ),
    },
    {
      title: "Order Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => <Tag>{status}</Tag>,
    },
    {
      title: "Courier / Provider",
      key: "provider",
      render: (_, r) => (
        <div>
          <p className="font-semibold text-[#101828]">
            {r.shipment?.courierName || r.shipment?.provider || "Unassigned"}
          </p>
          <p className="font-mono text-xs text-[#64748B]">
            AWB: {r.shipment?.awbCode || "—"}
          </p>
        </div>
      ),
    },
    {
      title: "Shipment Stage",
      key: "shipmentStage",
      render: (_, r) => {
        const st = String(r.shipment?.currentStatus || "PENDING").toUpperCase();
        return <Tag color={SHIPMENT_COLORS[st] || "default"}>{st}</Tag>;
      },
    },
    {
      title: "Destination",
      key: "dest",
      render: (_, r) => (
        <span className="text-xs text-[#64748B]">
          {[r.shippingAddress?.city, r.shippingAddress?.state]
            .filter(Boolean)
            .join(", ") || "—"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          {record.orderStatus !== "Cancelled" && (
            <Button
              size="small"
              type="primary"
              icon={<Truck size={13} />}
              onClick={() => openUpdateDrawer(record)}
            >
              Update
            </Button>
          )}
          <Link href={`/admin/orders/${record._id}`}>
            <Button size="small" icon={<Eye size={13} />}>
              Order
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Shipping & Tracking"
        subtitle="Manage courier assignments, AWB tracking numbers, and delivery progression."
        badge={`${pagination.totalOrders || 0} Shipments`}
        extra={
          <Button
            icon={
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
            }
            onClick={loadShipments}
          >
            Refresh
          </Button>
        }
      />

      <Card className="!border-[#E2E8F0]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <Input
              allowClear
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value, page: 1 }))
              }
              prefix={<Search size={15} className="text-[#94A3B8]" />}
              placeholder="Search order #, customer, SKU..."
            />
          </div>
          <Select
            value={filters.status}
            onChange={(status) =>
              setFilters((p) => ({ ...p, status, page: 1 }))
            }
            options={[
              { value: "all", label: "All Fulfillment Stages" },
              { value: "Confirmed", label: "Confirmed" },
              { value: "Processing", label: "Processing" },
              { value: "Shipped", label: "Shipped" },
              { value: "Delivered", label: "Delivered" },
            ]}
          />
        </div>
      </Card>

      {error && <Alert type="error" showIcon title={error} />}

      <Card className="!border-[#E2E8F0]" styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={false}
          scroll={{ x: 880 }}
        />

        <div className="flex justify-end border-t border-[#E2E8F0] px-5 py-4">
          <Pagination
            current={pagination.currentPage || filters.page}
            total={pagination.totalOrders || 0}
            pageSize={filters.limit}
            onChange={(page, limit) => setFilters((p) => ({ ...p, page, limit }))}
          />
        </div>
      </Card>

      <Drawer
        title={
          drawerOrder
            ? `Update Shipment · ${drawerOrder.orderNumber}`
            : "Update Shipment"
        }
        open={Boolean(drawerOrder)}
        onClose={() => !saving && setDrawerOrder(null)}
        styles={{ wrapper: { width: "min(480px, 100vw)" } }}
      >
        {drawerOrder && (
          <form onSubmit={handleSaveTracking} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#64748B]">
                Provider
              </label>
              <Select
                className="w-full"
                value={formState.provider}
                onChange={(provider) => setFormState((p) => ({ ...p, provider }))}
                options={[
                  { value: "SHIPROCKET", label: "Shiprocket" },
                  { value: "SELF", label: "Self Shipping" },
                  { value: "OTHER", label: "Other" },
                ]}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#64748B]">
                Courier Name
              </label>
              <Input
                value={formState.courierName}
                onChange={(e) =>
                  setFormState((p) => ({ ...p, courierName: e.target.value }))
                }
                placeholder="e.g. BlueDart / Delhivery"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-[#64748B]">
                  Shipment ID
                </label>
                <Input
                  value={formState.shipmentId}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, shipmentId: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-[#64748B]">
                  AWB Code
                </label>
                <Input
                  value={formState.awbCode}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, awbCode: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#64748B]">
                Advance Tracking Stage (Optional)
              </label>
              <Select
                className="w-full"
                value={formState.status}
                onChange={(status) => setFormState((p) => ({ ...p, status }))}
                options={[
                  { value: "", label: "Courier details only" },
                  { value: "NEW", label: "New" },
                  { value: "PICKUP SCHEDULED", label: "Pickup Scheduled" },
                  { value: "PICKED UP", label: "Picked Up" },
                  { value: "IN TRANSIT", label: "In Transit" },
                  { value: "OUT FOR DELIVERY", label: "Out for Delivery" },
                  { value: "DELIVERED", label: "Delivered" },
                ]}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#64748B]">
                Current Location
              </label>
              <Input
                value={formState.location}
                onChange={(e) =>
                  setFormState((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="Hub city"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#64748B]">
                Event Description
              </label>
              <Input.TextArea
                rows={3}
                value={formState.description}
                onChange={(e) =>
                  setFormState((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Required when changing status"
              />
            </div>

            <Button type="primary" htmlType="submit" loading={saving} block>
              Save Tracking Update
            </Button>
          </form>
        )}
      </Drawer>
    </div>
  );
}

