
import Skeleton from "./Skeleton";

export default function OrderSkeleton({ count = 3 }) {
  return (
    <div className="space-y-5" aria-busy="true">
      <Skeleton width="160px" height="28px" />

      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="space-y-4 rounded-xl border border-gray-100 p-4"
        >
          {/* Order Header */}
          <div className="flex justify-between gap-3">
            <div className="space-y-2">
              <Skeleton width="120px" height="16px" />
              <Skeleton width="90px" height="14px" />
            </div>

            <Skeleton width="85px" height="28px" />
          </div>

          {/* Order Product */}
          <div className="flex gap-4">
            <Skeleton width="85px" height="85px" />

            <div className="flex-1 space-y-3">
              <Skeleton width="80%" height="17px" />
              <Skeleton width="40%" height="15px" />
              <Skeleton width="30%" height="18px" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between">
            <Skeleton width="100px" height="16px" />
            <Skeleton width="100px" height="35px" />
          </div>
        </div>
      ))}
    </div>
  );
}
