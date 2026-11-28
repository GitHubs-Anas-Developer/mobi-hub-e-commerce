import CheckoutSkeleton from "@/components/loading/skeletons/CheckoutSkeleton";
import RouteLoadingState from "@/components/loading/RouteLoadingState";

export default function Loading() {
  return (
    <RouteLoadingState label="Loading checkout">
      <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
        <CheckoutSkeleton />
      </div>
    </RouteLoadingState>
  );
}
