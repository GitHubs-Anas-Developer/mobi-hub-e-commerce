"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ShoppingBag,
  ShieldCheck,
  LockKeyhole,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CreditCard,
  RefreshCw,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
} from "framer-motion";

import addressService from "@/services/addressService";
import couponService from "@/services/couponService";
import orderService from "@/services/orderService";
import paymentService from "@/services/paymentService";
import productService from "@/services/productService";

import { fetchCart } from "@/store/thunks/cartThunks";

import DeliveryAddress from "./DeliveryAddress";
import PaymentMethod from "./PaymentMethod";
import OrderSummary from "./OrderSummary";
import CheckoutSkeleton from "../loading/skeletons/CheckoutSkeleton";

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

/* ---------------------------------------
   Initial Address Form
--------------------------------------- */

const initialAddressForm = {
  fullName: "",
  phone: "",
  alternatePhone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  addressType: "Home",
  isDefault: false,
};

/* ---------------------------------------
   Price Formatter
--------------------------------------- */

export const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

/* ---------------------------------------
   Cart Item Details
--------------------------------------- */

export const getCartItemDetails = (item) => {
  const product = item.product || item.productId || {};

  const variantId =
    typeof item.variantId === "object"
      ? item.variantId?._id
      : item.variantId;

  const variant =
    (typeof item.variantId === "object" && item.variantId) ||
    product.variants?.find(
      (variant) => String(variant._id) === String(variantId)
    ) ||
    product.variants?.find((variant) => variant.isDefault) ||
    product.variants?.[0] ||
    {};

  return {
    product,
    variant,

    sellingPrice: Number(
      variant.sellingPrice ??
        item.sellingPrice ??
        product.basePrice ??
        0
    ),

    mrp: Number(
      variant.mrp ??
        item.mrp ??
        product.basePrice ??
        0
    ),

    quantity: Number(item.quantity || 0),
  };
};

