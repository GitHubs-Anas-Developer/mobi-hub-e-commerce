"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Alert, Button, Card, Progress, Tag, Tooltip } from "antd";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Images,
  Trash2,
  Upload,
} from "lucide-react";

const getImageSrc = (image) => {
  if (!image) return "";

  if (typeof File !== "undefined" && image instanceof File) {
    return URL.createObjectURL(image);
  }

  return image.url || "";
};

const formatFileSize = (file) => {
  if (!file || typeof file.size !== "number") return "";
  if (file.size < 1024 * 1024) {
    return `${Math.max(1, Math.round(file.size / 1024))} KB`;
  }
  return `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
};

export default function ProductImagesSection({
  thumbnail,
  galleryImages = [],
  onThumbnailChange,
  onGalleryChange,
  onRemoveGalleryImage,
  onMoveGalleryImage,
  uploadProgress = null,
  fieldErrors = {},
}) {
  const thumbnailInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const thumbnailSrc = useMemo(() => getImageSrc(thumbnail), [thumbnail]);

  const gallerySources = useMemo(
    () => galleryImages.map((image) => getImageSrc(image)),
    [galleryImages],
  );

  useEffect(() => {
    return () => {
      if (thumbnailSrc.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailSrc);
      }

      gallerySources.forEach((src) => {
        if (src.startsWith("blob:")) {
          URL.revokeObjectURL(src);
        }
      });
    };
  }, [thumbnailSrc, gallerySources]);

  return (
    <Card
      className="!border-[#E2E8F0] shadow-xs"
      title={
        <div className="flex flex-wrap items-center justify-between gap-2 py-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
              <Images size={17} />
            </div>
            <div>
              <h2 className="!m-0 text-base font-bold text-[#101828]">
                Product Images & Media
              </h2>
              <p className="mt-0.5 text-xs font-normal text-[#64748B]">
                High-resolution product thumbnail and gallery photos (JPG, PNG, WEBP up to 5MB each).
              </p>
            </div>
          </div>

          <Tag color={thumbnail ? "blue" : "default"} className="!m-0">
            {thumbnail ? "1 Main" : "0 Main"} • {galleryImages.length}/6 Gallery
          </Tag>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Live Cloudinary Upload Progress */}
        {uploadProgress?.active && (
          <div className="rounded-xl border border-[#0755E9]/25 bg-[#EFF6FF] p-4">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#082B70]">
              <span>{uploadProgress.label || "Uploading images to Cloudinary..."}</span>
              <span>{uploadProgress.percent ?? 0}%</span>
            </div>
            <Progress
              percent={uploadProgress.percent ?? 0}
              status="active"
              strokeColor="#0755E9"
              showInfo={false}
              size="small"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Product Thumbnail */}
          <div className="lg:col-span-5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
                Main Product Image (Thumbnail) *
              </label>
              {thumbnail && (
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<Trash2 size={13} />}
                  onClick={() =>
                    onThumbnailChange({ target: { files: [], value: "" } })
                  }
                >
                  Remove
                </Button>
              )}
            </div>

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onThumbnailChange}
              className="hidden"
            />

            {thumbnailSrc ? (
              <div
                className={`overflow-hidden rounded-xl border bg-white ${
                  fieldErrors.thumbnail ? "border-red-400" : "border-[#E2E8F0]"
                }`}
              >
                <div className="relative flex h-56 w-full items-center justify-center bg-[#F8FAFC] p-4">
                  <Image
                    src={thumbnailSrc}
                    alt="Main product thumbnail preview"
                    fill
                    unoptimized
                    className="object-contain p-3"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-[#E2E8F0] px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#101828]">
                      {thumbnail?.name || "Uploaded thumbnail"}
                    </p>
                    {thumbnail?.size && (
                      <p className="text-[11px] text-[#64748B]">
                        {formatFileSize(thumbnail)}
                      </p>
                    )}
                  </div>

                  <Button
                    size="small"
                    icon={<Upload size={13} />}
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    Replace
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                className={`flex h-56 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed bg-[#F8FAFC] p-6 text-center transition hover:border-[#0755E9] hover:bg-[#EFF6FF]/60 ${
                  fieldErrors.thumbnail
                    ? "border-red-400 bg-red-50/40"
                    : "border-[#CBD5E1]"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#0755E9] shadow-xs">
                  <Upload size={22} />
                </div>
                <span className="mt-3 text-sm font-semibold text-[#101828]">
                  Upload Main Product Image
                </span>
                <span className="mt-1 text-xs text-[#64748B]">
                  Primary image shown in search & product cards
                </span>
                <span className="mt-2 rounded-full border border-[#E2E8F0] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#64748B]">
                  JPG, PNG, WEBP • Max 5MB
                </span>
              </button>
            )}

            {fieldErrors.thumbnail && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {fieldErrors.thumbnail}
              </p>
            )}
          </div>

          {/* Additional Gallery Images */}
          <div className="lg:col-span-7">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
                Additional Gallery Images ({galleryImages.length}/6)
              </label>

              {galleryImages.length < 6 && (
                <Button
                  size="small"
                  type="primary"
                  ghost
                  icon={<ImagePlus size={14} />}
                  onClick={() => galleryInputRef.current?.click()}
                >
                  Add Gallery Photos
                </Button>
              )}
            </div>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onGalleryChange}
              className="hidden"
            />

            {galleryImages.length === 0 ? (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex h-56 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-6 text-center transition hover:border-[#0755E9] hover:bg-[#EFF6FF]/60"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#0755E9] shadow-xs">
                  <ImagePlus size={22} />
                </div>
                <span className="mt-3 text-sm font-semibold text-[#101828]">
                  Add Additional Angle Photos
                </span>
                <span className="mt-1 text-xs text-[#64748B]">
                  Select up to 6 gallery images (sides, ports, packaging)
                </span>
                <span className="mt-2 rounded-full border border-[#E2E8F0] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#64748B]">
                  JPG, PNG, WEBP • Max 5MB per image
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {galleryImages.map((image, index) => (
                    <div
                      key={image.publicId || `${image.name}-${index}`}
                      className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white"
                    >
                      <div className="relative aspect-square bg-[#F8FAFC]">
                        <Image
                          src={gallerySources[index]}
                          alt={`Gallery preview ${index + 1}`}
                          fill
                          unoptimized
                          className="object-contain p-2"
                        />

                        <span className="absolute left-2 top-2 rounded-md bg-[#101828]/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 border-t border-[#E2E8F0] px-2 py-1.5">
                        <div className="flex items-center gap-1">
                          {onMoveGalleryImage && (
                            <>
                              <Tooltip title="Move earlier">
                                <Button
                                  size="small"
                                  disabled={index === 0}
                                  icon={<ArrowLeft size={12} />}
                                  onClick={() =>
                                    onMoveGalleryImage(index, index - 1)
                                  }
                                  aria-label={`Move gallery image ${index + 1} left`}
                                />
                              </Tooltip>

                              <Tooltip title="Move later">
                                <Button
                                  size="small"
                                  disabled={index === galleryImages.length - 1}
                                  icon={<ArrowRight size={12} />}
                                  onClick={() =>
                                    onMoveGalleryImage(index, index + 1)
                                  }
                                  aria-label={`Move gallery image ${index + 1} right`}
                                />
                              </Tooltip>
                            </>
                          )}
                        </div>

                        <Tooltip title="Remove image">
                          <Button
                            size="small"
                            danger
                            icon={<Trash2 size={12} />}
                            onClick={() => onRemoveGalleryImage(index)}
                            aria-label={`Remove gallery image ${index + 1}`}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>

                {onMoveGalleryImage && galleryImages.length > 1 && (
                  <p className="text-xs text-[#64748B]">
                    Tip: Use arrows on gallery cards to set display order on the storefront carousel.
                  </p>
                )}
              </div>
            )}

            {fieldErrors.gallery && (
              <div className="mt-2">
                <Alert type="error" showIcon title={fieldErrors.gallery} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
