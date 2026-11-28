import ProfileSkeleton from "@/components/loading/skeletons/ProfileSkeleton";
import RouteLoadingState from "@/components/loading/RouteLoadingState";

export default function Loading() {
  return (
    <RouteLoadingState label="Loading your profile">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <ProfileSkeleton />
      </div>
    </RouteLoadingState>
  );
}
