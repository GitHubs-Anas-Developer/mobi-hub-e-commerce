
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Package,
  Loader2,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { fetchWishlist, removeFromWishlist } from "@/store/thunks/wishlistThunks";
import { addToCart } from "@/store/thunks/cartThunks";

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

function WishlistPageContent() {
  const dispatch = useDispatch();

  const { products, isLoading, isMutating } = useSelector(
    (state) => state.wishlist,
  );

  const [removingId, setRemovingId] = useState("");
  const [addingId, setAddingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = async (productId) => {
    setMessage("");
    setError("");
    setRemovingId(productId);

    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      setMessage("Product removed from wishlist.");
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Unable to remove product.",
      );
    } finally {
      setRemovingId("");
    }
  };

  const handleAddToCart = async (product) => {
    setMessage("");
    setError("");

    const activeVariants = (product.variants || []).filter(
      (variant) => variant.isActive !== false,
    );

    const selectedVariant =
      activeVariants.find((variant) => variant.isDefault) ||
      activeVariants[0];

    if (!selectedVariant) {
      setError("No active variant available for this product.");
      return;
    }

    if (Number(selectedVariant.stock || 0) < 1) {
      setError("This product is currently out of stock.");
      return;
    }

    setAddingId(product._id);

    try {
      await dispatch(
        addToCart({
          productId: product._id,
          variantId: selectedVariant._id,
          quantity: 1,
        }),
      ).unwrap();

      setMessage(`${product.name} added to your cart.`);
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Unable to add product to cart.",
      );
    } finally {
      setAddingId("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin text-[#1D4ED8]"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] sm:text-3xl">
              My Wishlist
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {products.length}{" "}
              {products.length === 1 ? "product" : "products"} saved
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8] hover:underline"
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>
        </div>

        {/* Feedback */}
        {message && (
          <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Empty Wishlist */}
        {products.length === 0 ? (
          <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white px-5 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
              <Heart
                size={42}
                className="text-red-500"
              />
            </div>

            <h2 className="mt-6 text-xl font-bold text-[#0F172A]">
              Your wishlist is empty
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Save your favourite tech accessories here and find them
              easily whenever you need them.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Explore Products
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <>
            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const activeVariants = (
                  product.variants || []
                ).filter((variant) => variant.isActive !== false);

                const defaultVariant =
                  activeVariants.find((variant) => variant.isDefault) ||
                  activeVariants[0];

                const price = Number(
                  defaultVariant?.sellingPrice ??
                  product.basePrice ??
                  0,
                );

                const isOutOfStock =
                  !defaultVariant ||
                  Number(defaultVariant.stock || 0) < 1;

                return (
                  <div
                    key={product._id}
                    className="group overflow-hidden rounded-xl border border-[#E2E8F0] bg-white transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Image */}
                    <div className="relative flex h-56 items-center justify-center bg-[#F8FAFC] p-5">
                      <Link
                        href={`/products/${product.slug}`}
                        className="flex h-full w-full items-center justify-center"
                      >
                        {product.thumbnail?.url ? (
                          <Image
                            src={product.thumbnail.url}
                            alt={product.name}
                            width={220}
                            height={220}
                            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                            unoptimized
                          />
                        ) : (
                          <Package
                            size={50}
                            className="text-slate-300"
                          />
                        )}
                      </Link>

                      <button
                        type="button"
                        aria-label="Remove from wishlist"
                        onClick={() => handleRemove(product._id)}
                        disabled={isMutating}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {removingId === product._id ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={17} />
                        )}
                      </button>

                      {isOutOfStock && (
                        <span className="absolute bottom-3 left-3 rounded-md bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#1D4ED8]">
                        {product.brand || "MOBI HUB"}
                      </p>

                      <Link
                        href={`/products/${product.slug}`}
                        className="mt-1 block min-h-12 text-sm font-bold leading-6 text-[#0F172A] hover:text-[#1D4ED8]"
                      >
                        {product.name}
                      </Link>

                      <div className="mt-3">
                        <span className="text-lg font-extrabold text-[#0F172A]">
                          {formatPrice(price)}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={
                          isOutOfStock ||
                          isMutating ||
                          addingId === product._id
                        }
                        onClick={() => handleAddToCart(product)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {addingId === product._id ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <ShoppingCart size={17} />
                        )}

                        {isOutOfStock
                          ? "Unavailable"
                          : addingId === product._id
                            ? "Adding..."
                            : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistPageContent />
    </ProtectedRoute>
  );
}
