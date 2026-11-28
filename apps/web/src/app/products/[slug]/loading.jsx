import ProductDetailSkeleton from "@/components/products/details/ProductDetailSkeleton";
import RouteLoadingState from "@/components/loading/RouteLoadingState";

export default function Loading() {
  return (
    <RouteLoadingState label="Loading product details">
      <ProductDetailSkeleton />
    </RouteLoadingState>
  );
}
