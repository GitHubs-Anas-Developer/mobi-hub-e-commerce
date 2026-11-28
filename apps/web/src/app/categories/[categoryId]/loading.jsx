import { CategoryDetailsSkeleton } from "@/components/categories/CategorySkeleton";
import RouteLoadingState from "@/components/loading/RouteLoadingState";

export default function Loading() {
  return (
    <RouteLoadingState label="Loading category">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <CategoryDetailsSkeleton />
      </div>
    </RouteLoadingState>
  );
}
