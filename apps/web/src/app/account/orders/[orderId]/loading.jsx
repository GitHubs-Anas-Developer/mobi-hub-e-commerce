import OrderDetailsSkeleton from "@/components/loading/skeletons/OrderDetailsSkeleton";
import RouteLoadingState from "@/components/loading/RouteLoadingState";

export default function Loading() {
  return (
    <RouteLoadingState label="Loading order details">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <OrderDetailsSkeleton />
      </div>
    </RouteLoadingState>
  );
}
