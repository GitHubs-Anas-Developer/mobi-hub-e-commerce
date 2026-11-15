"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { AnimatePresence, motion } from "motion/react";

import {
  X,
  ShoppingBag,
  ShoppingCart,
  Package,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

import {
  updateCartItem,
  removeCartItem,
} from "@/store/thunks/cartThunks";

// ========================================
// HELPERS
// ========================================

const formatPrice = (price) => {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
};

// Product from your actual Cart structure
const getProduct = (item) => {
  return item?.product || null;
};

// Find selected variant using item.variantId
const getSelectedVariant = (item) => {
  const product = getProduct(item);

  if (!product?.variants) return null;

  const variantId =
    item?.variantId?._id || item?.variantId;

  return (
    product.variants.find(
      (variant) =>
        String(variant._id) === String(variantId)
    ) || null
  );
};

// Same price calculation as your CartPage.jsx
const getItemPrice = (item) => {
  const product = getProduct(item);

  return Number(
    product?.basePrice ||
    product?.sellingPrice ||
    0
  );
};

// Variant attributes
const getVariantLabel = (item) => {
  const variant = getSelectedVariant(item);

  if (!variant?.attributes) return "";

  return Object.entries(variant.attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" / ");
};

// Product image
const getProductImage = (item) => {
  const product = getProduct(item);

  return (
    product?.thumbnail?.url ||
    product?.images?.[0]?.url ||
    ""
  );
};

// ========================================
// MINI CART DRAWER
// ========================================

export default function MiniCartDrawer({
  isOpen,
  onClose,
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  const onCloseRef = useRef(onClose);

  const { items = [], isMutating } = useSelector(
    (state) => state.cart
  );

  const [updatingItemId, setUpdatingItemId] = useState("");
  const [removingItemId, setRemovingItemId] = useState("");

  const [isMobile, setIsMobile] = useState(false);

  // ========================================
  // RESPONSIVE DETECTION
  // ========================================

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");

    const updateScreen = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateScreen();

    mediaQuery.addEventListener("change", updateScreen);

    return () => {
      mediaQuery.removeEventListener("change", updateScreen);
    };
  }, []);

  // ========================================
  // CLOSE HANDLER REF
  // ========================================

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // ========================================
  // BODY SCROLL LOCK
  // ========================================

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onCloseRef.current?.();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // ========================================
  // CART TOTALS
  // ========================================

  const totalItems = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const price = getItemPrice(item);
      const quantity = Number(item.quantity || 0);

      return total + price * quantity;
    }, 0);
  }, [items]);

  // ========================================
  // UPDATE QUANTITY
  // ========================================

  const handleQuantityChange = async (item, quantity) => {
    if (quantity < 1 || isMutating) return;

    const itemId = item?._id;

    if (!itemId) {
      toast.error("Unable to update cart item.");
      return;
    }

    const selectedVariant = getSelectedVariant(item);

    const stock = selectedVariant?.stock;

    if (
      stock != null &&
      quantity > Number(stock)
    ) {
      toast.error("Available stock limit reached.");
      return;
    }

    setUpdatingItemId(itemId);

    try {
      await dispatch(
        updateCartItem({
          itemId,
          quantity,
        })
      ).unwrap();

    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to update quantity."
      );

    } finally {
      setUpdatingItemId("");
    }
  };

  // ========================================
  // REMOVE CART ITEM
  // ========================================

  const handleRemoveItem = async (itemId) => {
    if (!itemId || isMutating) return;

    setRemovingItemId(itemId);

    try {
      await dispatch(
        removeCartItem(itemId)
      ).unwrap();

      toast.success("Product removed from cart.");

    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to remove product."
      );

    } finally {
      setRemovingItemId("");
    }
  };

  // ========================================
  // NAVIGATION
  // ========================================

  const goToCart = () => {
    onCloseRef.current?.();
    router.push("/cart");
  };

  const goToCheckout = () => {
    if (!items.length) return;

    onCloseRef.current?.();
    router.push("/checkout");
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}

          <motion.button
            type="button"
            aria-label="Close cart drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onCloseRef.current?.()}
            className="fixed inset-0 z-[100] cursor-default bg-slate-950/45 backdrop-blur-[2px]"
          />

          {/* DRAWER */}

          <motion.aside
            initial={
              isMobile
                ? { opacity: 0, y: "100%" }
                : { opacity: 0, x: "100%" }
            }
            animate={
              isMobile
                ? { opacity: 1, y: 0 }
                : { opacity: 1, x: 0 }
            }
            exit={
              isMobile
                ? { opacity: 0, y: "100%" }
                : { opacity: 0, x: "100%" }
            }
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 32,
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mini-cart-title"
            className="fixed inset-x-0 bottom-0 z-[101] flex h-[88dvh] max-h-[90dvh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:max-h-full sm:w-[440px] sm:rounded-none sm:rounded-l-3xl"
          >

            {/* HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0755e9]">
                  <ShoppingBag size={21} />
                </div>

                <div>
                  <h2
                    id="mini-cart-title"
                    className="text-lg font-bold text-slate-900"
                  >
                    Your Cart
                  </h2>

                  <p className="text-xs text-slate-500">
                    {totalItems}{" "}
                    {totalItems === 1 ? "item" : "items"} in your cart
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => onCloseRef.current?.()}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                <X size={19} />
              </button>

            </div>

            {/* EMPTY CART */}

            {items.length === 0 ? (

              <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                  <ShoppingCart
                    size={34}
                    className="text-[#0755e9]"
                  />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  Your cart is empty
                </h3>

                <p className="mt-2 max-w-[260px] text-sm leading-6 text-slate-500">
                  Looks like you haven't added any products yet.
                  Explore our collection and find something you love.
                </p>

                <button
                  type="button"
                  onClick={() => onCloseRef.current?.()}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0755e9] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0645c4]"
                >
                  Continue Shopping
                  <ArrowRight size={16} />
                </button>

              </div>

            ) : (

              <>

                {/* CART ITEMS */}

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">

                  <div className="mb-3 flex items-center justify-between">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Cart Items
                    </p>

                    <span className="text-xs font-medium text-slate-500">
                      {items.length} products
                    </span>

                  </div>

                  <div className="divide-y divide-slate-100">

                    {items.map((item, index) => {
                      const product = getProduct(item);

                      if (!product) return null;

                      const itemId = item._id;

                      const name =
                        product.name || "Product";

                      const image = getProductImage(item);

                      const price = getItemPrice(item);

                      const quantity = Number(
                        item.quantity || 1
                      );

                      const selectedVariant =
                        getSelectedVariant(item);

                      const variantLabel =
                        getVariantLabel(item);

                      const stock = selectedVariant?.stock;

                      return (
                        <div
                          key={itemId || index}
                          className="flex gap-3 py-4"
                        >

                          {/* IMAGE */}

                          <Link
                            href={`/products/${product.slug}`}
                            onClick={() => onCloseRef.current?.()}
                            className="relative h-[82px] w-[82px] shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                          >
                            {image ? (
                              <Image
                                src={image}
                                alt={name}
                                width={82}
                                height={82}
                                unoptimized
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package
                                  size={26}
                                  className="text-slate-300"
                                />
                              </div>
                            )}
                          </Link>

                          {/* PRODUCT DETAILS */}

                          <div className="flex min-w-0 flex-1 flex-col">

                            <div className="flex items-start justify-between gap-2">

                              <div className="min-w-0">

                                <p className="text-[10px] font-bold uppercase tracking-wide text-[#0755e9]">
                                  {product.brand || "MOBI HUB"}
                                </p>

                                <Link
                                  href={`/products/${product.slug}`}
                                  onClick={() => onCloseRef.current?.()}
                                  className="mt-1 line-clamp-2 block text-sm font-semibold leading-5 text-slate-900 hover:text-[#0755e9]"
                                >
                                  {name}
                                </Link>

                                {variantLabel && (
                                  <p className="mt-1 text-[11px] text-slate-500">
                                    {variantLabel}
                                  </p>
                                )}

                                {selectedVariant?.sku && (
                                  <p className="mt-1 text-[10px] text-slate-400">
                                    SKU: {selectedVariant.sku}
                                  </p>
                                )}

                              </div>

                              {/* REMOVE */}

                              <button
                                type="button"
                                disabled={isMutating}
                                onClick={() =>
                                  handleRemoveItem(itemId)
                                }
                                aria-label={`Remove ${name}`}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              >
                                {removingItemId === itemId ? (
                                  <Loader2
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>

                            </div>

                            {/* PRICE + QUANTITY */}

                            <div className="mt-auto flex items-end justify-between gap-2 pt-3">

                              <p className="text-sm font-extrabold text-slate-900">
                                {formatPrice(price * quantity)}
                              </p>

                              {/* QUANTITY */}

                              <div className="flex items-center overflow-hidden rounded-lg border border-slate-200">

                                <button
                                  type="button"
                                  disabled={
                                    isMutating ||
                                    updatingItemId === itemId ||
                                    quantity <= 1
                                  }
                                  onClick={() =>
                                    handleQuantityChange(
                                      item,
                                      quantity - 1
                                    )
                                  }
                                  aria-label="Decrease quantity"
                                  className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Minus size={14} />
                                </button>

                                <span className="flex min-w-9 items-center justify-center text-xs font-bold text-slate-900">

                                  {updatingItemId === itemId ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    quantity
                                  )}

                                </span>

                                <button
                                  type="button"
                                  disabled={
                                    isMutating ||
                                    updatingItemId === itemId ||
                                    (
                                      selectedVariant &&
                                      quantity >= Number(stock)
                                    )
                                  }
                                  onClick={() =>
                                    handleQuantityChange(
                                      item,
                                      quantity + 1
                                    )
                                  }
                                  aria-label="Increase quantity"
                                  className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Plus size={14} />
                                </button>

                              </div>

                            </div>

                          </div>

                        </div>
                      );
                    })}

                  </div>

                </div>

                {/* FOOTER */}

                <div className="shrink-0 border-t border-slate-200 bg-white px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-6">

                  {/* SUBTOTAL */}

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-semibold text-slate-600">
                      Subtotal ({totalItems} items)
                    </span>

                    <span className="text-xl font-extrabold tracking-tight text-slate-950">
                      {formatPrice(subtotal)}
                    </span>

                  </div>

                  <p className="mt-2 text-[11px] leading-5 text-slate-400">
                    Final shipping and coupon adjustments will be shown at checkout.
                  </p>

                  {/* CHECKOUT */}

                  <button
                    type="button"
                    disabled={isMutating || items.length === 0}
                    onClick={goToCheckout}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0755e9] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition hover:bg-[#0645c4] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Proceed to Checkout
                    <ArrowRight size={17} />
                  </button>

                  {/* VIEW FULL CART */}

                  <button
                    type="button"
                    onClick={goToCart}
                    className="mt-2.5 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0755e9]"
                  >
                    View Full Cart
                  </button>

                  {/* SECURE SHOPPING */}

                  <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck size={14} />
                    Secure shopping at MOBI HUB
                  </div>

                </div>

              </>
            )}

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

