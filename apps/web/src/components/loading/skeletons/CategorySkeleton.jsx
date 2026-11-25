
import Skeleton from "./Skeleton";

export default function CategorySkeleton({ count = 6 }) {
  return (
    <div
      className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6"
      aria-busy="true"
      aria-label="Loading categories"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center gap-3"
        >
          <Skeleton
            width="76px"
            height="76px"
            radius="50%"
          />

          <Skeleton width="80%" height="14px" />
        </div>
      ))}
    </div>
  );
}
