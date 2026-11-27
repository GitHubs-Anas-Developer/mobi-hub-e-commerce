import Spinner from "./Spinner";
import { BRAND_ASSETS, BRAND_NAME } from "@/config/brand";

export default function PageLoader({
  text = "Loading...",
  fullScreen = false,
}) {
  return (
    <div
      role="status"
      aria-label={text}
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen ? "min-h-screen bg-white" : "min-h-[300px]"
      }`}
    >
      {fullScreen && (
        <img
          src={BRAND_ASSETS.icon}
          alt={BRAND_NAME}
          className="mb-1 h-10 w-10 object-contain"
        />
      )}
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
