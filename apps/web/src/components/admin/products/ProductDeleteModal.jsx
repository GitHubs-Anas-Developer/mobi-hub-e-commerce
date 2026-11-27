"use client";

import { Modal } from "antd";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function ProductDeleteModal({
  product,
  loading,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={Boolean(product)}
      onCancel={() => !loading && onCancel?.()}
      onOk={onConfirm}
      okText="Delete Product"
      okButtonProps={{ danger: true, loading, icon: <Trash2 size={14} /> }}
      cancelButtonProps={{ disabled: loading }}
      title={
        <span className="inline-flex items-center gap-2 font-bold text-[#101828]">
          <AlertTriangle size={18} className="text-red-600" />
          Delete Product?
        </span>
      }
    >
      <p className="py-2 text-sm text-[#64748B]">
        Are you sure you want to permanently remove{" "}
        <strong className="text-[#101828]">{product?.name}</strong>? This action
        cannot be undone.
      </p>
    </Modal>
  );
}
