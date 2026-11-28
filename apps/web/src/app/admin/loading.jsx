import AdminPageSkeleton from "@/components/loading/skeletons/AdminPageSkeleton";
import RouteLoadingState from "@/components/loading/RouteLoadingState";

export default function Loading() {
  return (
    <RouteLoadingState label="Loading admin workspace">
      <AdminPageSkeleton />
    </RouteLoadingState>
  );
}
