
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function EmptyCart() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0755e9]">
        <ShoppingBag size={28} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-[#101828]">
        Your cart is empty
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Looks like you haven't added anything to your cart yet.
        Explore our latest mobiles and accessories.
      </p>

      <Link
        href="/products"
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0755e9] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0645c4]"
      >
        Explore Products
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}
