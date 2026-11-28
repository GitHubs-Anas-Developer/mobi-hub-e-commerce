import CartSkeleton from "@/components/loading/skeletons/CartSkeleton";
import RouteLoadingState from "@/components/loading/RouteLoadingState";

export default function Loading() {
  return (
    <RouteLoadingState label="Loading your shopping cart">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <CartSkeleton />
      </div>
    </RouteLoadingState>
  );
}
