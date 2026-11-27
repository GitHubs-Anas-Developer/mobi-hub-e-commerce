"use client";

import { Button } from "antd";
import { ArrowLeft, FileText, Rocket } from "lucide-react";

export default function ProductFormActions({
  loading,
  loadingAction = "publish",
  onCancel,
  onSaveDraft,
  submitLabel = "Publish Product",
  draftLabel = "Save as Draft",
  loadingLabel = "Saving Product...",
}) {
  return (
    <div className="flex flex-col-reverse items-stretch justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-xs sm:flex-row sm:items-center">
      <Button
        size="large"
        onClick={onCancel}
        disabled={loading}
        icon={<ArrowLeft size={15} />}
      >
        Back to Products
      </Button>

      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center">
        {onSaveDraft && (
          <Button
            size="large"
            onClick={onSaveDraft}
            disabled={loading}
            loading={loading && loadingAction === "draft"}
            icon={<FileText size={15} />}
          >
            {loading && loadingAction === "draft" ? "Saving Draft..." : draftLabel}
          </Button>
        )}

        <Button
          type="primary"
          size="large"
          htmlType="submit"
          loading={loading && loadingAction === "publish"}
          disabled={loading}
          icon={<Rocket size={15} />}
        >
          {loading && loadingAction === "publish" ? loadingLabel : submitLabel}
        </Button>
      </div>
    </div>
  );
}
