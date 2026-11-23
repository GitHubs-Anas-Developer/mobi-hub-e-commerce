
import { Truck, ShieldCheck, Headset } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Reliable Delivery",
    description: "Delivery details available at checkout",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Protected and secure payment process",
  },
  {
    icon: Headset,
    title: "Customer Support",
    description: "We're here whenever you need help",
  },
];

export default function CartTrustInfo() {
  return (
    <section
      aria-label="Shopping benefits"
      className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 shadow-sm"
    >
      {features.map(({ icon: Icon, title, description }, index) => (
        <div
          key={title}
          className={`flex items-center gap-3.5 py-4 ${
            index !== features.length - 1
              ? "border-b border-slate-100"
              : ""
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0755e9]">
            <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-800">
              {title}
            </h3>

            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              {description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