/* ---------------------------------------
   Load Razorpay Script
--------------------------------------- */

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`
    );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => resolve(Boolean(window.Razorpay)),
        { once: true }
      );

      existingScript.addEventListener(
        "error",
        () => resolve(false),
        { once: true }
      );

      return;
    }

    const script = document.createElement("script");

    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      resolve(Boolean(window.Razorpay));
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });

/* ---------------------------------------
   Animation Variants
--------------------------------------- */

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 22,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const pageVariants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

/* =======================================
   CHECKOUT CONTENT
======================================= */

export default function CheckoutContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Direct checkout query parameters are identifiers only.
  // Product price and stock are always loaded from the backend.
  const isDirectCheckout = searchParams.get("mode") === "direct";
  const directProductId = searchParams.get("productId") || "";
  const directVariantId = searchParams.get("variantId") || "";
  const directSlug = searchParams.get("slug") || "";
  const directQuantity = Number(searchParams.get("quantity") || 0);

  /* ---------------------------------------
     Redux Cart
  --------------------------------------- */

  const {
    items: cartItems = [],
    isLoading: cartLoading,
    error: cartError,
  } = useSelector((state) => state.cart);

  /* ---------------------------------------
     Direct Checkout Product
  --------------------------------------- */

  const [directProduct, setDirectProduct] = useState(null);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState("");
  const [directRetryKey, setDirectRetryKey] = useState(0);

  const directVariant = directProduct?.variants?.find(
    (variant) => String(variant._id) === String(directVariantId)
  );

  /* ---------------------------------------
     Scroll Progress
  --------------------------------------- */

  const { scrollYProgress } = useScroll();

  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  /* ---------------------------------------
     Address States
  --------------------------------------- */

  const [addresses, setAddresses] = useState([]);

  const [selectedAddress, setSelectedAddress] =
    useState("");

  const [addressLoading, setAddressLoading] =
    useState(true);

  const [addressError, setAddressError] =
    useState("");

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [addressForm, setAddressForm] =
    useState(initialAddressForm);

  /* ---------------------------------------
     Payment State
  --------------------------------------- */

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("razorpay");

  /* ---------------------------------------
     Coupon States
  --------------------------------------- */

  const [couponCode, setCouponCode] = useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState(null);

  const [couponLoading, setCouponLoading] =
    useState(false);

  const [couponError, setCouponError] =
    useState("");

  const [couponSuccess, setCouponSuccess] =
    useState("");

  /* ---------------------------------------
     Order & Payment States
  --------------------------------------- */

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [pendingOnlineOrderId, setPendingOnlineOrderId] =
    useState(null);

  const [pendingVerificationData, setPendingVerificationData] =
    useState(null);

  const [checkoutError, setCheckoutError] =
    useState("");

  /* =======================================
     FETCH CART
  ======================================= */

  useEffect(() => {
    // Direct checkout must not fetch or modify the user's cart.
    if (!isDirectCheckout) {
      dispatch(fetchCart());
    }
  }, [dispatch, isDirectCheckout]);

  /* =======================================
     FETCH DIRECT CHECKOUT PRODUCT
  ======================================= */

  useEffect(() => {
    if (!isDirectCheckout) {
      setDirectProduct(null);
      setDirectError("");
      setDirectLoading(false);
      return;
    }

    let isMounted = true;

    const fetchDirectProduct = async () => {
      setDirectProduct(null);
      setDirectLoading(true);
      setDirectError("");

      try {
        const isValidObjectId = (value) =>
          /^[0-9a-fA-F]{24}$/.test(value);

        if (
          !isValidObjectId(directProductId) ||
          !isValidObjectId(directVariantId) ||
          !directSlug ||
          !Number.isInteger(directQuantity) ||
          directQuantity < 1 ||
          directQuantity > 100
        ) {
          throw new Error("Invalid direct checkout details.");
        }

    const response =
  await productService.getProductBySlug(directSlug);

console.log("DIRECT CHECKOUT API RESPONSE:", response);

const product =
  response?.data?.data ||
  response?.data ||
  response?.product ||
  response;

console.log("DIRECT CHECKOUT PRODUCT:", product);
        if (
          !product ||
          String(product._id) !== String(directProductId) ||
          product.isActive === false
        ) {
          throw new Error("Selected product is unavailable.");
        }

        const variant = (product.variants || []).find(
          (item) => String(item._id) === String(directVariantId)
        );

        if (!variant || variant.isActive === false) {
          throw new Error("Selected product variant is unavailable.");
        }

        if (Number(variant.stock) < directQuantity) {
          throw new Error("Insufficient stock for the selected quantity.");
        }

        if (isMounted) {
          setDirectProduct(product);
        }
      } catch (error) {
        if (isMounted) {
          setDirectProduct(null);

          setDirectError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load the selected product."
          );
        }
      } finally {
        if (isMounted) {
          setDirectLoading(false);
        }
      }
    };

    fetchDirectProduct();

    return () => {
      isMounted = false;
    };
  }, [
    isDirectCheckout,
    directProductId,
    directVariantId,
    directSlug,
    directQuantity,
    directRetryKey,
  ]);

  /* =======================================
     FETCH ADDRESSES
  ======================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchAddresses = async () => {
      try {
        setAddressLoading(true);
        setAddressError("");

        const response = await addressService.getAddresses();

        const addressList = Array.isArray(response.data)
          ? response.data
          : response.data?.addresses || [];

        if (!isMounted) return;

        setAddresses(addressList);

        const defaultAddress = addressList.find(
          (address) => address.isDefault
        );

        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        } else if (addressList.length > 0) {
          setSelectedAddress(addressList[0]._id);
        }
      } catch (error) {
        if (!isMounted) return;

        setAddressError(
          error.response?.data?.message ||
            "Unable to load delivery addresses."
        );
      } finally {
        if (isMounted) {
          setAddressLoading(false);
        }
      }
    };

    fetchAddresses();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =======================================
     CHECKOUT ITEMS & CALCULATIONS
  ======================================= */

  const checkoutItems = isDirectCheckout
    ? directProduct && directVariant
      ? [
          {
            product: directProduct,
            variantId: directVariantId,
            quantity: directQuantity,
          },
        ]
      : []
    : cartItems;

  const checkoutLoading = isDirectCheckout
    ? directLoading
    : cartLoading;

  const checkoutLoadError = isDirectCheckout
    ? directError
    : cartError;

  const subtotal = checkoutItems.reduce((total, item) => {
    const { sellingPrice, quantity } = getCartItemDetails(item);

    return total + sellingPrice * quantity;
  }, 0);

  const shippingFee = 0;

  const discount = appliedCoupon
    ? Number(appliedCoupon.discountAmount || 0)
    : 0;

  const totalAmount = appliedCoupon
    ? Number(appliedCoupon.finalAmount || 0) + shippingFee
    : subtotal + shippingFee;

  const totalItems = checkoutItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  /* =======================================
     ADDRESS FORM CHANGE
  ======================================= */

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;

    setAddressForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =======================================
     ADD NEW ADDRESS
  ======================================= */

  const handleAddAddress = async (event) => {
    event.preventDefault();

    try {
      setSavingAddress(true);
      setAddressError("");

      const response =
        await addressService.createAddress(addressForm);

      const newAddress =
        response.data?.address || response.data;

      if (!newAddress?._id) {
        throw new Error(
          "Invalid address response from server."
        );
      }

      setAddresses((previous) => {
        const updatedAddresses = addressForm.isDefault
          ? previous.map((address) => ({
              ...address,
              isDefault: false,
            }))
          : previous;

        return [...updatedAddresses, newAddress];
      });

      setSelectedAddress(newAddress._id);

      setShowAddressForm(false);

      setAddressForm({ ...initialAddressForm });
    } catch (error) {
      setAddressError(
        error.response?.data?.message ||
          error.message ||
          "Unable to add delivery address."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  /* =======================================
     APPLY COUPON
  ======================================= */

  const handleApplyCoupon = async (event) => {
    event.preventDefault();

    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");
      setCouponSuccess("");

      const response =
        await couponService.applyCoupon(code);

      const couponData = response.data || response;

      if (
        !couponData.coupon ||
        typeof couponData.discountAmount !== "number" ||
        typeof couponData.finalAmount !== "number"
      ) {
        throw new Error(
          "Invalid coupon response from server."
        );
      }

      setAppliedCoupon(couponData);

      setCouponCode(couponData.coupon.code);

      setCouponSuccess(
        `Coupon ${couponData.coupon.code} applied successfully!`
      );
    } catch (error) {
      setAppliedCoupon(null);
      setCouponSuccess("");

      setCouponError(
        error.response?.data?.message ||
          error.message ||
          "Unable to apply coupon. Please try again."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  /* =======================================
     REMOVE COUPON
  ======================================= */

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setCouponSuccess("");
  };

  /* =======================================
     VERIFY RAZORPAY PAYMENT
  ======================================= */

  const verifyRazorpayPayment = async (
    paymentData,
    orderId
  ) => {
    try {
      setIsProcessing(true);
      setCheckoutError("");

      const response =
        await paymentService.verifyPayment(paymentData);

      if (!response.success) {
        throw new Error(
          response.message || "Payment verification failed."
        );
      }

      setPendingOnlineOrderId(null);
      setPendingVerificationData(null);

      router.replace(`/order-success/${orderId}`);
    } catch (error) {
      setPendingVerificationData({
        paymentData,
        orderId,
      });

      setCheckoutError(
        error.response?.data?.message ||
          error.message ||
          "Payment verification failed. Please retry verification."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /* =======================================
     OPEN RAZORPAY CHECKOUT
  ======================================= */

  const openRazorpayCheckout = async (
    paymentData,
    orderId
  ) => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded || !window.Razorpay) {
      throw new Error(
        "Unable to load Razorpay checkout. Please try again."
      );
    }

    const options = {
      key: paymentData.keyId,
      amount: paymentData.amount,
      currency: paymentData.currency,

      name: "MOBI HUB",

      description: "MOBI HUB Order Payment",

      order_id: paymentData.razorpayOrderId,

      handler: async (response) => {
        const verificationData = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        };

        await verifyRazorpayPayment(
          verificationData,
          orderId
        );
      },

      modal: {
        ondismiss: () => {
          setIsProcessing(false);

          setCheckoutError(
            "Payment window closed. Your order is still pending payment. You can retry payment."
          );
        },
      },

      theme: {
        color: "#0755E9",
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", (response) => {
      setIsProcessing(false);

      setCheckoutError(
        response.error?.description ||
          "Payment failed. You can retry payment."
      );
    });

    razorpay.open();
  };  /* =======================================
     RETRY ONLINE PAYMENT
  ======================================= */

  const handleRetryPayment = async () => {
    if (!pendingOnlineOrderId || isProcessing) return;

    try {
      setIsProcessing(true);
      setCheckoutError("");

      const response =
        await paymentService.initiatePayment(
          pendingOnlineOrderId
        );

      if (
        !response.success ||
        !response.data?.razorpayOrderId
      ) {
        throw new Error(
          response.message || "Unable to initiate payment."
        );
      }

      await openRazorpayCheckout(
        response.data,
        pendingOnlineOrderId
      );
    } catch (error) {
      setCheckoutError(
        error.response?.data?.message ||
          error.message ||
          "Unable to retry payment."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /* =======================================
     RETRY PAYMENT VERIFICATION
  ======================================= */

  const handleRetryVerification = async () => {
    if (!pendingVerificationData || isProcessing) return;

    await verifyRazorpayPayment(
      pendingVerificationData.paymentData,
      pendingVerificationData.orderId
    );
  };

  /* =======================================
     PLACE ORDER
  ======================================= */

  const handlePlaceOrder = async () => {
    if (isProcessing) return;

    if (!selectedAddress) {
      setCheckoutError(
        "Please select a delivery address."
      );
      return;
    }

    if (addressLoading) {
      setCheckoutError(
        "Please wait while delivery addresses are loading."
      );
      return;
    }

    if (checkoutItems.length === 0) {
      setCheckoutError(
        isDirectCheckout
          ? "The selected product is unavailable. Please try again."
          : "Your cart is empty."
      );
      return;
    }

    if (isDirectCheckout && (!directProduct || !directVariant)) {
      setCheckoutError(
        "Unable to verify the selected product."
      );
      return;
    }

    try {
      setIsProcessing(true);
      setCheckoutError("");

      // Map frontend payment method to backend enum
      const paymentMethod =
        selectedPaymentMethod === "razorpay"
          ? "Online"
          : "COD";

      const orderPayload = {
        addressId: selectedAddress,
        paymentMethod,
      };

      // Direct checkout sends only the selected product.
      // Normal cart checkout sends no items array.
      if (isDirectCheckout) {
        orderPayload.checkoutType = "direct";

        orderPayload.items = [
          {
            productId: directProductId,
            variantId: directVariantId,
            quantity: directQuantity,
          },
        ];
      }

      if (appliedCoupon?.coupon?.code) {
        orderPayload.couponCode =
          appliedCoupon.coupon.code;
      }

      // Create order
      const orderResponse =
        await orderService.createOrder(orderPayload);

      const order =
        orderResponse.data?.data || orderResponse.data;

      if (!order?._id) {
        throw new Error("Unable to create order.");
      }

      // COD Flow
      if (paymentMethod === "COD") {
        router.replace(`/order-success/${order._id}`);
        return;
      }

      // Keep created order ID for payment retry
      setPendingOnlineOrderId(order._id);

      // Initiate Razorpay Payment
      const paymentResponse =
        await paymentService.initiatePayment(order._id);

      if (
        !paymentResponse.success ||
        !paymentResponse.data?.razorpayOrderId
      ) {
        throw new Error(
          paymentResponse.message ||
            "Unable to initiate online payment."
        );
      }

      await openRazorpayCheckout(
        paymentResponse.data,
        order._id
      );
    } catch (error) {
      setCheckoutError(
        error.response?.data?.message ||
          error.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };  /* =======================================
     RENDER
  ======================================= */

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-7 sm:py-10">

      {/* Scroll Progress */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left bg-[#0755E9]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =================================
            PAGE HEADER
        ================================= */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href={
              isDirectCheckout && directSlug
                ? `/products/${directSlug}`
                : "/cart"
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition hover:text-[#0755E9]"
          >
            <ArrowLeft size={16} />
            {isDirectCheckout ? "Back to Product" : "Back to Cart"}
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl">
                Checkout
              </h1>

              <p className="mt-2 text-sm text-[#64748B]">
                Complete your order securely with MOBI HUB.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
              <ShieldCheck
                size={17}
                className="text-[#0755E9]"
              />
              Secure checkout
            </div>
          </div>
        </motion.div>

        {/* =================================
            LOADING
        ================================= */}

       {checkoutLoading ? (
  <CheckoutSkeleton
    isDirectCheckout={isDirectCheckout}
  />
        ) : checkoutLoadError ? (

          /* =================================
              LOADING ERROR
          ================================= */

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"
          >
            <AlertCircle
              size={32}
              className="mx-auto text-red-500"
            />

            <p className="mt-3 text-sm text-red-600">
              {checkoutLoadError}
            </p>

            <button
              type="button"
              onClick={() => {
                if (isDirectCheckout) {
                  setDirectRetryKey((value) => value + 1);
                } else {
                  dispatch(fetchCart());
                }
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0645C4]"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </motion.div>
        ) : checkoutItems.length === 0 &&
          !pendingOnlineOrderId ? (

          /* =================================
              EMPTY CART / PRODUCT
          ================================= */

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#E2E8F0] bg-white px-6 py-14 text-center shadow-sm"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF] text-[#0755E9]">
              <ShoppingBag size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#101828]">
              {isDirectCheckout
                ? "Product unavailable"
                : "Your cart is empty"}
            </h2>

            <p className="mt-2 text-sm text-[#64748B]">
              {isDirectCheckout
                ? "The selected product could not be loaded. Please return to the product page and try again."
                : "Add some products before proceeding to checkout."}
            </p>

            <Link
              href={
                isDirectCheckout && directSlug
                  ? `/products/${directSlug}`
                  : "/products"
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0645C4]"
            >
              {isDirectCheckout
                ? "Back to Product"
                : "Continue Shopping"}

              <ArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (

          /* =================================
              CHECKOUT CONTENT
          ================================= */

          <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8"
          >

            {/* =================================
                LEFT SECTION
            ================================= */}

            <section className="space-y-6 lg:col-span-2">

              {/* DELIVERY ADDRESS */}

              {!pendingOnlineOrderId && (
                <motion.div
                  variants={sectionVariants}
                  className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-7"
                >
                  <DeliveryAddress
                    addresses={addresses}
                    selectedAddress={selectedAddress}
                    onSelectAddress={setSelectedAddress}
                    addressLoading={addressLoading}
                    addressError={addressError}
                    showAddressForm={showAddressForm}
                    onOpenAddressForm={() => {
                      setAddressError("");
                      setShowAddressForm(true);
                    }}
                    onCancelAddressForm={() => {
                      setShowAddressForm(false);

                      setAddressForm({
                        ...initialAddressForm,
                      });

                      setAddressError("");
                    }}
                    addressForm={addressForm}
                    onAddressChange={handleAddressChange}
                    onAddAddress={handleAddAddress}
                    savingAddress={savingAddress}
                  />
                </motion.div>
              )}

              {/* PAYMENT METHOD */}

              {!pendingOnlineOrderId && (
                <motion.div
                  variants={sectionVariants}
                  className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-7"
                >
                  <PaymentMethod
                    selectedPaymentMethod={selectedPaymentMethod}
                    onSelectPaymentMethod={
                      setSelectedPaymentMethod
                    }
                    disabled={isProcessing}
                  />
                </motion.div>
              )}

              {/* CHECKOUT ERROR */}

              <AnimatePresence>
                {checkoutError && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                    role="alert"
                    className="flex items-start gap-3 overflow-hidden rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <AlertCircle
                      size={19}
                      className="mt-0.5 shrink-0"
                    />

                    <p>{checkoutError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PAYMENT RETRY INFORMATION */}

              <AnimatePresence>
                {pendingOnlineOrderId && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600">
                        <CreditCard size={20} />
                      </div>

                      <div>
                        <h2 className="font-bold text-amber-900">
                          Online payment is pending
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-amber-800">
                          Your order has already been created.
                          You do not need to place another order.
                          Continue with the existing order&apos;s
                          payment.
                        </p>

                        <p className="mt-3 break-all text-xs font-medium text-amber-800">
                          Order ID: {pendingOnlineOrderId}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* =================================
                RIGHT SECTION
            ================================= */}

            <motion.aside
              variants={sectionVariants}
              className="space-y-5 lg:sticky lg:top-6"
            >

              {/* ORDER SUMMARY */}

              {!pendingOnlineOrderId && (
                <OrderSummary
                  cartItems={checkoutItems}
                  totalItems={totalItems}
                  subtotal={subtotal}
                  shippingFee={shippingFee}
                  discount={discount}
                  totalAmount={totalAmount}
                  appliedCoupon={appliedCoupon}
                  couponCode={couponCode}
                  couponLoading={couponLoading}
                  couponError={couponError}
                  couponSuccess={couponSuccess}
                  onCouponCodeChange={(value) => {
                    setCouponCode(value.toUpperCase());
                    setCouponError("");
                    setCouponSuccess("");
                  }}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                />
              )}

              {/* PLACE ORDER / RETRY PAYMENT */}

              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">

                {pendingVerificationData ? (

                  /* RETRY VERIFICATION */

                  <button
                    type="button"
                    onClick={handleRetryVerification}
                    disabled={isProcessing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0645C4] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw
                          size={17}
                          className="animate-spin"
                        />
                        Verifying Payment...
                      </>
                    ) : (
                      "Retry Payment Verification"
                    )}
                  </button>
                ) : (

                  /* PLACE ORDER / RETRY PAYMENT */

                  <button
                    type="button"
                    onClick={
                      pendingOnlineOrderId
                        ? handleRetryPayment
                        : handlePlaceOrder
                    }
                    disabled={
                      isProcessing ||
                      (!pendingOnlineOrderId &&
                        (addressLoading ||
                          !selectedAddress ||
                          checkoutItems.length === 0 ||
                          checkoutLoading))
                    }
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0645C4] hover:shadow-lg hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw
                          size={17}
                          className="animate-spin"
                        />
                        Please wait...
                      </>
                    ) : pendingOnlineOrderId ? (
                      <>
                        Retry Online Payment
                        <ArrowRight size={17} />
                      </>
                    ) : (
                      <>
                        Place Order
                        <ArrowRight
                          size={17}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>
                )}

                {/* Secure Message */}

                <div className="mt-4 flex items-center justify-center gap-2">
                  <LockKeyhole
                    size={13}
                    className="text-[#0755E9]"
                  />

                  <p className="text-center text-[11px] leading-5 text-[#64748B]">
                    Your order and payment will be validated
                    securely by MOBI HUB.
                  </p>
                </div>
              </div>

              {/* SECURITY INFORMATION */}

              <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#EFF6FF] p-4">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-[#0755E9]"
                />

                <div>
                  <p className="text-xs font-bold text-[#101828]">
                    Safe & Secure Checkout
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#64748B]">
                    Your payment details are processed securely.
                  </p>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </div>
    </main>
  );
}