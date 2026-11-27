import CategoriesPageHeader from "@/components/categories/CategoriesPageHeader";
import AllCategoriesHeader from "@/components/categories/CategoriesBanner";
import CategoryGrid from "@/components/categories/CategoryGrid";
import RecentlyViewed from "@/components/recently-viewed/RecentlyViewed";
import Breadcrumb from "@/components/common/Breadcrumb";

export const metadata = {
  title: "All Categories",
  description:
    "Explore electronics, gadgets, and smart accessories organized across ELENZO departments.",
};

export default function CategoriesPage() {
  return (
    <main className="min-h-screen w-full bg-[#F8FAFC] pb-24 xl:pb-12">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <Breadcrumb
          items={[{ label: "Categories" }]}
          className="mb-4"
        />

        <CategoriesPageHeader />

        <div className="mb-6">
          <AllCategoriesHeader />
        </div>

        <section
          className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs sm:p-6"
          aria-labelledby="shop-by-category-heading"
        >
          <div className="mb-5 flex flex-col justify-between gap-2 border-b border-[#E2E8F0] pb-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#0755E9]">
                Shop by Department
              </p>

              <h2
                id="shop-by-category-heading"
                className="mt-1 text-xl font-extrabold tracking-tight text-[#101828] sm:text-2xl"
              >
                All Product Categories
              </h2>
            </div>

            <p className="max-w-md text-xs leading-relaxed text-[#64748B] sm:text-right sm:text-sm">
              Select a department to explore subcategories, brands, and curated gadgets.
            </p>
          </div>

          <CategoryGrid />
        </section>

        <section
          className="mt-10 sm:mt-12"
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
