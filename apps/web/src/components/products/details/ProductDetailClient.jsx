"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Package, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { fetchProductBySlug } from "@/store/thunks/productThunks";
import recentlyViewedService from "@/services/recentlyViewed.service";
import { addToCart } from "@/store/thunks/cartThunks";
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/store/thunks/wishlistThunks";

import Breadcrumb from "@/components/common/Breadcrumb";
import RecentlyViewed from "@/components/recently-viewed/RecentlyViewed";
import RelatedProducts from "@/components/related-products/RelatedProducts";

import ProductDetailSkeleton from "./ProductDetailSkeleton";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductVariantSelector from "./ProductVariantSelector";
import ProductQuantitySelector from "./ProductQuantitySelector";
import ProductActions from "./ProductActions";
import ProductServiceHighlights from "./ProductServiceHighlights";
import ProductDetailTabs from "./ProductDetailTabs";

function getVariantPrice(variant) {
  return Math.max(0, Number(variant?.sellingPrice ?? 0) || 0);
}

function getVariantMrp(variant) {
  const price = getVariantPrice(variant);
  const mrp = Number(variant?.mrp ?? price) || price;
  return mrp > price ? mrp : price;
}

const getWishlistItemId = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  return String(
    item?._id ?? item?.id ?? item?.product?._id ?? item?.product ?? ""
  );
};

