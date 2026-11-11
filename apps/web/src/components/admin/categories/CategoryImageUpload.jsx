
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";

export default function CategoryImageUpload({
  image,
  onImageChange,
  onImageRemove,
}) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }

    if (image instanceof File) {
      const objectUrl = URL.createObjectURL(image);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreview(image.url || "");
  }, [image]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a JPG, PNG or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    onImageChange(file);
    e.target.value = "";
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Category Image
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Upload a category image. JPG, PNG or WEBP, maximum 5MB.
        </p>
      </div>

      <div className="mt-5">
        {preview ? (
          <div className="relative max-w-sm">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <Image
                src={preview}
                alt="Category preview"
                fill
                unoptimized
                className="object-contain p-2"
              />
            </div>

            <button
              type="button"
              onClick={onImageRemove}
              className="absolute -right-2 -top-2 rounded-full bg-red-600 p-2 text-white shadow hover:bg-red-700"
              aria-label="Remove category image"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ) : (
          <label className="flex min-h-48 max-w-sm cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-blue-500 hover:bg-blue-50">
            <ImagePlus size={32} className="text-slate-400" />

            <span className="mt-3 text-sm font-medium text-slate-700">
              Click to select category image
            </span>

            <span className="mt-1 text-xs text-slate-500">
              JPG, PNG or WEBP (Max 5MB)
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

        {image instanceof File && (
          <p className="mt-3 max-w-sm truncate text-xs text-slate-500">
            Selected: {image.name}
          </p>
        )}
      </div>
    </section>
  );
}
