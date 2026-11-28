import ProductsPageSkeleton from "@/components/loading/skeletons/ProductsPageSkeleton";
import RouteLoadingState from "@/components/loading/RouteLoadingState";

export default function Loading() {
  return (
    <RouteLoadingState label="Loading products">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <ProductsPageSkeleton />
      </div>
    </RouteLoadingState>
  );
}
