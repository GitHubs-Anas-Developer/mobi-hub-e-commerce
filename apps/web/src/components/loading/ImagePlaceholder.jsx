
"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImagePlaceholder({
  src,
  alt = "Product image",
  className = "",
  sizes = "(max-width: 640px) 50vw, 25vw",
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-gray-100 ${className}`}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      {error ? (
        <div className="flex h-full items-center justify-center text-xs text-gray-400">
          Image unavailable
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={`object-contain transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
