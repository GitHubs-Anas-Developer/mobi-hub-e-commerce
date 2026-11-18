"use client";

import { useEffect, useState } from "react";

import productService from "@/services/productService";

import CategorySection from "@/components/home/CategorySection";
import HeroBanner from "@/components/home/HeroBanner";
import ProductSection from "@/components/home/ProductSection";
import ShopByVideos from "@/components/home/ShopByVideos";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import TrustBar from "@/components/home/TrustBar";
import PromoBannerSection from "@/components/home/PromoBannerSection";
import BrandSection from "@/components/brands/BrandSection";
import RecentlyViewed from "@/components/recently-viewed/RecentlyViewed";

export default function Home() {
  // Product states
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  // Loading states
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);

  // Error states
  const [featuredError, setFeaturedError] = useState("");
  const [newArrivalsError, setNewArrivalsError] = useState("");

  // Fetch homepage products
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
      {/* HERO BANNER */}
      <HeroBanner />
      {/* CATEGORY SECTION */}

      {/* TRUST BAR */}
      <TrustBar />
      <div className="">
        <CategorySection />
      </div>

      {/* BRANDS */}
      <BrandSection />

      {/* PROMOTIONAL BANNERS */}
      <PromoBannerSection />

      {/* HOMEPAGE PRODUCTS AND CONTENT */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* BEST SELLERS */}
        <ProductSection
          title="Feature Products"
          products={featuredProducts}
          loading={featuredLoading}
          error={featuredError}
        />

        {/* NEW ARRIVALS */}
        <ProductSection
          title="New Arrivals"
          products={newArrivals}
          loading={newArrivalsLoading}
          error={newArrivalsError}
        />

        <RecentlyViewed title="Recently Viewed" limit={10} />

        {/* SHOP BY VIDEOS */}

        {/* WHY CHOOSE MOBI HUB */}
      </div>
      <ShopByVideos />
      <WhyChooseUs />
    </main>
  );
}
