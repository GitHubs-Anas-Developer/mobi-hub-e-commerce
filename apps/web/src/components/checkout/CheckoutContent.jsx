
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";

import addressService from "@/services/addressService";
import couponService from "@/services/couponService";
import orderService from "@/services/orderService";
import paymentService from "@/services/paymentService";

import { fetchCart } from "@/store/thunks/cartThunks";

import DeliveryAddress from "./DeliveryAddress";
import PaymentMethod from "./PaymentMethod";
import OrderSummary from "./OrderSummary";

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

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
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

// Get product and variant details from cart item
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

// Load Razorpay checkout script
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

export default function CheckoutContent() {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    items: cartItems = [],
    isLoading: cartLoading,
    error: cartError,
  } = useSelector((state) => state.cart);

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState(initialAddressForm);

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("razorpay");

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Order and payment states
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingOnlineOrderId, setPendingOnlineOrderId] =
    useState(null);
  const [pendingVerificationData, setPendingVerificationData] =
    useState(null);
  const [checkoutError, setCheckoutError] = useState("");

  // Fetch cart
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Fetch addresses
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

  // Cart calculations
  const subtotal = cartItems.reduce((total, item) => {
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

  const totalItems = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  // Address form change
  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;

    setAddressForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Add new address
  const handleAddAddress = async (event) => {
    event.preventDefault();

    try {
      setSavingAddress(true);
      setAddressError("");

      const response = await addressService.createAddress(addressForm);

      const newAddress =
        response.data?.address || response.data;

      if (!newAddress?._id) {
        throw new Error("Invalid address response from server.");
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

  // Apply coupon
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
      const couponData = response.data || response;

      if (
        !couponData.coupon ||
        typeof couponData.discountAmount !== "number" ||
        typeof couponData.finalAmount !== "number"
      ) {
        throw new Error("Invalid coupon response from server.");
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

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setCouponSuccess("");
  };

  // Verify Razorpay payment
  const verifyRazorpayPayment = async (paymentData, orderId) => {
    try {
      setIsProcessing(true);
      setCheckoutError("");

      const response = await paymentService.verifyPayment(paymentData);

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

  // Open Razorpay checkout
  const openRazorpayCheckout = async (paymentData, orderId) => {
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
        color: "#1D4ED8",
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
  };

  // Initiate payment for an existing online order
  const handleRetryPayment = async () => {
    if (!pendingOnlineOrderId || isProcessing) return;

    try {
      setIsProcessing(true);
      setCheckoutError("");

      const response = await paymentService.initiatePayment(
        pendingOnlineOrderId
      );

      if (!response.success || !response.data?.razorpayOrderId) {
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

  // Retry payment verification
  const handleRetryVerification = async () => {
    if (!pendingVerificationData || isProcessing) return;

    await verifyRazorpayPayment(
      pendingVerificationData.paymentData,
      pendingVerificationData.orderId
    );
  };

  // Place new order
  const handlePlaceOrder = async () => {
    if (isProcessing) return;

    if (!selectedAddress) {
      setCheckoutError("Please select a delivery address.");
      return;
    }

    if (addressLoading) {
      setCheckoutError(
        "Please wait while delivery addresses are loading."
      );
      return;
    }

    if (cartItems.length === 0) {
      setCheckoutError("Your cart is empty.");
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

      if (appliedCoupon?.coupon?.code) {
        orderPayload.couponCode = appliedCoupon.coupon.code;
      }

      // Create order
      const orderResponse = await orderService.createOrder(
        orderPayload
      );

      const order =
        orderResponse.data?.data || orderResponse.data;

      if (!order?._id) {
        throw new Error("Unable to create order.");
      }

      // COD flow
      if (paymentMethod === "COD") {
        router.replace(`/order-success/${order._id}`);
        return;
      }

      // Keep the created order ID for payment retry
      setPendingOnlineOrderId(order._id);

      // Initiate Razorpay payment
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
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Complete your order securely.
          </p>
        </div>

        {/* Cart Loading */}
        {cartLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-500">
              Loading your cart...
            </p>
          </div>
        ) : cartError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">
              {cartError}
            </p>

            <button
              type="button"
              onClick={() => dispatch(fetchCart())}
              className="mt-4 font-semibold text-blue-600 hover:text-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : cartItems.length === 0 && !pendingOnlineOrderId ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add some products before proceeding to checkout.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">

            {/* Left Section */}
            <section className="space-y-6 lg:col-span-2">

              {/* Delivery Address */}
              {!pendingOnlineOrderId && (
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
                    setAddressForm({ ...initialAddressForm });
                    setAddressError("");
                  }}
                  addressForm={addressForm}
                  onAddressChange={handleAddressChange}
                  onAddAddress={handleAddAddress}
                  savingAddress={savingAddress}
                />
              )}

              {/* Payment Method */}
              {!pendingOnlineOrderId && (
                <PaymentMethod
                  selectedPaymentMethod={selectedPaymentMethod}
                  onSelectPaymentMethod={setSelectedPaymentMethod}
                  disabled={isProcessing}
                />
              )}

              {/* Checkout Error */}
              {checkoutError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {checkoutError}
                </div>
              )}

              {/* Payment Retry Information */}
              {pendingOnlineOrderId && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <h2 className="font-semibold text-amber-900">
                    Online payment is pending
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-amber-800">
                    Your order has already been created. You do not
                    need to place another order. Continue with the
                    existing order's payment.
                  </p>

                  <p className="mt-3 text-xs text-amber-800">
                    Order ID: {pendingOnlineOrderId}
                  </p>
                </div>
              )}

            </section>

            {/* Right Section */}
            <div className="space-y-5">
              {!pendingOnlineOrderId && (
                <OrderSummary
                  cartItems={cartItems}
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

              {/* Place Order / Retry Payment */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                {pendingVerificationData ? (
                  <button
                    type="button"
                    onClick={handleRetryVerification}
                    disabled={isProcessing}
                    className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isProcessing
                      ? "Verifying Payment..."
                      : "Retry Payment Verification"}
                  </button>
                ) : (
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
                          cartItems.length === 0))
                    }
                    className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isProcessing
                      ? "Please wait..."
                      : pendingOnlineOrderId
                        ? "Retry Online Payment"
                        : "Place Order"}
                  </button>
                )}

                <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                  Your order and payment will be validated securely
                  by MOBI HUB.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
