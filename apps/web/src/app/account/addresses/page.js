"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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

  const resetForm = () => {
    setAddressForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddAddress = () => {
    setAddressForm(initialForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

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

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setAddressForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  const getAddressIcon = (type) => {
    if (type === "Work") return Briefcase;
    if (type === "Home") return Home;
    return MapPinned;
  };

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
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to My Account
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                My Addresses
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage your saved delivery addresses.
              </p>
            </div>

            {!showForm && (
              <button
                type="button"
                onClick={handleAddAddress}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Add New Address
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            <span>{success}</span>
            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Address Form */}
        {showForm && (
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingId ? "Edit Address" : "Add New Address"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your delivery details below.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                aria-label="Close address form"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <AddressForm
              addressForm={addressForm}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              saving={saving}
            />
          </section>
        )}

        {/* Address List */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Saved Addresses
            </h2>

            <span className="text-sm text-slate-500">
              {addresses.length}{" "}
              {addresses.length === 1 ? "Address" : "Addresses"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="mt-4 text-sm text-slate-500">
                Loading addresses...
              </p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <MapPin size={26} />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No saved addresses
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                Add a delivery address to make your next checkout faster.
              </p>

              {!showForm && (
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus size={17} />
                  Add Your First Address
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {addresses.map((address) => {
                const AddressIcon = getAddressIcon(address.addressType);

                return (
                  <article
                    key={address._id}
                    className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <AddressIcon size={21} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-slate-900">
                            {address.fullName}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {address.addressType || "Other"}
                          </p>
                        </div>
                      </div>

                      {address.isDefault && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          <Star size={12} />
                          Default
                        </span>
                      )}
                    </div>

                    <div className="mt-5 space-y-2 text-sm text-slate-600">
                      <p className="break-words leading-6">
                        {getFullAddress(address)}
                      </p>

                      <p>
                        <span className="font-medium text-slate-800">
                          Phone:
                        </span>{" "}
                        {address.phone}
                      </p>

                      {address.alternatePhone && (
                        <p>
                          <span className="font-medium text-slate-800">
                            Alternate:
                          </span>{" "}
                          {address.alternatePhone}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(address._id)}
                          disabled={defaultLoadingId === address._id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
                        >
                          <Star size={14} />
                          {defaultLoadingId === address._id
                            ? "Updating..."
                            : "Set Default"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleEditAddress(address)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(address)}
                        disabled={deletingId === address._id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        {deletingId === address._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AddressesPage() {
  return (
    <ProtectedRoute>
      <AddressPageContent />
    </ProtectedRoute>
  );
}
