
import { Package } from "lucide-react";

export default function ProductGallery({
  product,
  productImages = [],
  selectedImage,
  setSelectedImage,
  discount = 0,
}) {
  return (
    <div>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={product.name}
            className="h-full w-full object-contain p-6"
          />
        ) : (
          <Package size={80} className="text-slate-300" />
        )}

        {discount > 0 && (
          <span className="absolute left-4 top-4 rounded-md bg-red-600 px-3 py-1.5 text-sm font-bold text-white">
            {discount}% OFF
          </span>
        )}
      </div>

      {productImages.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {productImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              aria-label={`View product image ${index + 1}`}
              aria-pressed={selectedImage === image}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-slate-50 p-2 ${
                selectedImage === image
                  ? "border-[#1D4ED8]"
                  : "border-[#E2E8F0]"
              }`}
            >
              <img
                src={image}
                alt={`${product.name} ${index + 1}`}
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
