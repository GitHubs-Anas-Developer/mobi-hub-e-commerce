
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Package,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

import productService from "@/services/productService";

import { addToCart } from "@/store/thunks/cartThunks";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/store/thunks/wishlistThunks";

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

function getVariantPrice(variant) {
  return Number(variant?.sellingPrice ?? 0);
}

function getVariantMrp(variant) {
  return Number(variant?.mrp ?? getVariantPrice(variant));
}

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl animate-pulse grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-2">
      <div className="aspect-square rounded-2xl bg-slate-200" />
      <div className="space-y-5">
        <div className="h-5 w-1/3 rounded bg-slate-200" />
        <div className="h-9 w-3/4 rounded bg-slate-200" />
        <div className="h-6 w-1/2 rounded bg-slate-200" />
        <div className="h-20 rounded bg-slate-200" />
        <div className="h-12 w-1/2 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const slug = params.slug;

  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated,
  );

  const cartIsMutating = useSelector(
    (state) => state.cart.isMutating,
  );

  const wishlistIsMutating = useSelector(
    (state) => state.wishlist.isMutating,
  );

  const wishlistProducts = useSelector(
    (state) => state.wishlist.products,
  );

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [actionMessage, setActionMessage] = useState("");
  const [actionMessageType, setActionMessageType] = useState("");

  const fetchProduct = useCallback(async () => {
    if (!slug) return;

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
        (variant) => variant.isActive !== false,
      );

      const defaultVariant = activeVariants.find(
        (variant) => variant.isDefault,
      );

      setSelectedVariantId(
        defaultVariant?._id || activeVariants[0]?._id || "",
      );

      setQuantity(1);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load this product.",
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const activeVariants = useMemo(
    () =>
      (product?.variants || []).filter(
        (variant) => variant.isActive !== false,
      ),
    [product],
  );

  const selectedVariant = activeVariants.find(
    (variant) => variant._id === selectedVariantId,
  );

  const sellingPrice = getVariantPrice(selectedVariant);
  const mrp = getVariantMrp(selectedVariant);

  const discount =
    mrp > sellingPrice
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const stock = Number(selectedVariant?.stock || 0);
  const canPurchase = Boolean(selectedVariant && stock > 0);

  const productImages = useMemo(
    () =>
      [
        product?.thumbnail?.url,
        ...(product?.images || []).map((image) => image.url),
        ...(selectedVariant?.images || []).map((image) => image.url),
      ].filter(Boolean),
    [product, selectedVariant],
  );

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

  const isInWishlist = wishlistProducts.some(
    (item) => String(item._id) === String(product?._id),
  );

  const handleVariantChange = (variantId) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
    setActionMessage("");

    const variant = activeVariants.find(
      (item) => item._id === variantId,
    );

    if (variant?.images?.[0]?.url) {
      setSelectedImage(variant.images[0].url);
    } else {
      setSelectedImage(
        product.thumbnail?.url || product.images?.[0]?.url || "",
      );
    }
  };

  const requireLogin = () => {
    router.push(
      `/login?redirect=${encodeURIComponent(`/products/${slug}`)}`,
    );
  };

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
        }),
      ).unwrap();

      setActionMessage("Product added to your cart successfully.");
      setActionMessageType("success");
    } catch (err) {
      setActionMessage(
        typeof err === "string"
          ? err
          : err?.message || "Unable to add product to cart.",
      );
      setActionMessageType("error");
    }
  };

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
          removeFromWishlist(product._id),
        ).unwrap();

        setActionMessage("Product removed from your wishlist.");
      } else {
        await dispatch(
          addToWishlist(product._id),
        ).unwrap();

        setActionMessage("Product added to your wishlist.");
      }

      setActionMessageType("success");
    } catch (err) {
      setActionMessage(
        typeof err === "string"
          ? err
          : err?.message || "Unable to update wishlist.",
      );
      setActionMessageType("error");
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

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

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Product Gallery */}
          <div>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-contain p-6"
                />
              ) : (
                <Package size={80} className="text-slate-300" />
              )}

              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded-md bg-red-600 px-3 py-1.5 text-sm font-bold text-white">
                  {discount}% OFF
                </span>
              )}
            </div>

            {productImages.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-slate-50 p-2 ${
                      selectedImage === image
                        ? "border-[#1D4ED8]"
                        : "border-[#E2E8F0]"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1D4ED8]">
              {product.brand || "MOBI HUB"}
            </p>

            <h1 className="mt-2 text-2xl font-extrabold leading-tight text-[#0F172A] sm:text-3xl">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={17} fill="currentColor" />

                <span className="text-sm font-bold text-[#0F172A]">
                  {Number(product.ratings?.average || 0).toFixed(1)}
                </span>
              </div>

              <span className="text-sm text-slate-400">
                ({product.ratings?.count || 0} reviews)
              </span>
            </div>

            <div className="my-6 border-t border-[#E2E8F0]" />

            {/* Price */}
            {selectedVariant ? (
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-3xl font-extrabold text-[#0F172A]">
                    {formatPrice(sellingPrice)}
                  </span>

                  {mrp > sellingPrice && (
                    <span className="text-lg text-slate-400 line-through">
                      {formatPrice(mrp)}
                    </span>
                  )}

                  {discount > 0 && (
                    <span className="rounded-md bg-green-50 px-2 py-1 text-sm font-bold text-green-700">
                      Save {discount}%
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Inclusive of applicable taxes
                </p>
              </div>
            ) : (
              <p className="text-sm text-red-600">
                No active variants available for this product.
              </p>
            )}

            {/* Variant Selection */}
            {activeVariants.length > 0 && (
              <div className="mt-7">
                <h2 className="mb-3 text-sm font-bold text-[#0F172A]">
                  Choose Variant
                </h2>

                <div className="space-y-3">
                  {activeVariants.map((variant) => {
                    const attributes = Object.entries(
                      variant.attributes instanceof Map
                        ? Object.fromEntries(variant.attributes)
                        : variant.attributes || {},
                    );

                    const label =
                      attributes.length > 0
                        ? attributes
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(" / ")
                        : variant.sku;

                    return (
                      <button
                        key={variant._id}
                        type="button"
                        onClick={() =>
                          handleVariantChange(variant._id)
                        }
                        className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition ${
                          selectedVariantId === variant._id
                            ? "border-[#1D4ED8] bg-blue-50"
                            : "border-[#E2E8F0] hover:border-blue-300"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#0F172A]">
                            {label}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            SKU: {variant.sku}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-[#0F172A]">
                            {formatPrice(variant.sellingPrice)}
                          </p>

                          <p
                            className={`mt-1 text-xs ${
                              variant.stock > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {variant.stock > 0
                              ? `${variant.stock} available`
                              : "Out of stock"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock */}
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

            {/* Quantity */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-bold text-[#0F172A]">
                Quantity
              </label>

              <div className="flex w-fit items-center overflow-hidden rounded-lg border border-[#E2E8F0]">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1),
                    )
                  }
                  className="p-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  <Minus size={17} />
                </button>

                <span className="min-w-12 text-center text-sm font-bold">
                  {quantity}
                </span>

                <button
                  type="button"
                  disabled={!canPurchase || quantity >= stock}
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(stock, current + 1),
                    )
                  }
                  className="p-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={!canPurchase || cartIsMutating}
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <ShoppingCart size={19} />

                {cartIsMutating ? "Adding..." : "Add to Cart"}
              </button>

              <button
                type="button"
                aria-label={
                  isInWishlist
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                disabled={wishlistIsMutating}
                onClick={handleWishlist}
                className={`flex items-center justify-center rounded-lg border px-5 py-4 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isInWishlist
                    ? "border-red-300 bg-red-50 text-red-600"
                    : "border-[#E2E8F0] text-[#0F172A] hover:border-red-300 hover:text-red-600"
                }`}
              >
                <Heart
                  size={20}
                  fill={isInWishlist ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* Action Feedback */}
            {actionMessage && (
              <div
                role="status"
                className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
                  actionMessageType === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {actionMessage}
              </div>
            )}

            {/* Service Highlights */}
            <div className="mt-8 grid grid-cols-1 gap-4 border-t border-[#E2E8F0] pt-6 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Truck size={22} className="shrink-0 text-[#1D4ED8]" />

                <span className="text-xs font-medium text-slate-600">
                  Reliable Delivery
                </span>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck
                  size={22}
                  className="shrink-0 text-[#1D4ED8]"
                />

                <span className="text-xs font-medium text-slate-600">
                  Secure Payment
                </span>
              </div>

              <div className="flex items-center gap-3">
                <RotateCcw
                  size={22}
                  className="shrink-0 text-[#1D4ED8]"
                />

                <span className="text-xs font-medium text-slate-600">
                  Easy Returns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <section className="mt-16 border-t border-[#E2E8F0] pt-10">
          <h2 className="text-xl font-extrabold text-[#0F172A]">
            Product Description
          </h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
            {product.description || "No description available."}
          </p>
        </section>

        {/* Specifications */}
        {specifications.length > 0 && (
          <section className="mt-12 border-t border-[#E2E8F0] pt-10">
            <h2 className="text-xl font-extrabold text-[#0F172A]">
              Technical Specifications
            </h2>

            <div className="mt-5 overflow-hidden rounded-xl border border-[#E2E8F0]">
              {specifications.map(([key, value], index) => (
                <div
                  key={key}
                  className={`grid grid-cols-1 gap-2 p-4 sm:grid-cols-3 ${
                    index % 2 === 0 ? "bg-slate-50" : "bg-white"
                  }`}
                >
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {key}
                  </span>

                  <span className="text-sm text-slate-600 sm:col-span-2">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews placeholder */}
        <section className="mt-12 border-t border-[#E2E8F0] py-10">
          <h2 className="text-xl font-extrabold text-[#0F172A]">
            Customer Reviews
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            {product.ratings?.count || 0} customer reviews for this product.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Review list and submission will be connected in the Reviews UI integration step.
          </p>
        </section>
      </div>
    </div>
  );
}
