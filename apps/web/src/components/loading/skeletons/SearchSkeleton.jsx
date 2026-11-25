
import Skeleton from "./Skeleton";

export default function SearchSkeleton({ count = 5 }) {
  return (
    <div
      className="space-y-3"
      aria-label="Loading search results"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton width="55px" height="55px" radius="8px" />

          <div className="flex-1 space-y-2">
            <Skeleton width="80%" height="15px" />
            <Skeleton width="40%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
}
