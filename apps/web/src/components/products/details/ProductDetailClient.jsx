
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, Package } from "lucide-react";

import productService from "@/services/productService";

import { addToCart } from "@/store/thunks/cartThunks";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/store/thunks/wishlistThunks";

import ReviewSection from "@/components/reviews/ReviewSection";

import ProductDetailSkeleton from "./ProductDetailSkeleton";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductVariantSelector from "./ProductVariantSelector";
import ProductQuantitySelector from "./ProductQuantitySelector";
import ProductActions from "./ProductActions";
import ProductServiceHighlights from "./ProductServiceHighlights";
import ProductDescription from "./ProductDescription";
import ProductSpecifications from "./ProductSpecifications";

function getVariantPrice(variant) {
  return Number(variant?.sellingPrice ?? 0);
}

function getVariantMrp(variant) {
  return Number(variant?.mrp ?? getVariantPrice(variant));
}

export default function ProductDetailClient({ slug }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  const cartIsMutating = useSelector(
    (state) => state.cart.isMutating
  );

  const wishlistIsMutating = useSelector(
    (state) => state.wishlist.isMutating
  );

  const wishlistProducts = useSelector(
    (state) => state.wishlist.products
  );

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [actionMessage, setActionMessage] = useState("");
  const [actionMessageType, setActionMessageType] = useState("");

  // Fetch Product
  const fetchProduct = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await productService.getProductBySlug(slug);
      const fetchedProduct = response.data;

      setProduct(fetchedProduct);

      const images = [
        fetchedProduct.thumbnail?.url,
        ...(fetchedProduct.images || []).map((image) => image.url),
      ].filter(Boolean);

      setSelectedImage(images[0] || "");

      const activeVariants = (fetchedProduct.variants || []).filter(
        (variant) => variant.isActive !== false
      );

      const defaultVariant = activeVariants.find(
        (variant) => variant.isDefault
      );

      setSelectedVariantId(
        defaultVariant?._id || activeVariants[0]?._id || ""
      );

      setQuantity(1);
    } catch (err) {
      setProduct(null);
      setError(
        err.response?.data?.message || "Unable to load this product."
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Active Variants
  const activeVariants = useMemo(
    () =>
      (product?.variants || []).filter(
        (variant) => variant.isActive !== false
      ),
    [product]
  );

  const selectedVariant = activeVariants.find(
    (variant) => variant._id === selectedVariantId
  );

  // Price
  const sellingPrice = getVariantPrice(selectedVariant);
  const mrp = getVariantMrp(selectedVariant);

  const discount =
    mrp > sellingPrice
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  // Stock
  const stock = Number(selectedVariant?.stock || 0);
  const canPurchase = Boolean(selectedVariant && stock > 0);

  // Product Images
  const productImages = useMemo(
    () =>
      [
        product?.thumbnail?.url,
        ...(product?.images || []).map((image) => image.url),
        ...(selectedVariant?.images || []).map((image) => image.url),
      ].filter(Boolean),
    [product, selectedVariant]
  );

  // Specifications
  const specifications = useMemo(() => {
    const value = product?.specifications;

    if (!value) return [];

    if (value instanceof Map) {
      return Array.from(value.entries());
    }

    if (Array.isArray(value)) {
      return value;
    }

    return Object.entries(value);
  }, [product]);

  // Wishlist Status
  const isInWishlist = (wishlistProducts || []).some(
    (item) => String(item._id) === String(product?._id)
  );

  // Variant Change
  const handleVariantChange = (variantId) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
    setActionMessage("");
    setActionMessageType("");

    const variant = activeVariants.find(
      (item) => item._id === variantId
    );

    if (variant?.images?.[0]?.url) {
      setSelectedImage(variant.images[0].url);
    } else {
      setSelectedImage(
        product.thumbnail?.url || product.images?.[0]?.url || ""
      );
    }
  };

  // Login Redirect
  const requireLogin = () => {
    router.push(
      `/login?redirect=${encodeURIComponent(`/products/${slug}`)}`
    );
  };

  // Add To Cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      requireLogin();
      return;
    }

    if (!product?._id || !selectedVariant?._id || !canPurchase) {
      return;
    }

    setActionMessage("");
    setActionMessageType("");

    try {
      await dispatch(
        addToCart({
          productId: product._id,
          variantId: selectedVariant._id,
          quantity,
        })
      ).unwrap();

      setActionMessage("Product added to your cart successfully.");
      setActionMessageType("success");
    } catch (err) {
      setActionMessage(
        typeof err === "string"
          ? err
          : err?.message || "Unable to add product to cart."
      );

      setActionMessageType("error");
    }
  };

  // Wishlist
  const handleWishlist = async () => {
    if (!isAuthenticated) {
      requireLogin();
      return;
    }

    if (!product?._id) return;

    setActionMessage("");
    setActionMessageType("");

    try {
      if (isInWishlist) {
        await dispatch(
          removeFromWishlist(product._id)
        ).unwrap();

        setActionMessage("Product removed from your wishlist.");
      } else {
        await dispatch(
          addToWishlist(product._id)
        ).unwrap();

        setActionMessage("Product added to your wishlist.");
      }

      setActionMessageType("success");
    } catch (err) {
      setActionMessage(
        typeof err === "string"
          ? err
          : err?.message || "Unable to update wishlist."
      );

      setActionMessageType("error");
    }
  };

  // Loading
  if (loading) {
    return <ProductDetailSkeleton />;
  }

  // Error
  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Package size={48} className="text-slate-300" />

        <h1 className="mt-4 text-2xl font-bold text-[#0F172A]">
          Product not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {error || "This product may be unavailable."}
        </p>

        <Link
          href="/products"
          className="mt-6 rounded-lg bg-[#1D4ED8] px-6 py-3 text-sm font-semibold text-white"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-[#1D4ED8]">
            Home
          </Link>

          <ChevronRight size={15} />

          <Link href="/products" className="hover:text-[#1D4ED8]">
            Products
          </Link>

          <ChevronRight size={15} />

          <span className="font-medium text-[#0F172A]">
            {product.name}
          </span>
        </nav>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

          <ProductGallery
            product={product}
            productImages={productImages}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            discount={discount}
          />

          <div>
            <ProductInfo
              product={product}
              selectedVariant={selectedVariant}
              sellingPrice={sellingPrice}
              mrp={mrp}
              discount={discount}
            />

            {/* Stock Status */}
            {selectedVariant && (
              <div className="mt-5">
                <p
                  className={`text-sm font-semibold ${
                    canPurchase ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {canPurchase
                    ? "In Stock - Ready to ship"
                    : "Currently unavailable"}
                </p>
              </div>
            )}

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
              onAddToCart={handleAddToCart}
              onWishlist={handleWishlist}
              isInWishlist={isInWishlist}
              cartIsMutating={cartIsMutating}
              wishlistIsMutating={wishlistIsMutating}
              canPurchase={canPurchase}
              actionMessage={actionMessage}
              actionMessageType={actionMessageType}
            />

            <ProductServiceHighlights />
          </div>
        </div>

        {/* Description */}
        <ProductDescription
          description={product.description}
        />

        {/* Specifications */}
        <ProductSpecifications
          specifications={specifications}
        />

        {/* Reviews */}
        <ReviewSection
          productId={product._id}
          isAuthenticated={isAuthenticated}
          onRequireLogin={requireLogin}
        />

      </div>
    </div>
  );
}
