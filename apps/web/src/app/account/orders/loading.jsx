import OrdersSkeleton from "@/components/loading/skeletons/OrdersSkeleton";
import RouteLoadingState from "@/components/loading/RouteLoadingState";

export default function Loading() {
  return (
    <RouteLoadingState label="Loading your orders">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <OrdersSkeleton />
      </div>
    </RouteLoadingState>
  );
}
