"use client";

import { Button, Space } from "antd";
import { ArrowLeft, Save } from "lucide-react";

export default function ProductFormActions({
  loading,
  onCancel,
  submitLabel = "Create Product",
  loadingLabel = "Saving...",
}) {
  return (
    <div className="flex justify-end border-t border-[#E2E8F0] pt-4">
      <Space wrap>
        <Button
          onClick={onCancel}
          disabled={loading}
          icon={<ArrowLeft size={15} />}
        >
          Cancel
        </Button>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<Save size={15} />}
        >
          {loading ? loadingLabel : submitLabel}
        </Button>
      </Space>
    </div>
  );
}
