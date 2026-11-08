
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Package,
  Loader2,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { fetchCart, updateCartItem, removeCartItem, clearCart } from "@/store/thunks/cartThunks";

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

function CartPageContent() {
  const dispatch = useDispatch();

  const { items, isLoading, isMutating } = useSelector(
    (state) => state.cart,
  );

  const [updatingItemId, setUpdatingItemId] = useState("");
  const [removingItemId, setRemovingItemId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const price = Number(
        item.product?.basePrice || item.product?.sellingPrice || 0,
      );

      return total + price * Number(item.quantity || 0);
    }, 0);
  }, [items]);

  const totalItems = useMemo(
    () =>
      items.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0,
      ),
    [items],
  );

  const handleQuantityChange = async (item, quantity) => {
    if (quantity < 1) return;

    setMessage("");
    setError("");
    setUpdatingItemId(item._id);

    try {
      await dispatch(
        updateCartItem({
          itemId: item._id,
          quantity,
        }),
      ).unwrap();
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Unable to update quantity.",
      );
    } finally {
      setUpdatingItemId("");
    }
  };

  const handleRemoveItem = async (itemId) => {
    setMessage("");
    setError("");
    setRemovingItemId(itemId);

    try {
      await dispatch(removeCartItem(itemId)).unwrap();
      setMessage("Product removed from cart.");
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Unable to remove product.",
      );
    } finally {
      setRemovingItemId("");
    }
  };

  const handleClearCart = async () => {
    if (items.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove all products from your cart?",
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await dispatch(clearCart()).unwrap();
      setMessage("Your cart has been cleared.");
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Unable to clear cart.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#1D4ED8]" size={32} />
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
              Shopping Cart
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
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

        {/* Empty Cart */}
        {items.length === 0 ? (
          <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white px-5 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
              <ShoppingCart size={42} className="text-[#1D4ED8]" />
            </div>

            <h2 className="mt-6 text-xl font-bold text-[#0F172A]">
              Your cart is empty
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Looks like you haven't added any products to your cart yet.
              Explore our collection and find something you love.
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#0F172A]">
                  Cart Items
                </h2>

                <button
                  type="button"
                  onClick={handleClearCart}
                  disabled={isMutating}
                  className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  Clear Cart
                </button>
              </div>

              {items.map((item) => {
                const product = item.product;

                if (!product) return null;

                const itemPrice = Number(
                  product.basePrice || product.sellingPrice || 0,
                );

                const variantId = item.variantId;

                const selectedVariant = product.variants?.find(
                  (variant) =>
                    String(variant._id) === String(variantId?._id || variantId),
                );

                const variantLabel = selectedVariant
                  ? Object.entries(
                      selectedVariant.attributes || {},
                    )
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(" / ")
                  : "";

                return (
                  <div
                    key={item._id}
                    className="rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      {/* Product Image */}
                      <Link
                        href={`/products/${product.slug}`}
                        className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F8FAFC] sm:h-32 sm:w-32"
                      >
                        {product.thumbnail?.url ? (
                          <Image
                            src={product.thumbnail.url}
                            alt={product.name}
                            width={128}
                            height={128}
                            className="h-full w-full object-contain p-2"
                            unoptimized
                          />
                        ) : (
                          <Package size={35} className="text-slate-300" />
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#1D4ED8]">
                            {product.brand || "MOBI HUB"}
                          </p>

                          <Link
                            href={`/products/${product.slug}`}
                            className="mt-1 block text-base font-bold text-[#0F172A] hover:text-[#1D4ED8]"
                          >
                            {product.name}
                          </Link>

                          {variantLabel && (
                            <p className="mt-1 text-xs text-slate-500">
                              {variantLabel}
                            </p>
                          )}

                          {selectedVariant?.sku && (
                            <p className="mt-1 text-xs text-slate-400">
                              SKU: {selectedVariant.sku}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                          {/* Quantity */}
                          <div className="flex items-center overflow-hidden rounded-lg border border-[#E2E8F0]">
                            <button
                              type="button"
                              disabled={
                                item.quantity <= 1 ||
                                isMutating ||
                                updatingItemId === item._id
                              }
                              onClick={() =>
                                handleQuantityChange(
                                  item,
                                  item.quantity - 1,
                                )
                              }
                              className="p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                            >
                              <Minus size={15} />
                            </button>

                            <span className="min-w-10 text-center text-sm font-bold text-[#0F172A]">
                              {updatingItemId === item._id ? (
                                <Loader2
                                  size={15}
                                  className="mx-auto animate-spin"
                                />
                              ) : (
                                item.quantity
                              )}
                            </span>

                            <button
                              type="button"
                              disabled={
                                isMutating ||
                                updatingItemId === item._id ||
                                (selectedVariant &&
                                  item.quantity >= selectedVariant.stock)
                              }
                              onClick={() =>
                                handleQuantityChange(
                                  item,
                                  item.quantity + 1,
                                )
                              }
                              className="p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item._id)}
                            disabled={isMutating}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            {removingItemId === item._id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}

                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex shrink-0 items-center justify-between border-t border-[#E2E8F0] pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
                        <p className="text-xs text-slate-500">
                          Price
                        </p>

                        <p className="text-lg font-extrabold text-[#0F172A]">
                          {formatPrice(itemPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <aside className="h-fit rounded-xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
              <h2 className="text-lg font-extrabold text-[#0F172A]">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal ({totalItems} items)</span>

                  <span className="font-semibold text-[#0F172A]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-slate-600">
                  <span>Shipping</span>

                  <span className="font-semibold text-green-600">
                    Calculated at checkout
                  </span>
                </div>

                <div className="border-t border-[#E2E8F0] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A]">
                      Estimated Total
                    </span>

                    <span className="text-xl font-extrabold text-[#1D4ED8]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Final shipping and coupon adjustments will be shown at checkout.
                  </p>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] px-5 py-4 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </Link>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Package size={15} />
                Secure shopping at MOBI HUB
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartPageContent />
    </ProtectedRoute>
  );
}
