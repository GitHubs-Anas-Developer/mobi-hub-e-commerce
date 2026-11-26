
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { useDispatch, useSelector } from "react-redux";

import {
  ArrowLeft,
  ChevronRight,
  Package,
} from "lucide-react";

import { toast } from "sonner";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

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

import RecentlyViewed from "@/components/recently-viewed/RecentlyViewed";
import recentlyViewedService from "@/services/recentlyViewed.service";
import RelatedProducts from "@/components/related-products/RelatedProducts";

import Breadcrumb from "@/components/common/Breadcrumb";

/* =====================================
   ANIMATION VARIANTS
===================================== */

const pageVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.12,
    },
  },
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -30,
  },

  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeRight = {
  hidden: {
    opacity: 0,
    x: 30,
  },

  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const sectionReveal = {
  hidden: {
    opacity: 0,
    y: 35,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =====================================
   PRICE HELPERS
===================================== */

function getVariantPrice(variant) {
  return Number(variant?.sellingPrice ?? 0);
}

function getVariantMrp(variant) {
  return Number(
    variant?.mrp ?? getVariantPrice(variant)
  );
}

/* =====================================
   PRODUCT DETAIL CLIENT
===================================== */

export default function ProductDetailClient({ slug }) {
  const router = useRouter();
  const dispatch = useDispatch();

  /* =====================================
     REDUX STATE
  ===================================== */

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

  /* =====================================
     LOCAL STATE
  ===================================== */

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedVariantId, setSelectedVariantId] =
    useState("");

  const [selectedImage, setSelectedImage] = useState("");

  const [quantity, setQuantity] = useState(1);

  /* =====================================
     FETCH PRODUCT
  ===================================== */

  const fetchProduct = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      setProduct(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await productService.getProductBySlug(slug);

      const fetchedProduct = response.data;

      if (!fetchedProduct) {
        throw new Error("Product not found.");
      }

      setProduct(fetchedProduct);

      const images = [
        fetchedProduct.thumbnail?.url,

        ...(fetchedProduct.images || []).map(
          (image) => image.url
        ),
      ].filter(Boolean);

      setSelectedImage(images[0] || "");

      const activeVariants = (
        fetchedProduct.variants || []
      ).filter(
        (variant) => variant.isActive !== false
      );

      const defaultVariant = activeVariants.find(
        (variant) => variant.isDefault
      );

      const initialVariant =
        defaultVariant || activeVariants[0];

      setSelectedVariantId(
        initialVariant?._id || ""
      );

      setQuantity(1);
    } catch (err) {
      setProduct(null);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load this product."
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  /* =====================================
     TRACK RECENTLY VIEWED PRODUCT
  ===================================== */

  useEffect(() => {
    if (!product?._id || !isAuthenticated) return;

    const trackProduct = async () => {
      try {
        await recentlyViewedService.addRecentlyViewed(
          product._id
        );
      } catch (error) {
        console.error(
          "Recently viewed tracking failed:",
          error
        );
      }
    };

    trackProduct();
  }, [product?._id, isAuthenticated]);

  /* =====================================
     ACTIVE VARIANTS
  ===================================== */

  const activeVariants = useMemo(
    () =>
      (product?.variants || []).filter(
        (variant) => variant.isActive !== false
      ),
    [product]
  );

  const selectedVariant = activeVariants.find(
    (variant) =>
      String(variant._id) === String(selectedVariantId)
  );

  /* =====================================
     PRICE
  ===================================== */

  const sellingPrice = getVariantPrice(
    selectedVariant
  );

  const mrp = getVariantMrp(selectedVariant);

  const discount =
    mrp > sellingPrice && mrp > 0
      ? Math.round(
          ((mrp - sellingPrice) / mrp) * 100
        )
      : 0;

  /* =====================================
     STOCK
  ===================================== */

  const stock = Number(
    selectedVariant?.stock || 0
  );

  const canPurchase = Boolean(
    selectedVariant && stock > 0
  );

  /* =====================================
     PRODUCT IMAGES
  ===================================== */

  const productImages = useMemo(
    () =>
      [
        product?.thumbnail?.url,

        ...(product?.images || []).map(
          (image) => image.url
        ),

        ...(selectedVariant?.images || []).map(
          (image) => image.url
        ),
      ].filter(Boolean),
    [product, selectedVariant]
  );

  /* =====================================
     SPECIFICATIONS
  ===================================== */

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

  /* =====================================
     WISHLIST STATUS
  ===================================== */

  const isInWishlist = (
    wishlistProducts || []
  ).some(
    (item) =>
      String(item._id) === String(product?._id)
  );

  /* =====================================
     LOGIN REDIRECT
  ===================================== */

  const requireLogin = () => {
    router.push(
      `/login?redirect=${encodeURIComponent(
        `/products/${slug}`
      )}`
    );
  };

  /* =====================================
     VARIANT CHANGE
  ===================================== */

  const handleVariantChange = (variantId) => {
    setSelectedVariantId(variantId);
    setQuantity(1);

    const variant = activeVariants.find(
      (item) =>
        String(item._id) === String(variantId)
    );

    if (variant?.images?.[0]?.url) {
      setSelectedImage(variant.images[0].url);
    } else {
      setSelectedImage(
        product.thumbnail?.url ||
          product.images?.[0]?.url ||
          ""
      );
    }
  };

  /* =====================================
     PURCHASE VALIDATION
  ===================================== */

  const validatePurchase = () => {
    if (!isAuthenticated) {
      requireLogin();
      return false;
    }

    if (!product?._id || !selectedVariant?._id) {
      toast.error("Please select a product variant.");
      return false;
    }

    if (!canPurchase) {
      toast.error(
        "This product is currently unavailable."
      );
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

  /* =====================================
     ADD TO CART
  ===================================== */

  const handleAddToCart = async () => {
    if (!validatePurchase()) {
      return false;
    }

    try {
      await dispatch(
        addToCart({
          productId: product._id,
          variantId: selectedVariant._id,
          quantity: Number(quantity),
        })
      ).unwrap();

      toast.success(
        "Product added to cart successfully."
      );

      return true;
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message ||
              "Unable to add product to cart."
      );

      return false;
    }
  };

  /* =====================================
     BUY NOW - DIRECT CHECKOUT
  ===================================== */

  const handleBuyNow = () => {
    if (!validatePurchase()) {
      return;
    }

    const checkoutParams = new URLSearchParams({
      mode: "direct",
      productId: String(product._id),
      variantId: String(selectedVariant._id),
      quantity: String(Number(quantity)),
      slug: product.slug,
    });

    router.push(
      `/checkout?${checkoutParams.toString()}`
    );
  };

  /* =====================================
     WISHLIST
  ===================================== */

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      requireLogin();
      return;
    }

    if (!product?._id) return;

    try {
      if (isInWishlist) {
        await dispatch(
          removeFromWishlist(product._id)
        ).unwrap();

        toast.success("Removed from wishlist.");
      } else {
        await dispatch(
          addToWishlist(product._id)
        ).unwrap();

        toast.success("Added to wishlist.");
      }
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message ||
              "Unable to update wishlist."
      );
    }
  };

  /* =====================================
     LOADING STATE
  ===================================== */

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ProductDetailSkeleton />
      </motion.div>
    );
  }

  /* =====================================
     ERROR / NOT FOUND
  ===================================== */

  if (error || !product) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
      >
        <Package
          size={48}
          className="text-slate-300"
        />

        <h1 className="mt-4 text-2xl font-bold text-[#101828]">
          Product not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {error || "This product may be unavailable."}
        </p>

        <Link
          href="/products"
          className="mt-6 rounded-lg bg-[#0755e9] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0645c4]"
        >
          Browse Products
        </Link>
      </motion.div>
    );
  }

  /* =====================================
     MAIN UI
  ===================================== */

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={product._id}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-white pb-32 sm:pb-36"
      >
        <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">

          {/* BACK TO MY ACCOUNT */}
          <motion.div variants={fadeUp}>
            <Link
              href="/account"
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Back to My Account
            </Link>
          </motion.div>

          {/* BREADCRUMB */}
