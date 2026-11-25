
import Spinner from "./Spinner";

export default function ButtonLoader({
  text = "Please wait...",
}) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <Spinner size="sm" color="currentColor" />
      <span>{text}</span>
    </span>
  );
}
