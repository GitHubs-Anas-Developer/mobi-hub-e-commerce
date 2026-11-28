"use client";

import { useEffect, useState } from "react";

import productService from "@/services/productService";

import HomeCategoryNav from "@/components/home/HomeCategoryNav";
import HeroBanner from "@/components/home/HeroBanner";
import TrustBar from "@/components/home/TrustBar";
import CategorySection from "@/components/home/CategorySection";
import BrandSection from "@/components/brands/BrandSection";
import ProductSection from "@/components/home/ProductSection";
import PromotionalBanners from "@/components/home/PromotionalBanners";
import RecentlyViewed from "@/components/recently-viewed/RecentlyViewed";
import ShopByVideos from "@/components/home/ShopByVideos";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import BottomPromotionalBanner from "@/components/home/BottomPromotionalBanner";
import Newsletter from "@/components/home/Newsletter";
import MiniCartDrawer from "@/components/cart/MiniCartDrawer";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);

  const [featuredError, setFeaturedError] = useState("");
  const [bestSellersError, setBestSellersError] = useState("");
  const [newArrivalsError, setNewArrivalsError] = useState("");

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeProducts = async () => {
      const [featuredResult, catalogResult, arrivalsResult] =
        await Promise.allSettled([
          productService.getProducts({
            isFeatured: true,
            limit: 8,
          }),
          productService.getProducts({
            limit: 16,
            sort: "newest",
          }),
          productService.getProducts({
            isNewArrival: true,
            limit: 8,
            sort: "newest",
          }),
        ]);

      if (!isMounted) return;

      if (featuredResult.status === "fulfilled") {
        setFeaturedProducts(featuredResult.value.data || []);
        setFeaturedError("");
      } else {
        setFeaturedError(
          featuredResult.reason?.response?.data?.message ||
            "Failed to load featured products."
        );
      }

      if (catalogResult.status === "fulfilled") {
        const allCatalog = Array.isArray(catalogResult.value.data)
          ? catalogResult.value.data
          : [];

        const rankedPopular = [...allCatalog]
          .sort((a, b) => {
            const countDiff =
              Number(b.ratings?.count || 0) - Number(a.ratings?.count || 0);
            if (countDiff !== 0) return countDiff;
            return (
              Number(b.ratings?.average || 0) - Number(a.ratings?.average || 0)
            );
          })
          .slice(0, 8);

        setBestSellers(rankedPopular);
        setBestSellersError("");
      } else {
        setBestSellersError(
          catalogResult.reason?.response?.data?.message ||
            "Failed to load popular products."
        );
      }

      if (arrivalsResult.status === "fulfilled") {
        setNewArrivals(arrivalsResult.value.data || []);
        setNewArrivalsError("");
      } else {
        setNewArrivalsError(
          arrivalsResult.reason?.response?.data?.message ||
            "Failed to load new arrivals."
        );
      }

      setFeaturedLoading(false);
      setBestSellersLoading(false);
      setNewArrivalsLoading(false);
    };

    fetchHomeProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const openCartDrawer = () => setCartDrawerOpen(true);

  return (
    <>
      <main className="min-h-screen w-full overflow-x-clip bg-white">
        {/* 01. DYNAMIC CATEGORY NAVIGATION BAR */}
        <HomeCategoryNav />

        {/* 02. EDITORIAL HERO & FEATURED SPOTLIGHT */}
        <HeroBanner
          featuredProducts={featuredProducts}
          featuredLoading={featuredLoading}
        />

        {/* 03. STORE TRUST ASSURANCES */}
        <div className="py-6 sm:py-8">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <TrustBar />
          </div>
        </div>

        {/* 04. SHOP BY CATEGORY */}
        <div className="py-6 sm:py-10">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <CategorySection />
          </div>
        </div>

        {/* 05. OFFICIAL BRAND PARTNERS */}
        <div className="border-y border-[#E2E8F0]/70 bg-[#F8FAFC]/60 py-7 sm:py-9 [&:not(:has(section))]:hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <BrandSection />
          </div>
        </div>

        {/* 06. FEATURED & TRENDING PRODUCTS */}
        <div className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <ProductSection
              eyebrow="Trending Tech"
              title="Featured Products"
              subtitle="Handpicked flagship gadgets, cables, audio gear, and everyday essentials."
              viewAllHref="/products?isFeatured=true"
              products={featuredProducts}
              loading={featuredLoading}
              error={featuredError}
              onAddedToCart={openCartDrawer}
            />
          </div>
        </div>

        {/* 07. MID-PAGE PROMOTIONAL BANNER */}
        <div className="py-2 sm:py-4 [&:not(:has(section))]:hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <PromotionalBanners />
          </div>
        </div>

        {/* 08. BEST SELLERS / TOP-RATED FAVORITES */}
        <div className="border-y border-[#E2E8F0]/70 bg-[#F8FAFC]/70 py-8 sm:py-12">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <ProductSection
              eyebrow="Customer Favorites"
              title="Best Sellers & Top Picks"
              subtitle="Most explored and highest-rated tech essentials across ELENZO."
              viewAllHref="/products"
              products={bestSellers}
              loading={bestSellersLoading}
              error={bestSellersError}
              onAddedToCart={openCartDrawer}
            />
          </div>
        </div>

        {/* 09. NEW ARRIVALS */}
        <div className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <ProductSection
              eyebrow="Latest Releases"
              title="Latest Tech & New Arrivals"
              subtitle="Discover the latest smartphones, audio accessories, gadgets and everyday technology."
              viewAllHref="/products?isNewArrival=true&sort=newest"
              products={newArrivals}
              loading={newArrivalsLoading}
              error={newArrivalsError}
              onAddedToCart={openCartDrawer}
              catalogHeader
            />
          </div>
        </div>

        {/* RECENTLY VIEWED (Authenticated users with history) */}
        <div className="py-6 sm:py-8 [&:not(:has(section))]:hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <RecentlyViewed
              title="Recently Viewed"
              subtitle="Pick up right where you left off."
              limit={8}
            />
          </div>
        </div>

        {/* VIDEO PRODUCT STORIES */}
        <div className="py-6 sm:py-10 [&:not(:has(section))]:hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <ShopByVideos />
          </div>
        </div>

        {/* 10. WHY SHOP WITH ELENZO */}
        <div className="py-6 sm:py-10">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <WhyChooseUs />
          </div>
        </div>

        {/* BOTTOM PROMOTIONAL BANNER */}
        <div className="py-4 sm:py-6 [&:not(:has(section))]:hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <BottomPromotionalBanner />
          </div>
        </div>

        {/* 11. NEWSLETTER */}
        <div className="pb-10 pt-2 sm:pb-14">
          <Newsletter />
        </div>
      </main>

      {/* SLIDE-OVER MINI CART DRAWER */}
      <MiniCartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </>
  );
}
