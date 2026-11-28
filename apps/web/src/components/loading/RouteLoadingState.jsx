export default function RouteLoadingState({
  label = "Loading page",
  className = "",
  children,
}) {
  return (
    <div className={className} aria-busy="true">
      <span className="sr-only" role="status">
        {label}
      </span>
      {children}
    </div>
  );
}
