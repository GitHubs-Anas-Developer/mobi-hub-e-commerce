
import Spinner from "./Spinner";

export default function PageLoader({
  text = "Loading...",
  fullScreen = false,
}) {
  return (
    <div
      role="status"
      aria-label={text}
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen ? "min-h-screen" : "min-h-[300px]"
      }`}
    >
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
