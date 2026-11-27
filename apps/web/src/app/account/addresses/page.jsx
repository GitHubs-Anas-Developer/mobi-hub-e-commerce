"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Home,
  Briefcase,
  MapPinned,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountShell from "@/components/account/AccountShell";
import addressService from "@/services/addressService";
import AddressForm from "@/components/checkout/AddressForm";

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
  const [confirmDeleteId, setConfirmDeleteId] = useState("");
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
      const list =
        response?.data?.addresses ||
        response?.data?.data ||
        response?.addresses ||
        response?.data ||
        [];

      setAddresses(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load addresses. Please try again."
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
        toast.success("Address updated.");
      } else {
        await addressService.createAddress(payload);
        setSuccess("Address added successfully.");
        toast.success("Address added.");
      }

      resetForm();
      await fetchAddresses();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to save address. Please check details and try again."
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
      setSuccess("Default address updated.");
      toast.success("Default address updated.");
      await fetchAddresses();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to set default address."
      );
    } finally {
      setDefaultLoadingId(null);
    }
  };

  const handleDelete = async (address) => {
    setDeletingId(address._id);
    setConfirmDeleteId("");
    setError("");
    setSuccess("");

    try {
      await addressService.deleteAddress(address._id);
      setSuccess("Address deleted successfully.");
      toast.success("Address deleted.");
      await fetchAddresses();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to delete address."
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

  return (
    <AccountShell
      activeSection="addresses"
      breadcrumbLabel="Address Book"
      title="Address Book"
      description="Manage saved shipping addresses for faster ELENZO checkouts."
      headerRight={
        !showForm ? (
          <button
            type="button"
            onClick={handleAddAddress}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-[#0645C4] sm:text-sm"
          >
            <Plus size={16} aria-hidden="true" />
            <span>Add New Address</span>
          </button>
        ) : null
      }
    >
      <div className="space-y-5">
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 sm:text-sm"
          >
            <span className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </span>
            <button
              type="button"
              onClick={fetchAddresses}
              className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-red-700 shadow-xs hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 sm:text-sm"
          >
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {showForm && (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-6">
            <AddressForm
              mode={editingId ? "edit" : "create"}
              addressForm={addressForm}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              saving={saving}
            />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-[#E2E8F0] bg-white p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-20 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-slate-200" />
                  <div className="h-3 w-3/4 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#0755E9]/15 bg-[#EFF6FF] text-[#0755E9]">
              <MapPin size={26} aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#101828]">
              No saved addresses yet
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-[#64748B] sm:text-sm">
              Add a delivery address to speed up your future ELENZO checkouts.
            </p>
            <button
              type="button"
              onClick={handleAddAddress}
              className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white transition hover:bg-[#0645C4]"
            >
              <Plus size={15} />
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {addresses.map((address) => {
              const AddressIcon = getAddressIcon(address.addressType);
              const isConfirming = confirmDeleteId === address._id;

              return (
                <article
                  key={address._id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
                    address.isDefault
                      ? "border-[#0755E9]/45 bg-[#EFF6FF]/40"
                      : "border-[#E2E8F0] bg-white hover:border-[#0755E9]/35"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
                          <AddressIcon size={18} aria-hidden="true" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-[#101828] sm:text-base">
                            {address.fullName}
                          </h3>
                          <span className="text-xs font-semibold text-[#64748B]">
                            {address.addressType || "Other"}
                          </span>
                        </div>
                      </div>

                      {address.isDefault && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                          <Star size={11} fill="currentColor" aria-hidden="true" />
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-1 text-xs leading-relaxed text-[#64748B] sm:text-sm">
                      <p>{address.addressLine1}</p>
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      {address.landmark && (
                        <p className="text-xs">
                          <span className="font-semibold text-[#101828]">
                            Landmark:
                          </span>{" "}
                          {address.landmark}
                        </p>
                      )}
                      <p className="font-semibold text-[#101828]">
                        {[address.city, address.state].filter(Boolean).join(", ")}
                        {address.pincode ? ` – ${address.pincode}` : ""}
                      </p>
                      {address.country && <p className="text-xs">{address.country}</p>}
                    </div>

                    <div className="mt-3 space-y-0.5 text-xs text-[#64748B] tabular-nums">
                      <p>
                        <span className="font-semibold text-[#101828]">
                          Phone:
                        </span>{" "}
                        {address.phone}
                      </p>
                      {address.alternatePhone && (
                        <p>Alternate: {address.alternatePhone}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#E2E8F0] pt-3.5">
                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address._id)}
                        disabled={defaultLoadingId === address._id}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] disabled:opacity-50"
                      >
                        <Star size={12} aria-hidden="true" />
                        <span>
                          {defaultLoadingId === address._id
                            ? "Updating..."
                            : "Set Default"}
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleEditAddress(address)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                    >
                      <Pencil size={12} aria-hidden="true" />
                      <span>Edit</span>
                    </button>

                    {isConfirming ? (
                      <div className="ml-auto flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(address)}
                          disabled={deletingId === address._id}
                          className="inline-flex h-8 items-center gap-1 rounded-lg bg-red-600 px-3 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletingId === address._id && (
                            <LoaderCircle size={12} className="animate-spin" />
                          )}
                          <span>Confirm</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId("")}
                          className="inline-flex h-8 items-center rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-semibold text-[#64748B]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(address._id)}
                        disabled={deletingId === address._id}
                        className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-bold text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={12} aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AccountShell>
  );
}

export default function AddressesPage() {
  return (
    <ProtectedRoute>
      <AddressPageContent />
    </ProtectedRoute>
  );
}
