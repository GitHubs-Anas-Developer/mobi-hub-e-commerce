
export default function Skeleton({
  width = "100%",
  height = "20px",
  radius = "8px",
  className = "",
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-slate-200/75 ${className}`}
      style={{
        width,
        height,
        borderRadius: radius,
      }}
    />
  );
}
