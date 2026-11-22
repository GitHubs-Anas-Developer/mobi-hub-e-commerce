"use client";

import { useEffect, useState } from "react";

import productService from "@/services/productService";

import CategorySection from "@/components/home/CategorySection";
import HeroBanner from "@/components/home/HeroBanner";
import ProductSection from "@/components/home/ProductSection";
import ShopByVideos from "@/components/home/ShopByVideos";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import TrustBar from "@/components/home/TrustBar";
import BrandSection from "@/components/brands/BrandSection";
import RecentlyViewed from "@/components/recently-viewed/RecentlyViewed";

import PromotionalBanners from "@/components/home/PromotionalBanners";
import BottomPromotionalBanner from "@/components/home/BottomPromotionalBanner";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);

  const [featuredError, setFeaturedError] = useState("");
  const [newArrivalsError, setNewArrivalsError] = useState("");

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const [featuredResult, arrivalsResult] = await Promise.allSettled([
          productService.getProducts({
            isFeatured: true,
            limit: 8,
          }),

          productService.getProducts({
            isNewArrival: true,
            limit: 8,
            sort: "newest",
          }),
        ]);

        if (featuredResult.status === "fulfilled") {
          setFeaturedProducts(featuredResult.value.data || []);
        } else {
          setFeaturedError(
            featuredResult.reason?.response?.data?.message ||
              "Failed to load featured products.",
          );
        }

        if (arrivalsResult.status === "fulfilled") {
          setNewArrivals(arrivalsResult.value.data || []);
        } else {
          setNewArrivalsError(
            arrivalsResult.reason?.response?.data?.message ||
              "Failed to load new arrivals.",
          );
        }
      } finally {
        setFeaturedLoading(false);
        setNewArrivalsLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  return (
    <main className="min-h-screen w-full bg-white">
      {/* 01. HERO BANNER */}
      <HeroBanner />

      {/* 02. TRUST BAR */}
      <TrustBar />

      {/* 03. SHOP BY CATEGORY */}
      <CategorySection />

      {/* 04. POPULAR BRANDS */}
      <BrandSection />

      {/* 05. FEATURED PRODUCTS */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <ProductSection
          title="Featured Products"
          products={featuredProducts}
          loading={featuredLoading}
          error={featuredError}
        />
      </div>

      {/* 06. MIDDLE PROMOTIONAL BANNER */}
      <PromotionalBanners />

      {/* 07. NEW ARRIVALS */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <ProductSection
          title="New Arrivals"
          products={newArrivals}
          loading={newArrivalsLoading}
          error={newArrivalsError}
        />

        {/* 08. RECENTLY VIEWED */}
        <RecentlyViewed title="Recently Viewed" limit={10} />
      </div>

      {/* 09. SHOP BY VIDEOS */}
      <ShopByVideos />

      {/* 10. WHY CHOOSE MOBIHUB */}
      <WhyChooseUs />

      {/* 11. BOTTOM PROMOTIONAL BANNER */}
      <BottomPromotionalBanner />
    </main>
  );
}
