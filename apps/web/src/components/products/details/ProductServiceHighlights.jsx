
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

const highlights = [
  {
    icon: Truck,
    label: "Reliable Delivery",
  },
  {
    icon: ShieldCheck,
    label: "Secure Payment",
  },
  {
    icon: RotateCcw,
    label: "Easy Returns",
  },
];

export default function ProductServiceHighlights() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 border-t border-[#E2E8F0] pt-6 sm:grid-cols-3">
      {highlights.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-3">
          <Icon
            size={22}
            className="shrink-0 text-[#1D4ED8]"
          />

          <span className="text-xs font-medium text-slate-600">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
