"use client";

import {
  MapPin,
  Plus,
  AlertCircle,
  LoaderCircle,
  Map,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";

export default function DeliveryAddress({
  addresses = [],
  selectedAddress,
  onSelectAddress,
  addressLoading = false,
  addressError = "",
  onRetryAddresses,
  showAddressForm = false,
  addressFormMode = "create",
  onOpenAddressForm,
  onEditAddress,
  onDeleteAddress,
  deletingAddressId = "",
  onCancelAddressForm,
  addressForm,
  onAddressChange,
  onSubmitAddress,
  savingAddress = false,
}) {
  return (
    <section
      aria-labelledby="checkout-address-heading"
      className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6"
    >
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
            <MapPin size={19} aria-hidden="true" />
          </div>

          <div>
            <h2
              id="checkout-address-heading"
              className="text-base font-bold text-[#101828] sm:text-lg"
            >
              Delivery Address
            </h2>
            <p className="text-xs text-[#64748B]">
              Select where your ELENZO order should be delivered
            </p>
          </div>
        </div>

        {!showAddressForm && (
          <button
            type="button"
            onClick={onOpenAddressForm}
            disabled={addressLoading}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-[#0645C4] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            <Plus size={16} aria-hidden="true" />
            <span>Add New Address</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {addressError && (
        <div
          role="alert"
          className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 sm:text-sm"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-500" />
            <span>{addressError}</span>
          </div>

          {onRetryAddresses && addresses.length === 0 && (
            <button
              type="button"
              onClick={onRetryAddresses}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-700 shadow-xs hover:bg-red-100"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {addressLoading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] py-12">
          <LoaderCircle size={28} className="animate-spin text-[#0755E9]" />
          <p className="mt-3 text-xs font-semibold text-[#64748B] sm:text-sm">
            Loading your saved addresses...
          </p>
        </div>
      ) : (
        <>
          {addresses.length === 0 && !showAddressForm && (
            <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#0755E9]/15 bg-[#EFF6FF] text-[#0755E9]">
                <Map size={26} aria-hidden="true" />
              </div>

              <h3 className="mt-4 text-base font-bold text-[#101828]">
                No saved delivery addresses yet
              </h3>

              <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-[#64748B] sm:text-sm">
                Add your delivery address to continue with your ELENZO order.
              </p>

              <button
                type="button"
                onClick={onOpenAddressForm}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0645C4] sm:text-sm"
              >
                <span>Add Your First Address</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {addresses.length > 0 && (
            <div className="space-y-3">
              {addresses.map((address) => {
                const isSelected =
                  String(selectedAddress || "") === String(address._id);

                return (
                  <AddressCard
                    key={address._id}
                    address={address}
                    selected={isSelected}
                    disabled={savingAddress}
                    deleting={
                      String(deletingAddressId || "") === String(address._id)
                    }
                    onSelect={onSelectAddress}
                    onEdit={onEditAddress}
                    onDelete={onDeleteAddress}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Inline Add / Edit Address Form */}
      {showAddressForm && (
        <div className="mt-5 border-t border-[#E2E8F0] pt-5">
          <AddressForm
            mode={addressFormMode}
            addressForm={addressForm}
            onChange={onAddressChange}
            onSubmit={onSubmitAddress}
            onCancel={onCancelAddressForm}
            saving={savingAddress}
          />
        </div>
      )}
    </section>
  );
}
