import TrackingSkeleton from "@/components/loading/skeletons/TrackingSkeleton";
import RouteLoadingState from "@/components/loading/RouteLoadingState";

export default function Loading() {
  return (
    <RouteLoadingState label="Loading shipment tracking">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <TrackingSkeleton />
      </div>
    </RouteLoadingState>
  );
}
