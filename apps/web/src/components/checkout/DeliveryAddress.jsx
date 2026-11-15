
"use client";

import AddressForm from "./AddressForm";

import { motion, AnimatePresence } from "framer-motion";

import {
  MapPin,
  Plus,
  Home,
  Briefcase,
  MapPinned,
  Phone,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Map,
  ArrowRight,
} from "lucide-react";

const getAddressIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "home":
      return Home;
    case "work":
      return Briefcase;
    default:
      return MapPinned;
  }
};

export default function DeliveryAddress({
  addresses = [],
  selectedAddress,
  onSelectAddress,
  addressLoading,
  addressError,
  showAddressForm,
  onOpenAddressForm,
  onCancelAddressForm,
  addressForm,
  onAddressChange,
  onAddAddress,
  savingAddress,
}) {
  return (
    <section className="rounded-2xl bg-white">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0755E9]">
            <MapPin size={21} />
          </div>

          <div>
            <h2 className="text-base font-bold text-[#101828] sm:text-lg">
              Delivery Address
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Choose where you want your order delivered.
            </p>
          </div>
        </div>

        {!showAddressForm && (
          <button
            type="button"
            onClick={onOpenAddressForm}
            disabled={addressLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0645C4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={17} />
            Add New Address
          </button>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {addressError && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            role="alert"
            className="mb-5 flex items-start gap-3 overflow-hidden rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <p className="text-sm leading-5 text-red-600">
              {addressError}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address Loading */}
      {addressLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 py-12">
          <LoaderCircle
            size={30}
            className="animate-spin text-[#0755E9]"
          />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading your addresses...
          </p>
        </div>
      ) : (
        <>
          {/* Empty Address State */}
          {addresses.length === 0 && !showAddressForm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-5 py-12 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0755E9]">
                <Map size={29} />
              </div>

              <h3 className="mt-5 text-base font-bold text-[#101828]">
                No saved addresses yet
              </h3>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                Add your delivery address to continue with your Mobi Hub order.
              </p>

              <button
                type="button"
                onClick={onOpenAddressForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0645C4]"
              >
                Add Your First Address
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* Address List */}
          {addresses.length > 0 && (
            <div className="space-y-3">
              {addresses.map((address, index) => {
                const isSelected =
                  String(selectedAddress || "") ===
                  String(address._id);

                const AddressIcon = getAddressIcon(
                  address.addressType
                );

                return (
                  <motion.label
                    key={address._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.06,
                    }}
                    className={`relative flex cursor-pointer gap-3 overflow-hidden rounded-2xl border p-4 transition-all duration-200 sm:gap-4 sm:p-5 ${
                      isSelected
                        ? "border-[#0755E9] bg-blue-50/50 shadow-sm shadow-blue-100"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50/50"
                    }`}
                  >
                    {/* Radio */}
                    <div className="pt-1">
                      <input
                        type="radio"
                        name="deliveryAddress"
                        value={address._id}
                        checked={isSelected}
                        onChange={() =>
                          onSelectAddress(address._id)
                        }
                        className="h-[18px] w-[18px] cursor-pointer accent-[#0755E9]"
                      />
                    </div>

                    {/* Address Content */}
                    <div className="min-w-0 flex-1">
                      {/* Name and Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[#101828] sm:text-base">
                          {address.fullName}
                        </h3>

                        {address.addressType && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                            <AddressIcon size={11} />
                            {address.addressType}
                          </span>
                        )}

                        {address.isDefault && (
                          <span className="rounded-md bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">
                            DEFAULT
                          </span>
                        )}
                      </div>

                      {/* Address Details */}
                      <div className="mt-3 space-y-1.5 text-sm leading-5 text-slate-600">
                        {address.addressLine1 && (
                          <p>{address.addressLine1}</p>
                        )}

                        {address.addressLine2 && (
                          <p>{address.addressLine2}</p>
                        )}

                        {address.landmark && (
                          <p className="text-xs text-slate-500">
                            Landmark: {address.landmark}
                          </p>
                        )}

                        <p>
                          {[
                            address.city,
                            address.state,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                          {address.pincode &&
                            ` - ${address.pincode}`}
                        </p>

                        {address.country && (
                          <p>{address.country}</p>
                        )}
                      </div>

                      {/* Contact Details */}
                      {(address.phone ||
                        address.alternatePhone) && (
                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-3">
                          {address.phone && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                              <Phone
                                size={13}
                                className="text-slate-400"
                              />
                              {address.phone}
                            </span>
                          )}

                          {address.alternatePhone && (
                            <span className="text-xs text-slate-500">
                              Alternate: {address.alternatePhone}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute right-3 top-3 text-[#0755E9]">
                        <CheckCircle2 size={19} />
                      </div>
                    )}
                  </motion.label>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Add Address Form */}
      <AnimatePresence>
        {showAddressForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden border-t border-slate-100 pt-5"
          >
            <AddressForm
              addressForm={addressForm}
              onChange={onAddressChange}
              onSubmit={onAddAddress}
              onCancel={onCancelAddressForm}
              saving={savingAddress}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
