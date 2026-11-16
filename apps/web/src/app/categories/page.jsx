import AllCategoriesHeader from "@/components/categories/AllCategoriesHeader";
import CategoryGrid from "@/components/categories/CategoryGrid";

export const metadata = {
  title: "All Categories | Mobi Hub",
  description: "Explore mobile phones and accessories at Mobi Hub.",
};

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="w-full px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

        <AllCategoriesHeader />

        <section className="mt-10 sm:mt-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0755E9]">
            Find your favourites
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#101828] sm:text-3xl">
            Shop by Category
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Browse our collection of mobile products and accessories.
          </p>

          <div className="mt-6">
            <CategoryGrid />
          </div>
        </section>

      </div>
    </main>
  );
}