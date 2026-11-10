
"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { ImagePlus, Trash2, Upload } from "lucide-react";

const getImageSrc = (image) => {
  if (!image) return "";

  if (typeof File !== "undefined" && image instanceof File) {
    return URL.createObjectURL(image);
  }

  return image.url || "";
};

export default function ProductImagesSection({
  thumbnail,
  galleryImages,
  onThumbnailChange,
  onGalleryChange,
  onRemoveGalleryImage,
}) {
  const thumbnailSrc = useMemo(
    () => getImageSrc(thumbnail),
    [thumbnail],
  );

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
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Product Images
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Upload your product thumbnail and gallery images.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Thumbnail */}
        <div>
          <label className="mb-3 block text-sm font-medium text-slate-700">
            Product Thumbnail *
          </label>

          <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-blue-500 hover:bg-blue-50">
            {thumbnailSrc ? (
              <div className="relative h-40 w-full">
                <Image
                  src={thumbnailSrc}
                  alt="Product thumbnail preview"
                  fill
                  unoptimized
                  className="rounded-lg object-contain"
                />
              </div>
            ) : (
              <>
                <Upload size={28} className="text-slate-400" />

                <span className="mt-3 text-sm font-medium text-slate-700">
                  Click to upload thumbnail
                </span>

                <span className="mt-1 text-xs text-slate-500">
                  JPG, PNG or WEBP (Max 5MB)
                </span>
              </>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onThumbnailChange}
              className="hidden"
            />
          </label>

          {thumbnail && (
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="truncate text-xs text-slate-500">
                {thumbnail.name || "Existing thumbnail"}
              </p>

              <button
                type="button"
                onClick={() =>
                  onThumbnailChange({
                    target: { files: [] },
                  })
                }
                className="shrink-0 text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Gallery */}
        <div>
          <label className="mb-3 block text-sm font-medium text-slate-700">
            Gallery Images
          </label>

          <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-blue-500 hover:bg-blue-50">
            <ImagePlus size={28} className="text-slate-400" />

            <span className="mt-3 text-sm font-medium text-slate-700">
              Click to upload gallery images
            </span>

            <span className="mt-1 text-xs text-slate-500">
              Maximum 6 images
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onGalleryChange}
              className="hidden"
            />
          </label>

          {galleryImages.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {galleryImages.map((image, index) => (
                <div
                  key={image.publicId || image.name || index}
                  className="relative"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                    <Image
                      src={gallerySources[index]}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveGalleryImage(index)}
                    className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1.5 text-white shadow hover:bg-red-700"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
