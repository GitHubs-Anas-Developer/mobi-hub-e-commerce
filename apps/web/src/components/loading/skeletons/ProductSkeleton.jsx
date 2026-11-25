
import Skeleton from "./Skeleton";

export default function ProductSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3">
      <Skeleton height="180px" radius="10px" />

      <div className="mt-4 space-y-3">
        <Skeleton width="75%" height="14px" />
        <Skeleton width="95%" height="18px" />
        <Skeleton width="45%" height="20px" />
        <Skeleton height="38px" radius="8px" />
      </div>
    </div>
  );
}