export default function ProductDetailClient({ slug, initialProduct = null }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(
    (state) => state.auth?.isAuthenticated ?? false
  );
  const cartIsMutating = useSelector(
    (state) => state.cart?.isMutating ?? false
  );
  const wishlistIsMutating = useSelector(
    (state) => state.wishlist?.isMutating ?? false
  );
  const wishlistProducts = useSelector(
    (state) => state.wishlist?.products || []
  );

  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState(() => {
    const activeVariants = (initialProduct?.variants || []).filter(
      (variant) => variant?.isActive !== false
    );
    return (
      activeVariants.find((variant) => variant?.isDefault)?._id ||
      activeVariants[0]?._id ||
      ""
    );
  });
  const [selectedImage, setSelectedImage] = useState(
    initialProduct?.thumbnail?.url || initialProduct?.images?.[0]?.url || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const fetchProduct = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      setProduct(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await dispatch(fetchProductBySlug(slug)).unwrap();
      const fetchedProduct = response?.data;

      if (!fetchedProduct) {
        throw new Error("Product not found.");
      }

      setProduct(fetchedProduct);

      const images = [
        fetchedProduct.thumbnail?.url,
        ...(fetchedProduct.images || []).map((image) => image?.url),
      ].filter(Boolean);

      setSelectedImage(images[0] || "");

      const activeVariants = (fetchedProduct.variants || []).filter(
        (variant) => variant?.isActive !== false
      );

      const defaultVariant =
        activeVariants.find((variant) => variant?.isDefault) ||
        activeVariants[0];

      setSelectedVariantId(defaultVariant?._id || "");
      setQuantity(1);
    } catch (err) {
      setProduct(null);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load this product."
      );
    } finally {
      setLoading(false);
    }
  }, [slug, dispatch]);

  useEffect(() => {
    if (initialProduct) return;

    const timer = window.setTimeout(() => fetchProduct(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchProduct, initialProduct]);

  useEffect(() => {
    if (isAuthenticated && wishlistProducts.length === 0) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated, wishlistProducts.length]);

  useEffect(() => {
    if (!product?._id || !isAuthenticated) return;

    recentlyViewedService.addRecentlyViewed(product._id).catch(() => {});
  }, [product?._id, isAuthenticated]);

  const activeVariants = useMemo(
    () =>
      (product?.variants || []).filter(
        (variant) => variant?.isActive !== false
      ),
    [product]
  );

  const selectedVariant = useMemo(
    () =>
      activeVariants.find(
        (variant) => String(variant._id) === String(selectedVariantId)
      ) || null,
    [activeVariants, selectedVariantId]
  );

  const sellingPrice = getVariantPrice(selectedVariant);
  const mrp = getVariantMrp(selectedVariant);
  const discount =
    mrp > sellingPrice && mrp > 0
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const stock = Number(selectedVariant?.stock || 0);
  const canPurchase = Boolean(selectedVariant && stock > 0);

  const productImages = useMemo(() => {
    const raw = [
      ...(selectedVariant?.images || []).map((image) => image?.url),
      product?.thumbnail?.url,
      ...(product?.images || []).map((image) => image?.url),
    ].filter(Boolean);

    return Array.from(new Set(raw));
  }, [product, selectedVariant]);

  const specifications = useMemo(() => {
    const value = product?.specifications;
    if (!value) return [];
    if (value instanceof Map) return Array.from(value.entries());
    if (Array.isArray(value)) return value;
    if (typeof value === "object") return Object.entries(value);
    return [];
  }, [product]);

  const isInWishlist = useMemo(
    () =>
      (wishlistProducts || []).some(
        (item) => getWishlistItemId(item) === String(product?._id || "")
      ),
    [wishlistProducts, product?._id]
  );

  const requireLogin = () => {
    router.push(`/login?next=${encodeURIComponent(`/products/${slug}`)}`);
  };

  const handleVariantChange = (variantId) => {
    setSelectedVariantId(variantId);
    setQuantity(1);

    const variant = activeVariants.find(
      (item) => String(item._id) === String(variantId)
    );

    if (variant?.images?.[0]?.url) {
      setSelectedImage(variant.images[0].url);
    } else {
      setSelectedImage(
        product?.thumbnail?.url || product?.images?.[0]?.url || ""
      );
    }
  };

  const validatePurchase = () => {
    if (!isAuthenticated) {
      requireLogin();
      return false;
    }

    if (!product?._id || !selectedVariant?._id) {
      toast.error("Please select an available variant.");
      return false;
    }

    if (!canPurchase) {
      toast.error("This product is currently unavailable.");
      return false;
    }

    if (
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 1 ||
      Number(quantity) > stock
    ) {
      toast.error("Please select a valid quantity.");
      return false;
    }

    return true;
  };

  const handleAddToCart = async () => {
    if (!validatePurchase()) return false;

    try {
      await dispatch(
        addToCart({
          productId: product._id,
          variantId: selectedVariant._id,
          quantity: Number(quantity),
        })
      ).unwrap();

      toast.success(`${product.name || "Product"} added to cart.`);
      return true;
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "Unable to add product to cart."
      );
      return false;
    }
  };

  const handleBuyNow = () => {
    if (!validatePurchase()) return;

    const checkoutParams = new URLSearchParams({
      mode: "direct",
      productId: String(product._id),
      variantId: String(selectedVariant._id),
      quantity: String(Number(quantity)),
      slug: product.slug || slug,
    });

    router.push(`/checkout?${checkoutParams.toString()}`);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      requireLogin();
      return;
    }

    if (!product?._id) return;

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product._id)).unwrap();
        toast.success("Removed from wishlist.");
      } else {
        await dispatch(addToWishlist(product._id)).unwrap();
        toast.success("Saved to wishlist.");
      }
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "Unable to update wishlist."
      );
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <ProductDetailSkeleton />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-white px-4 py-12">
        <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white text-[#64748B]">
            <Package size={28} aria-hidden="true" />
          </div>

          <h1 className="mt-4 text-xl font-bold tracking-tight text-[#101828]">
            {error ? "Unable to load product" : "Product not found"}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
            {error || "This product may have been removed or is currently unavailable."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {error && (
              <button
                type="button"
                onClick={fetchProduct}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white transition hover:bg-[#0645C4] sm:text-sm"
              >
                <RefreshCw size={15} />
                Try Again
              </button>
            )}

            <Link
              href="/products"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] sm:text-sm"
            >
              <ArrowLeft size={15} />
              Browse Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const breadcrumbItems = [
    { label: "Products", href: "/products" },
    ...(product.category?._id && product.category?.name
      ? [
          {
            label: product.category.name,
            href: `/categories/${product.category._id}/products`,
          },
        ]
      : []),
    { label: product.name },
  ];

  return (
    <main className="min-h-screen bg-white pb-24 sm:pb-12">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* Top Navigation Row */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Breadcrumb items={breadcrumbItems} className="flex-1" />

          <Link
            href="/products"
            className="hidden items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#64748B] transition hover:border-[#0755E9]/40 hover:text-[#0755E9] sm:inline-flex"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            <span>Back to Catalog</span>
          </Link>
        </div>

        {/* Main 2-Column Product Hero */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Product Gallery */}
          <div className="min-w-0 lg:sticky lg:top-24 lg:col-span-6">
            <ProductGallery
              productImages={productImages}
              productName={product.name}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              discountPercentage={discount}
              onWishlist={handleWishlist}
              isInWishlist={isInWishlist}
              wishlistIsMutating={wishlistIsMutating}
            />
          </div>

          {/* Right Column: Product Information & Purchase Controls */}
          <div className="flex min-w-0 flex-col lg:col-span-6">
            <ProductInfo
              product={product}
              selectedVariant={selectedVariant}
              sellingPrice={sellingPrice}
              mrp={mrp}
              discount={discount}
              stock={stock}
              canPurchase={canPurchase}
              onReviewsClick={() => setActiveTab("reviews")}
            />

            <ProductVariantSelector
              variants={activeVariants}
              selectedVariantId={selectedVariantId}
              onVariantChange={handleVariantChange}
            />

            <ProductQuantitySelector
              quantity={quantity}
              setQuantity={setQuantity}
              stock={stock}
              canPurchase={canPurchase}
            />

            <ProductActions
              sellingPrice={sellingPrice}
              mrp={mrp}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onWishlist={handleWishlist}
              isInWishlist={isInWishlist}
              cartIsMutating={cartIsMutating}
              wishlistIsMutating={wishlistIsMutating}
              canPurchase={canPurchase}
            />

            <ProductServiceHighlights />
          </div>
        </div>

        {/* Below-the-Fold Tabbed Details & Reviews */}
        <ProductDetailTabs
          product={product}
          specifications={specifications}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAuthenticated={isAuthenticated}
          onRequireLogin={requireLogin}
        />

        {/* Related Products */}
        <section className="mt-12" aria-label="Related products">
          <RelatedProducts
            productId={product._id}
            title="Related Products"
            subtitle="Similar gadgets and accessories selected for you."
            limit={10}
          />
        </section>

        {/* Recently Viewed */}
        <section className="mt-12" aria-label="Recently viewed products">
          <RecentlyViewed
            title="Recently Viewed Products"
            limit={5}
            excludeProductId={product._id}
          />
        </section>
      </div>
    </main>
  );
}
