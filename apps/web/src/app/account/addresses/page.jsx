"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";

import {
  ArrowLeft,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Home,
  Briefcase,
  MapPinned,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import addressService from "@/services/addressService";
import AddressForm from "@/components/checkout/AddressForm";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const initialForm = {
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

// Animation variants
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30,
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

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const addressCardVariants = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.97,
    transition: {
      duration: 0.2,
    },
  },
};

function AddressPageContent() {
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [defaultLoadingId, setDefaultLoadingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Smooth scroll progress
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Fetch Addresses
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await addressService.getAddresses();

      const addressList =
        response?.data?.addresses ||
        response?.data?.data ||
        response?.addresses ||
        response?.data ||
        [];

      setAddresses(Array.isArray(addressList) ? addressList : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load addresses. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Reset Form
  const resetForm = () => {
    setAddressForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  // Add Address
  const handleAddAddress = () => {
    setAddressForm(initialForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  // Edit Address
  const handleEditAddress = (address) => {
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

    setEditingId(address._id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  // Form Change
  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setAddressForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save Address
  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...addressForm,
        fullName: addressForm.fullName.trim(),
        phone: addressForm.phone.trim(),
        alternatePhone: addressForm.alternatePhone.trim(),
        addressLine1: addressForm.addressLine1.trim(),
        addressLine2: addressForm.addressLine2.trim(),
        landmark: addressForm.landmark.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.trim(),
        country: addressForm.country.trim(),
      };

      if (editingId) {
        await addressService.updateAddress(editingId, payload);
        setSuccess("Address updated successfully.");
      } else {
        await addressService.createAddress(payload);
        setSuccess("Address added successfully.");
      }

      resetForm();
      await fetchAddresses();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save address. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Set Default Address
  const handleSetDefault = async (addressId) => {
    setDefaultLoadingId(addressId);
    setError("");
    setSuccess("");

    try {
      await addressService.setDefaultAddress(addressId);

      setSuccess("Default address updated successfully.");
      await fetchAddresses();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update default address.",
      );
    } finally {
      setDefaultLoadingId(null);
    }
  };

  // Delete Address
  const handleDelete = async (address) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the address for ${address.fullName}?`,
    );

    if (!confirmed) return;

    setDeletingId(address._id);
    setError("");
    setSuccess("");

    try {
      await addressService.deleteAddress(address._id);

      setSuccess("Address deleted successfully.");
      await fetchAddresses();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete address. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Address Icon
  const getAddressIcon = (type) => {
    if (type === "Work") return Briefcase;
    if (type === "Home") return Home;
    return MapPinned;
  };

  // Full Address
  const getFullAddress = (address) =>
    [
      address.addressLine1,
      address.addressLine2,
      address.landmark,
      address.city,
      address.state,
      address.pincode,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");

  return (
    <main className="min-h-screen overflow-hidden bg-white px-4 py-8 sm:px-6 lg:px-8">
      {/* Blue Scroll Progress */}
      <motion.div
        className="fixed left-0 top-0 z-[100] h-1 w-full origin-left bg-gradient-to-r from-[#0755E9] via-[#2583FF] to-cyan-400"
        style={{ scaleX: smoothProgress }}
      />

      <div className="mx-auto w-full">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-8"
        >
          <motion.div variants={fadeUp}>
            <Link
              href="/account"
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Back to My Account
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
          >
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-8 rounded-full bg-blue-600" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  My Account
                </span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl lg:text-4xl">
                My Addresses
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage your saved delivery addresses.
              </p>
            </div>

            {!showForm && (
              <motion.button
                type="button"
                onClick={handleAddAddress}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-[#0645C4]"
              >
                <Plus size={18} />
                Add New Address
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              role="alert"
              className="mb-5 flex items-start justify-between gap-3 overflow-hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span className="flex items-center gap-2">
                <AlertCircle size={17} className="shrink-0" />
                {error}
              </span>

              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              role="status"
              className="mb-5 flex items-start justify-between gap-3 overflow-hidden rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="shrink-0" />
                {success}
              </span>

              <button
                type="button"
                onClick={() => setSuccess("")}
                aria-label="Dismiss success message"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Address Form */}
        <AnimatePresence>
          {showForm && (
            <motion.section
              key="address-form"
              initial={{ opacity: 0, y: 35, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mb-7 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    {editingId ? <Pencil size={21} /> : <MapPin size={21} />}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {editingId ? "Edit Address" : "Add New Address"}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Enter your delivery details below.
                    </p>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close address form"
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="p-5 sm:p-6"
              >
                <AddressForm
                  addressForm={addressForm}
                  onChange={handleFormChange}
                  onSubmit={handleSubmit}
                  onCancel={resetForm}
                  saving={saving}
                />
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Address List */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeUp}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Saved Addresses
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your saved delivery locations.
              </p>
            </div>

            <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
              {addresses.length}{" "}
              {addresses.length === 1 ? "Address" : "Addresses"}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {/* Loading State */}
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
                >
                  <RefreshCw size={23} />
                </motion.div>

                <p className="mt-4 text-sm font-semibold text-slate-600">
                  Loading addresses...
                </p>
              </motion.div>
            ) : addresses.length === 0 ? (
              /* Empty State */
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center shadow-sm"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600"
                >
                  <MapPin size={34} />
                </motion.div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  No saved addresses
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Add a delivery address to make your next checkout faster.
                </p>

                {!showForm && (
                  <motion.button
                    type="button"
                    onClick={handleAddAddress}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-[#0645C4]"
                  >
                    <Plus size={17} />
                    Add Your First Address
                  </motion.button>
                )}
              </motion.div>
            ) : (
              /* Saved Address Cards */
              <motion.div
                key="address-list"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-5 md:grid-cols-2"
              >
                {addresses.map((address) => {
                  const AddressIcon = getAddressIcon(address.addressType);

                  return (
                    <motion.article
                      key={address._id}
                      layout
                      variants={addressCardVariants}
                      whileHover={{
                        y: -5,
                        boxShadow: "0px 14px 35px rgba(7,85,233,0.08)",
                        borderColor: "#BFDBFE",
                      }}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors sm:p-6"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <motion.div
                            whileHover={{ rotate: -8, scale: 1.08 }}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
                          >
                            <AddressIcon size={22} />
                          </motion.div>

                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-slate-900">
                              {address.fullName}
                            </h3>

                            <p className="mt-1 text-xs font-medium text-slate-500">
                              {address.addressType || "Other"}
                            </p>
                          </div>
                        </div>

                        {address.isDefault && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                          >
                            <Star size={12} fill="currentColor" />
                            Default
                          </motion.span>
                        )}
                      </div>

                      {/* Address Details */}
                      <div className="mt-5 space-y-3 text-sm text-slate-600">
                        <div className="flex items-start gap-2">
                          <MapPin
                            size={16}
                            className="mt-1 shrink-0 text-blue-500"
                          />

                          <p className="break-words leading-6">
                            {getFullAddress(address)}
                          </p>
                        </div>

                        <p>
                          <span className="font-semibold text-slate-800">
                            Phone:
                          </span>{" "}
                          {address.phone}
                        </p>

                        {address.alternatePhone && (
                          <p>
                            <span className="font-semibold text-slate-800">
                              Alternate:
                            </span>{" "}
                            {address.alternatePhone}
                          </p>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                        {!address.isDefault && (
                          <motion.button
                            type="button"
                            onClick={() => handleSetDefault(address._id)}
                            disabled={defaultLoadingId === address._id}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                          >
                            <Star size={14} />
                            {defaultLoadingId === address._id
                              ? "Updating..."
                              : "Set Default"}
                          </motion.button>
                        )}

                        <motion.button
                          type="button"
                          onClick={() => handleEditAddress(address)}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={14} />
                          Edit
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={() => handleDelete(address)}
                          disabled={deletingId === address._id}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={14} />

                          {deletingId === address._id
                            ? "Deleting..."
                            : "Delete"}
                        </motion.button>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>
    </main>
  );
}

export default function AddressesPage() {
  return (
    <ProtectedRoute>
      <AddressPageContent />
    </ProtectedRoute>
  );
}
