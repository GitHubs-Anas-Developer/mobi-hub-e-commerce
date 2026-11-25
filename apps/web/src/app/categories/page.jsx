
import AllCategoriesHeader from "@/components/categories/CategoriesBanner";
import CategoryGrid from "@/components/categories/CategoryGrid";
import RecentlyViewed from "@/components/recently-viewed/RecentlyViewed";
import Breadcrumb from "@/components/common/Breadcrumb";

export const metadata = {
  title: "All Categories | Mobi Hub",
  description:
    "Explore mobile accessories and smart gadgets at Mobi Hub.",
};

export default function CategoriesPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

        {/* BREADCRUMB */}
        <Breadcrumb
          items={[
            { label: "Categories" },
          ]}
          className="mb-4"
        />

        {/* CATEGORIES HEADER */}
        <AllCategoriesHeader />

        {/* SHOP BY CATEGORY */}
        <section
          className="mt-10 sm:mt-14"
          aria-labelledby="shop-by-category-heading"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#0755E9]">
            Find your favourites
          </p>

          <h2
            id="shop-by-category-heading"
            className="mt-2 text-2xl font-bold text-[#101828] sm:text-3xl"
          >
            Shop by Category
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Browse our collection of mobile products and accessories.
          </p>

          <div className="mt-6 sm:mt-8">
            <CategoryGrid />
          </div>
        </section>

        {/* RECENTLY VIEWED PRODUCTS */}
        <section
          className="mt-12 sm:mt-16"
          aria-label="Recently viewed products"
        >
          <RecentlyViewed
            title="Recently Viewed Products"
            limit={10}
          />
        </section>

      </div>
    </main>
  );
}
