
export default function CountBadge({ count }) {
  if (!count || count <= 0) return null;

  return (
    <span
      className="absolute -right-1.5 -top-1.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm"
      aria-label={`${count} items`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
