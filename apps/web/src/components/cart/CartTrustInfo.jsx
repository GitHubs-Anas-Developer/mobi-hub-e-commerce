
import { Truck, ShieldCheck, RefreshCw } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Reliable Delivery",
    description: "Delivery details at checkout",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Protected payment process",
  },
  {
    icon: RefreshCw,
    title: "Easy Support",
    description: "We're here to help",
  },
];

export default function CartTrustInfo() {
  return (
    <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-4">
      {features.map(({ icon: Icon, title, description }) => (
        <div key={title} className="flex items-center gap-3 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0755e9]">
            <Icon size={17} />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-800">
              {title}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
