
export default function Spinner({
  size = "md",
  color = "#0755e9",
}) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-[3px]",
    lg: "h-10 w-10 border-4",
  };

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-solid border-t-transparent ${sizes[size]}`}
      style={{
        borderColor: color,
        borderTopColor: "transparent",
      }}
    />
  );
}
