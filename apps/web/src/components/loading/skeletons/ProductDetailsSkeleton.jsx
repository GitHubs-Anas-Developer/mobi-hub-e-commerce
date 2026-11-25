
import Skeleton from "./Skeleton";

export default function ProductDetailsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-8 md:grid-cols-2"
      aria-label="Loading product details"
      aria-busy="true"
    >
      {/* Product Images */}
      <div className="space-y-4">
        <Skeleton
          height="400px"
          radius="16px"
        />

        <div className="flex gap-3">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton
              key={item}
              width="75px"
              height="75px"
              radius="10px"
            />
          ))}
        </div>
      </div>

      {/* Product Information */}
      <div className="space-y-5">
        <Skeleton width="35%" height="16px" />

        <Skeleton height="28px" />

        <Skeleton width="50%" height="24px" />

        <Skeleton width="30%" height="18px" />

        <Skeleton height="80px" />

        {/* Stock */}
        <Skeleton width="35%" height="18px" />

        {/* Quantity */}
        <Skeleton width="130px" height="40px" />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Skeleton height="48px" />
          <Skeleton height="48px" />
        </div>

        {/* Delivery Information */}
        <Skeleton height="70px" />
      </div>
    </div>
  );
}
