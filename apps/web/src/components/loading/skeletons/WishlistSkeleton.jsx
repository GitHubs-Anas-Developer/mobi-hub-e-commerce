
import Skeleton from "./Skeleton";
import ProductGridSkeleton from "./ProductGridSkeleton";

export default function WishlistSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton width="150px" height="28px" />
        <Skeleton width="90px" height="20px" />
      </div>

      {/* Wishlist Products */}
      <ProductGridSkeleton count={4} />
    </div>
  );
}
