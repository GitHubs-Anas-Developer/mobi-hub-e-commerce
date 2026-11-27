"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Statistic,
  Table,
  Tabs,
  Tag,
} from "antd";
import { AlertTriangle, Boxes, History, RefreshCw } from "lucide-react";

import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import adminInventoryService from "@/services/adminInventoryService";

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

export default function AdminInventoryPage() {
  const { notification } = AntdApp.useApp();

  const [lowStock, setLowStock] = useState([]);
  const [lowPagination, setLowPagination] = useState({ total: 0, page: 1, limit: 10 });
  const [outStock, setOutStock] = useState([]);
  const [outPagination, setOutPagination] = useState({ total: 0, page: 1, limit: 10 });
  const [history, setHistory] = useState([]);
  const [histPagination, setHistPagination] = useState({ total: 0, page: 1, limit: 10 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustmentValue, setAdjustmentValue] = useState(10);
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [savingAdjust, setSavingAdjust] = useState(false);

  const loadAll = useCallback(async (pages = {}) => {
    try {
      setLoading(true);
      setError("");
      const [lowRes, outRes, histRes] = await Promise.all([
        adminInventoryService.getLowStock({ page: pages.low || 1, limit: 10 }),
        adminInventoryService.getOutOfStock({ page: pages.out || 1, limit: 10 }),
        adminInventoryService.getHistory({ page: pages.hist || 1, limit: 10 }),
      ]);

      setLowStock(lowRes.data?.products || []);
      setLowPagination(lowRes.data?.pagination || { total: 0, page: 1, limit: 10 });
      setOutStock(outRes.data?.products || []);
      setOutPagination(outRes.data?.pagination || { total: 0, page: 1, limit: 10 });
      setHistory(histRes.data?.transactions || histRes.data?.history || []);
      setHistPagination(
        histRes.data?.pagination || { total: 0, page: 1, limit: 10 },
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadAll();
    });
    return () => {
      active = false;
    };
  }, [loadAll]);

  const handleAdjustSubmit = async () => {
    if (!adjustTarget || savingAdjust || !adjustmentValue) return;
    try {
      setSavingAdjust(true);
      await adminInventoryService.adjustStock({
        productId: adjustTarget.productId,
        variantId: adjustTarget.variantId,
        adjustment: Number(adjustmentValue),
        note: adjustmentNote.trim() || "Admin restock adjustment",
      });

      notification.success({
        message: "Stock Adjusted",
        description: `Updated stock for SKU ${adjustTarget.sku}.`,
      });
      setAdjustTarget(null);
      setAdjustmentNote("");
      await loadAll();
    } catch (err) {
      notification.error({
        message: "Adjustment Failed",
        description:
          err.response?.data?.message || "Unable to adjust stock quantity.",
      });
    } finally {
      setSavingAdjust(false);
    }
  };

  const variantColumns = [
    {
      title: "Product",
      key: "productName",
      render: (_, r) => (
        <Link
          href={`/admin/products/${r.productId}/edit`}
          className="font-bold text-[#0755E9] hover:underline"
        >
          {r.productName}
        </Link>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      render: (sku) => <span className="font-mono text-xs font-semibold">{sku}</span>,
    },
    {
      title: "Current Stock",
      dataIndex: "stock",
      render: (stock) => (
        <Tag color={stock === 0 ? "red" : "orange"}>
          {stock === 0 ? "Out of stock" : `${stock} units`}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, r) => (
        <Button
          size="small"
          type="primary"
          onClick={() => {
            setAdjustTarget(r);
            setAdjustmentValue(10);
            setAdjustmentNote("");
          }}
        >
          Adjust Stock
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      title: "SKU",
      dataIndex: "sku",
      render: (sku) => <span className="font-mono text-xs font-semibold">{sku}</span>,
    },
    {
      title: "Product",
      key: "product",
      render: (_, r) => r.product?.name || "—",
    },
    {
      title: "Type",
      key: "type",
      render: (_, r) => (
        <Tag color={r.direction === "IN" ? "green" : "volcano"}>
          {r.type} ({r.direction} {r.quantity})
        </Tag>
      ),
    },
    {
      title: "Stock Change",
      key: "change",
      render: (_, r) => (
        <span className="text-xs font-semibold">
          {r.stockBefore} -&gt; {r.stockAfter}
        </span>
      ),
    },
    {
      title: "Note",
      dataIndex: "note",
      render: (n) => <span className="text-xs text-[#64748B]">{n || "—"}</span>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (d) => <span className="text-xs text-[#64748B]">{formatDate(d)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Inventory & Stock Control"
        subtitle="Monitor variant stock thresholds, restock out-of-stock SKUs, and inspect ledger logs."
        extra={
          <Button
            icon={
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
            }
            onClick={() => loadAll()}
          >
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Low-Stock Variants"
            value={lowPagination.total || 0}
            prefix={<AlertTriangle size={16} className="mr-1 text-orange-600" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Out-of-Stock Variants"
            value={outPagination.total || 0}
            prefix={<Boxes size={16} className="mr-1 text-red-600" />}
          />
        </Card>
        <Card className="!border-[#E2E8F0]">
          <Statistic
            title="Ledger Movements"
            value={histPagination.total || 0}
            prefix={<History size={16} className="mr-1 text-[#0755E9]" />}
          />
        </Card>
      </div>

      {error && <Alert type="error" showIcon title={error} />}

      <Card className="!border-[#E2E8F0]">
        <Tabs
          items={[
            {
              key: "low",
              label: `Low Stock (${lowPagination.total || 0})`,
              children: (
                <>
                  <Table
                    rowKey="variantId"
                    columns={variantColumns}
                    dataSource={lowStock}
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 650 }}
                  />
                  <div className="mt-4 flex justify-end">
                    <Pagination
                      current={lowPagination.page}
                      total={lowPagination.total}
                      pageSize={10}
                      onChange={(p) => loadAll({ low: p })}
                    />
                  </div>
                </>
              ),
            },
            {
              key: "out",
              label: `Out of Stock (${outPagination.total || 0})`,
              children: (
                <>
                  <Table
                    rowKey="variantId"
                    columns={variantColumns}
                    dataSource={outStock}
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 650 }}
                  />
                  <div className="mt-4 flex justify-end">
                    <Pagination
                      current={outPagination.page}
                      total={outPagination.total}
                      pageSize={10}
                      onChange={(p) => loadAll({ out: p })}
                    />
                  </div>
                </>
              ),
            },
            {
              key: "history",
              label: "Inventory Ledger",
              children: (
                <>
                  <Table
                    rowKey="_id"
                    columns={historyColumns}
                    dataSource={history}
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 860 }}
                  />
                  <div className="mt-4 flex justify-end">
                    <Pagination
                      current={histPagination.page}
                      total={histPagination.total}
                      pageSize={10}
                      onChange={(p) => loadAll({ hist: p })}
                    />
                  </div>
                </>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={Boolean(adjustTarget)}
        title={`Adjust Stock · ${adjustTarget?.sku || ""}`}
        onCancel={() => !savingAdjust && setAdjustTarget(null)}
        onOk={handleAdjustSubmit}
        okText="Apply Stock Adjustment"
        confirmLoading={savingAdjust}
      >
        {adjustTarget && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-[#64748B]">
              Product: <strong>{adjustTarget.productName}</strong> · Current:{" "}
              <strong>{adjustTarget.stock} units</strong>
            </p>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#64748B]">
                Adjustment (+/- Quantity)
              </label>
              <InputNumber
                className="!w-full"
                value={adjustmentValue}
                onChange={setAdjustmentValue}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#64748B]">
                Audit Note
              </label>
              <Input
                value={adjustmentNote}
                onChange={(e) => setAdjustmentNote(e.target.value)}
                placeholder="Reason for inventory adjustment"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

