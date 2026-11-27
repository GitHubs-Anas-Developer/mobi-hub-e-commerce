"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
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

import addressService from "@/services/addressService";
import couponService from "@/services/couponService";
import orderService from "@/services/orderService";
import paymentService from "@/services/paymentService";
import productService from "@/services/productService";

import { useAuth } from "@/hooks/useAuth";
import { fetchCart } from "@/store/thunks/cartThunks";

import Breadcrumb from "@/components/common/Breadcrumb";
import CheckoutProgress from "./CheckoutProgress";
import ContactInfoCard from "./ContactInfoCard";
import DeliveryAddress from "./DeliveryAddress";
import PaymentMethod from "./PaymentMethod";
import OrderSummary from "./OrderSummary";
import CheckoutSkeleton from "../loading/skeletons/CheckoutSkeleton";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

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

export const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

export const getCartItemDetails = (item) => {
  const product = item.product || item.productId || {};

  const variantId =
    typeof item.variantId === "object" ? item.variantId?._id : item.variantId;

  const variant =
    (typeof item.variantId === "object" && item.variantId) ||
    product.variants?.find((v) => String(v._id) === String(variantId)) ||
    product.variants?.find((v) => v.isDefault) ||
    product.variants?.[0] ||
    {};

  return {
    product,
    variant,
    sellingPrice: Number(
      variant.sellingPrice ?? item.sellingPrice ?? product.basePrice ?? 0
    ),
    mrp: Number(variant.mrp ?? item.mrp ?? product.basePrice ?? 0),
    quantity: Number(item.quantity || 0),
  };
};

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
      existingScript.addEventListener("error", () => resolve(false), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CheckoutContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const isDirectCheckout = searchParams.get("mode") === "direct";
  const directProductId = searchParams.get("productId") || "";
  const directVariantId = searchParams.get("variantId") || "";
  const directSlug = searchParams.get("slug") || "";
  const directQuantity = Number(searchParams.get("quantity") || 0);

  const {
    items: cartItems = [],
    isLoading: cartLoading,
    error: cartError,
  } = useSelector((state) => state.cart);

  // Direct Checkout Product
  const [directProduct, setDirectProduct] = useState(null);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState("");
  const [directRetryKey, setDirectRetryKey] = useState(0);

  const directVariant = directProduct?.variants?.find(
    (variant) => String(variant._id) === String(directVariantId)
  );

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormMode, setAddressFormMode] = useState("create");
  const [editingAddressId, setEditingAddressId] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState("");
  const [addressForm, setAddressForm] = useState(initialAddressForm);

  // Payment State
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("razorpay");

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Order & Razorpay States
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingOnlineOrderId, setPendingOnlineOrderId] = useState(null);
  const [pendingVerificationData, setPendingVerificationData] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    if (!isDirectCheckout) {
      dispatch(fetchCart());
    }
  }, [dispatch, isDirectCheckout]);

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
        const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(value);

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

        const response = await productService.getProductBySlug(directSlug);
        const product =
          response?.data?.data ||
          response?.data ||
          response?.product ||
          response;

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
      } catch (err) {
        if (isMounted) {
          setDirectProduct(null);
          setDirectError(
            err?.response?.data?.message ||
              err?.message ||
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

  const fetchAddresses = useCallback(async () => {
    try {
      setAddressLoading(true);
      setAddressError("");

      const response = await addressService.getAddresses();
      const addressList = Array.isArray(response?.data)
        ? response.data
        : response?.data?.addresses || [];

      setAddresses(addressList);

      const defaultAddress = addressList.find((address) => address.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress._id);
      } else if (addressList.length > 0) {
        setSelectedAddress(addressList[0]._id);
      } else {
        setSelectedAddress("");
      }
    } catch (err) {
      setAddressError(
        err?.response?.data?.message || "Unable to load delivery addresses."
      );
    } finally {
      setAddressLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

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

  const checkoutLoading = isDirectCheckout ? directLoading : cartLoading;
  const checkoutLoadError = isDirectCheckout ? directError : cartError;

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

  const selectedAddressDetails = addresses.find(
    (addr) => String(addr._id) === String(selectedAddress)
  );

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAddressForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOpenCreateAddress = () => {
    setAddressError("");
    setAddressFormMode("create");
    setEditingAddressId("");
    setAddressForm({
      ...initialAddressForm,
      fullName: user?.name || "",
      phone: user?.phone || "",
    });
    setShowAddressForm(true);
  };

  const handleOpenEditAddress = (address) => {
    if (!address?._id) return;
    setAddressError("");
    setAddressFormMode("edit");
    setEditingAddressId(address._id);
    setAddressForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      alternatePhone: address.alternatePhone || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "India",
      addressType: address.addressType || "Home",
      isDefault: Boolean(address.isDefault),
    });
    setShowAddressForm(true);
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setAddressFormMode("create");
    setEditingAddressId("");
    setAddressForm({ ...initialAddressForm });
    setAddressError("");
  };

  const handleSubmitAddress = async (event) => {
    event.preventDefault();

    try {
      setSavingAddress(true);
      setAddressError("");

      if (addressFormMode === "edit" && editingAddressId) {
        const response = await addressService.updateAddress(
          editingAddressId,
          addressForm
        );
        const updated = response?.data?.address || response?.data;

        if (!updated?._id) {
          throw new Error("Invalid address response from server.");
        }

        setAddresses((previous) =>
          previous.map((item) => {
            if (String(item._id) === String(updated._id)) return updated;
            return addressForm.isDefault ? { ...item, isDefault: false } : item;
          })
        );

        toast.success("Delivery address updated.");
      } else {
        const response = await addressService.createAddress(addressForm);
        const newAddress = response?.data?.address || response?.data;

        if (!newAddress?._id) {
          throw new Error("Invalid address response from server.");
        }

        setAddresses((previous) => {
          const base = addressForm.isDefault
            ? previous.map((a) => ({ ...a, isDefault: false }))
            : previous;
          return [...base, newAddress];
        });

        setSelectedAddress(newAddress._id);
        toast.success("Delivery address added.");
      }

      handleCancelAddressForm();
    } catch (err) {
      setAddressError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save delivery address."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!addressId || deletingAddressId) return;

    try {
      setDeletingAddressId(addressId);
      setAddressError("");

      await addressService.deleteAddress(addressId);

      const remaining = addresses.filter(
        (addr) => String(addr._id) !== String(addressId)
      );
      setAddresses(remaining);

      if (String(selectedAddress) === String(addressId)) {
        const nextDefault =
          remaining.find((addr) => addr.isDefault) || remaining[0];
        setSelectedAddress(nextDefault?._id || "");
      }

      if (String(editingAddressId) === String(addressId)) {
        handleCancelAddressForm();
      }

      toast.success("Address deleted.");
    } catch (err) {
      setAddressError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete address."
      );
    } finally {
      setDeletingAddressId("");
    }
  };

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

      const response = await couponService.applyCoupon(code);
      const couponData = response?.data || response;

      if (
        !couponData?.coupon ||
        typeof couponData.discountAmount !== "number" ||
        typeof couponData.finalAmount !== "number"
      ) {
        throw new Error("Invalid coupon response from server.");
      }

      setAppliedCoupon(couponData);
      setCouponCode(couponData.coupon.code);
      setCouponSuccess(`Coupon ${couponData.coupon.code} applied successfully!`);
      toast.success(`Coupon ${couponData.coupon.code} applied!`);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponSuccess("");
      setCouponError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to apply coupon. Please try again."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setCouponSuccess("");
  };

  const verifyRazorpayPayment = async (paymentData, orderId) => {
    try {
      setIsProcessing(true);
      setCheckoutError("");

      const response = await paymentService.verifyPayment(paymentData);

      if (!response?.success) {
        throw new Error(response?.message || "Payment verification failed.");
      }

      setPendingOnlineOrderId(null);
      setPendingVerificationData(null);
      router.replace(`/order-success/${orderId}`);
    } catch (err) {
      setPendingVerificationData({ paymentData, orderId });
      setCheckoutError(
        err?.response?.data?.message ||
          err?.message ||
          "Payment verification failed. Please retry verification."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const openRazorpayCheckout = async (paymentData, orderId) => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded || !window.Razorpay) {
      throw new Error("Unable to load Razorpay checkout. Please try again.");
    }

    const options = {
      key: paymentData.keyId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: "ELENZO",
      description: "ELENZO Order Payment",
      order_id: paymentData.razorpayOrderId,
      handler: async (response) => {
        const verificationData = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        };
        await verifyRazorpayPayment(verificationData, orderId);
      },
      modal: {
        ondismiss: () => {
          setIsProcessing(false);
          setCheckoutError(
            "Payment window closed. Your order is saved as pending payment. Click Retry Online Payment to complete it."
          );
        },
      },
      theme: { color: "#0755E9" },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", (response) => {
      setIsProcessing(false);
      setCheckoutError(
        response?.error?.description ||
          "Payment failed. Click Retry Online Payment to try again."
      );
    });
    razorpay.open();
  };

  const handleRetryPayment = async () => {
    if (!pendingOnlineOrderId || isProcessing) return;

    try {
      setIsProcessing(true);
      setCheckoutError("");

      const response = await paymentService.initiatePayment(
        pendingOnlineOrderId
      );

      if (!response?.success || !response?.data?.razorpayOrderId) {
        throw new Error(response?.message || "Unable to initiate payment.");
      }

      await openRazorpayCheckout(response.data, pendingOnlineOrderId);
    } catch (err) {
      setCheckoutError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to retry payment."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryVerification = async () => {
    if (!pendingVerificationData || isProcessing) return;

    await verifyRazorpayPayment(
      pendingVerificationData.paymentData,
      pendingVerificationData.orderId
    );
  };

  const handlePlaceOrder = async () => {
    if (isProcessing) return;

    if (!selectedAddress) {
      setCheckoutError("Please select a delivery address before placing your order.");
      return;
    }

    if (addressLoading) {
      setCheckoutError("Please wait while delivery addresses load.");
      return;
    }

    if (checkoutItems.length === 0) {
      setCheckoutError(
        isDirectCheckout
          ? "The selected product is unavailable. Please return and try again."
          : "Your cart is empty."
      );
      return;
    }

    if (isDirectCheckout && (!directProduct || !directVariant)) {
      setCheckoutError("Unable to verify the selected product.");
      return;
    }

    try {
      setIsProcessing(true);
      setCheckoutError("");

      const paymentMethod =
        selectedPaymentMethod === "razorpay" ? "Online" : "COD";

      const orderPayload = {
        addressId: selectedAddress,
        paymentMethod,
      };

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
        orderPayload.couponCode = appliedCoupon.coupon.code;
      }

      const orderResponse = await orderService.createOrder(orderPayload);
      const order = orderResponse?.data?.data || orderResponse?.data;

      if (!order?._id) {
        throw new Error("Unable to create order.");
      }

      if (paymentMethod === "COD") {
        router.replace(`/order-success/${order._id}`);
        return;
      }

      setPendingOnlineOrderId(order._id);

      const paymentResponse = await paymentService.initiatePayment(order._id);

      if (!paymentResponse?.success || !paymentResponse?.data?.razorpayOrderId) {
        throw new Error(
          paymentResponse?.message || "Unable to initiate online payment."
        );
      }

      await openRazorpayCheckout(paymentResponse.data, order._id);
    } catch (err) {
      setCheckoutError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const isActionDisabled =
    isProcessing ||
    (!pendingOnlineOrderId &&
      (addressLoading ||
        !selectedAddress ||
        checkoutItems.length === 0 ||
        checkoutLoading));

  const handlePrimaryAction = () => {
    if (pendingVerificationData) return handleRetryVerification();
    if (pendingOnlineOrderId) return handleRetryPayment();
    return handlePlaceOrder();
  };

  const primaryButtonText = isProcessing
    ? pendingVerificationData
      ? "Verifying Payment..."
      : "Processing..."
    : pendingVerificationData
      ? "Retry Payment Verification"
      : pendingOnlineOrderId
        ? "Retry Online Payment"
        : selectedPaymentMethod === "cod"
          ? `Place COD Order · ${formatPrice(totalAmount)}`
          : `Pay Securely · ${formatPrice(totalAmount)}`;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-28 lg:pb-10">
      <div className="mx-auto w-full max-w-[1240px] px-3 py-3 sm:px-5 sm:py-5 lg:px-7">
        {/* Top Breadcrumb + Title Header */}
        <Breadcrumb
          items={[
            isDirectCheckout && directSlug
              ? { label: "Product", href: `/products/${directSlug}` }
              : { label: "Shopping Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
          className="mb-3"
        />

        <header className="mb-4 flex flex-col gap-2.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#101828] sm:text-xl">
              Secure Checkout
            </h1>
            <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-[#64748B] sm:text-[13px]">
              Confirm your delivery address and payment method to complete your ELENZO order.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#101828]">
              <ShieldCheck size={14} className="text-[#0755E9]" aria-hidden="true" />
              <span>SSL Encrypted Checkout</span>
            </span>

            <Link
              href={
                isDirectCheckout && directSlug
                  ? `/products/${directSlug}`
                  : "/cart"
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:text-[#0755E9]"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              <span>{isDirectCheckout ? "Back to Product" : "Back to Cart"}</span>
            </Link>
          </div>
        </header>

        {checkoutLoading ? (
          <CheckoutSkeleton isDirectCheckout={isDirectCheckout} />
        ) : checkoutLoadError ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-white px-6 py-14 text-center"
          >
            <AlertCircle
              size={34}
              className="mx-auto text-red-500"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-bold text-[#101828]">
              Unable to prepare checkout
            </h2>
            <p className="mt-2 text-sm text-[#64748B]">{checkoutLoadError}</p>
            <button
              type="button"
              onClick={() => {
                if (isDirectCheckout) {
                  setDirectRetryKey((v) => v + 1);
                } else {
                  dispatch(fetchCart());
                }
              }}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-sm font-bold text-white transition hover:bg-[#0645C4]"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        ) : checkoutItems.length === 0 && !pendingOnlineOrderId ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#0755E9]/15 bg-[#EFF6FF] text-[#0755E9]">
              <ShoppingBag size={28} aria-hidden="true" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#101828]">
              {isDirectCheckout
                ? "Product unavailable for checkout"
                : "Your cart is empty"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-[#64748B]">
              {isDirectCheckout
                ? "The selected product could not be verified. Please return to the product page and try again."
                : "Add items to your cart before proceeding to checkout."}
            </p>

            <Link
              href={
                isDirectCheckout && directSlug
                  ? `/products/${directSlug}`
                  : "/products"
              }
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#0755E9] px-6 text-sm font-bold text-white transition hover:bg-[#0645C4]"
            >
              <span>
                {isDirectCheckout ? "Back to Product" : "Browse Products"}
              </span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            {/* 4-Step Progress Indicator */}
            <CheckoutProgress
              hasSelectedAddress={Boolean(selectedAddress)}
              isPendingPayment={Boolean(pendingOnlineOrderId)}
              isDirectCheckout={isDirectCheckout}
              directSlug={directSlug}
            />

            {/* Two-Column Checkout Grid */}
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-5">
              {/* Left Column: Contact + Address + Payment */}
              <div className="space-y-4 lg:col-span-7">
                {!pendingOnlineOrderId && (
                  <>
                    <ContactInfoCard
                      user={user}
                      selectedAddressDetails={selectedAddressDetails}
                    />

                    <DeliveryAddress
                      addresses={addresses}
                      selectedAddress={selectedAddress}
                      onSelectAddress={setSelectedAddress}
                      addressLoading={addressLoading}
                      addressError={addressError}
                      onRetryAddresses={fetchAddresses}
                      showAddressForm={showAddressForm}
                      addressFormMode={addressFormMode}
                      onOpenAddressForm={handleOpenCreateAddress}
                      onEditAddress={handleOpenEditAddress}
                      onDeleteAddress={handleDeleteAddress}
                      deletingAddressId={deletingAddressId}
                      onCancelAddressForm={handleCancelAddressForm}
                      addressForm={addressForm}
                      onAddressChange={handleAddressChange}
                      onSubmitAddress={handleSubmitAddress}
                      savingAddress={savingAddress}
                    />

                    <PaymentMethod
                      selectedPaymentMethod={selectedPaymentMethod}
                      onSelectPaymentMethod={setSelectedPaymentMethod}
                      disabled={isProcessing}
                    />
                  </>
                )}

                {/* Pending Online Order Retry Info */}
                {pendingOnlineOrderId && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600">
                        <CreditCard size={20} aria-hidden="true" />
                      </div>

                      <div>
                        <h2 className="text-base font-bold text-amber-900">
                          Online payment pending confirmation
                        </h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-amber-800">
                          Your order has already been created safely. You do not need to recreate the order—use the button in the summary to retry payment or verification.
                        </p>
                        <p className="mt-3 break-all text-xs font-bold text-amber-900">
                          Order ID: {pendingOnlineOrderId}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Checkout Error Alert */}
                {checkoutError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 sm:text-sm"
                  >
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-red-500"
                      aria-hidden="true"
                    />
                    <p>{checkoutError}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Sticky Order Summary + Place Order Card */}
              <div className="space-y-3 lg:sticky lg:top-20 lg:col-span-5">
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

                {/* Place Order / Payment Retry Box */}
                <div className="rounded-xl border border-[#E2E8F0] bg-white p-3.5 sm:p-4">
                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    disabled={isActionDisabled}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#0645C4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {isProcessing ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <LockKeyhole size={15} aria-hidden="true" />
                    )}
                    <span>{primaryButtonText}</span>
                    {!isProcessing && <ArrowRight size={16} aria-hidden="true" />}
                  </button>

                  {!pendingOnlineOrderId && !selectedAddress && !addressLoading && (
                    <p className="mt-2.5 text-center text-xs font-semibold text-amber-700">
                      Please select or add a delivery address to place your order.
                    </p>
                  )}

                  <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#64748B]">
                    <ShieldCheck
                      size={13}
                      className="text-[#0755E9]"
                      aria-hidden="true"
                    />
                    <span>
                      Validated securely by ELENZO before confirmation
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Sticky Checkout CTA Bar (BottomNavigation is hidden on /checkout) */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8F0] bg-white/95 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-6px_20px_rgba(16,24,40,0.08)] backdrop-blur-md lg:hidden">
              <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    {selectedPaymentMethod === "cod" ? "COD Total" : "Payable"}
                  </p>
                  <p className="truncate text-lg font-extrabold text-[#101828] tabular-nums">
                    {formatPrice(totalAmount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  disabled={isActionDisabled}
                  className="inline-flex h-11 flex-1 max-w-[230px] items-center justify-center gap-1.5 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-[#0645C4] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {isProcessing ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <LockKeyhole size={14} aria-hidden="true" />
                  )}
                  <span className="truncate">
                    {isProcessing
                      ? "Processing..."
                      : pendingVerificationData
                        ? "Retry Verification"
                        : pendingOnlineOrderId
                          ? "Retry Payment"
                          : "Place Order"}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
