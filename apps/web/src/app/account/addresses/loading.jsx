import AddressesSkeleton from "@/components/loading/skeletons/AddressesSkeleton";
import RouteLoadingState from "@/components/loading/RouteLoadingState";

export default function Loading() {
  return (
    <RouteLoadingState label="Loading saved addresses">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <AddressesSkeleton />
      </div>
    </RouteLoadingState>
  );
}
