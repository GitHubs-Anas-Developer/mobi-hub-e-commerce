
export default function Skeleton({
  width = "100%",
  height = "20px",
  radius = "8px",
  className = "",
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-gray-200 ${className}`}
      style={{
        width,
        height,
        borderRadius: radius,
      }}
    />
  );
}
