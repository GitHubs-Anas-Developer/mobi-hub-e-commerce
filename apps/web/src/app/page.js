"use client";

import { useEffect, useState } from "react";

import productService from "@/services/productService";

import CategorySection from "@/components/home/CategorySection";
import HeroBanner from "@/components/home/HeroBanner";
import ProductSection from "@/components/home/ProductSection";
import ShopByVideos from "@/components/home/ShopByVideos";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import TrustBar from "@/components/home/TrustBar";
import Newsletter from "@/components/home/Newsletter";

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
    let isMounted = true;

    const fetchHomeProducts = async () => {
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

      if (!isMounted) return;

      if (featuredResult.status === "fulfilled") {
        setFeaturedProducts(featuredResult.value.data || []);
        setFeaturedError("");
      } else {
        setFeaturedError(
          featuredResult.reason?.response?.data?.message ||
            "Failed to load featured products.",
        );
      }

      if (arrivalsResult.status === "fulfilled") {
        setNewArrivals(arrivalsResult.value.data || []);
        setNewArrivalsError("");
      } else {
        setNewArrivalsError(
          arrivalsResult.reason?.response?.data?.message ||
            "Failed to load new arrivals.",
        );
      }

      setFeaturedLoading(false);
      setNewArrivalsLoading(false);
    };

    fetchHomeProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-background">
      {/* 01. HERO BANNER */}
      <section className="mb-4 sm:mb-6">
        <HeroBanner />
      </section>

      {/* 02. TRUST BAR */}
      <section className="mh-section">
        <div className="mh-container">
          <TrustBar />
        </div>
      </section>

      {/* 03. SHOP BY CATEGORY */}
      <section className="mh-section">
        <div className="mh-container">
          <CategorySection />
        </div>
      </section>

      {/* 04. POPULAR BRANDS */}
      <section className="mh-section">
        <div className="mh-container">
          <BrandSection />
        </div>
      </section>

      {/* 05. FEATURED PRODUCTS */}
      <section className="mh-section">
        <div className="mh-container">
          <ProductSection
            title="Featured Products"
            products={featuredProducts}
            loading={featuredLoading}
            error={featuredError}
          />
        </div>
      </section>

      {/* 06. MIDDLE PROMOTIONAL BANNER */}
      <section className="mh-section">
        <div className="mh-container">
          <PromotionalBanners />
        </div>
      </section>

      {/* 07. NEW ARRIVALS */}
      <section className="mh-section">
        <div className="mh-container">
          <ProductSection
            title="New Arrivals"
            products={newArrivals}
            loading={newArrivalsLoading}
            error={newArrivalsError}
          />
        </div>
      </section>

      {/* 08. RECENTLY VIEWED */}
      <section className="mh-section">
        <div className="mh-container">
          <RecentlyViewed title="Recently Viewed" limit={10} />
        </div>
      </section>

      {/* 09. SHOP BY VIDEOS */}
      <section className="mh-section">
        <div className="mh-container">
          <ShopByVideos />
        </div>
      </section>

      {/* 10. WHY CHOOSE ELEZIO */}
      <section className="mh-section">
        <div className="mh-container">
          <WhyChooseUs />
        </div>
      </section>

      {/* 11. BOTTOM PROMOTIONAL BANNER */}
      <section className="mh-section">
        <div className="mh-container">
          <BottomPromotionalBanner />
        </div>
      </section>

      {/* 12. NEWSLETTER */}
      <Newsletter />
    </main>
  );
}