<motion.nav
  variants={fadeUp}
  className="mb-6 flex w-full flex-col items-start gap-2.5"
>
  
  <Breadcrumb
    items={[
      { label: "Products", href: "/products" },
      { label: product.name },
    ]}
  />
</motion.nav>
          {/* PRODUCT MAIN SECTION */}

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:items-stretch">

            {/* PRODUCT GALLERY */}

            <motion.div
              variants={fadeLeft}
              className="min-w-0"
            >
              <ProductGallery
                productImages={productImages}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                onWishlist={handleWishlist}
                isInWishlist={isInWishlist}
                wishlistIsMutating={wishlistIsMutating}
              />
            </motion.div>

            {/* PRODUCT INFORMATION */}

            <motion.div
              variants={fadeRight}
              className="flex min-w-0 flex-col lg:min-h-[620px]"
            >
              <ProductInfo
                product={product}
                selectedVariant={selectedVariant}
                sellingPrice={sellingPrice}
                mrp={mrp}
                discount={discount}
              />

              {/* STOCK STATUS */}

              <AnimatePresence mode="wait">
                {selectedVariant && (
                  <motion.div
                    key={selectedVariant._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="mt-5"
                  >
                    <p
                      className={`text-sm font-semibold ${
                        canPurchase
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {canPurchase
                        ? "In Stock - Ready to ship"
                        : "Currently unavailable"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* VARIANT SELECTOR */}

              <motion.div
                variants={fadeUp}
                className="mt-2"
              >
                <ProductVariantSelector
                  variants={activeVariants}
                  selectedVariantId={selectedVariantId}
                  onVariantChange={handleVariantChange}
                />
              </motion.div>

              {/* QUANTITY SELECTOR */}

              <motion.div
                variants={fadeUp}
                className="mt-6"
              >
                <ProductQuantitySelector
                  quantity={quantity}
                  setQuantity={setQuantity}
                  stock={stock}
                  canPurchase={canPurchase}
                />
              </motion.div>

              {/* SERVICE HIGHLIGHTS */}

              <motion.div
                variants={fadeUp}
                className="mt-7"
              >
                <ProductServiceHighlights />
              </motion.div>

            </motion.div>
          </div>

          {/* FIXED RESPONSIVE PRODUCT ACTIONS */}

          <ProductActions
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            cartIsMutating={cartIsMutating}
            canPurchase={canPurchase}
          />

          {/* PRODUCT DESCRIPTION */}

          <motion.section
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            className="mt-16"
          >
            <ProductDescription
              description={product.description}
            />
          </motion.section>

          {/* PRODUCT SPECIFICATIONS */}

          <motion.section
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            className="mt-12"
          >
            <ProductSpecifications
              specifications={specifications}
            />
          </motion.section>

          {/* PRODUCT REVIEWS */}

          <motion.section
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.1,
            }}
            className="mt-12"
          >
            <ReviewSection
              productId={product._id}
              isAuthenticated={isAuthenticated}
              onRequireLogin={requireLogin}
            />
          </motion.section>

          {/* RELATED PRODUCTS */}

          <motion.section
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.1,
            }}
            className="mt-12"
          >
            <RelatedProducts
              productId={product._id}
              title="Related Products"
              subtitle="Explore similar products you may like."
              limit={10}
            />
          </motion.section>

          {/* RECENTLY VIEWED PRODUCTS */}

          <RecentlyViewed
            title="Recently Viewed Products"
            limit={5}
            excludeProductId={product._id}
          />

        </div>
      </motion.main>
    </AnimatePresence>
  );
}
