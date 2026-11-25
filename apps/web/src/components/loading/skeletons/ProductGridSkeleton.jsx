
import ProductSkeleton from "./ProductSkeleton";

export default function ProductGridSkeleton({
  count = 8,
  className = "",
}) {
  return (
    <div
      className={`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${className}`}
      aria-label="Loading products"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
}
