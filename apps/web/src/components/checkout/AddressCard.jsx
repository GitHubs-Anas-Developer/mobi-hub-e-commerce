
"use client";

import {
  MapPin,
  Phone,
  CheckCircle2,
  Home,
  Briefcase,
  MapPinned,
} from "lucide-react";

import { motion } from "framer-motion";

export default function AddressCard({
  address,
  selected = false,
  onSelect,
}) {
  if (!address) return null;

  const getAddressIcon = () => {
    switch (address.addressType?.toLowerCase()) {
      case "home":
        return Home;
      case "office":
      case "work":
        return Briefcase;
      default:
        return MapPinned;
    }
  };

  const AddressIcon = getAddressIcon();

  return (
    <motion.label
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className={`relative flex cursor-pointer gap-4 overflow-hidden rounded-2xl border p-4 transition-all duration-200 sm:p-5 ${
        selected
          ? "border-[#0755E9] bg-[#EFF6FF] shadow-sm shadow-blue-500/5"
          : "border-[#E2E8F0] bg-white hover:border-[#93C5FD] hover:shadow-sm"
      }`}
    >
      {/* Radio Input */}
      <input
        type="radio"
        name="deliveryAddress"
        value={address._id}
        checked={selected}
        onChange={() => onSelect?.(address._id)}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#0755E9]"
      />

      {/* Address Content */}
      <div className="min-w-0 flex-1">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">

            {/* Address Icon */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                selected
                  ? "bg-[#0755E9] text-white"
                  : "bg-[#EFF6FF] text-[#0755E9]"
              }`}
            >
              <AddressIcon size={19} />
            </div>

            <div className="min-w-0">
              <h3 className="break-words font-bold text-[#101828]">
                {address.fullName}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-2">

                {address.addressType && (
                  <span className="rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold text-[#475569] ring-1 ring-[#E2E8F0]">
                    {address.addressType}
                  </span>
                )}

                {address.isDefault && (
                  <span className="rounded-md bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                    Default
                  </span>
                )}

              </div>
            </div>
          </div>

          {/* Selected Indicator */}
          {selected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 18,
              }}
              className="shrink-0 text-[#0755E9]"
            >
              <CheckCircle2 size={22} fill="#0755E9" className="text-white" />
            </motion.div>
          )}
        </div>

        {/* Address Details */}
        <div className="mt-4 space-y-1.5 border-t border-[#E2E8F0]/80 pt-4 text-sm leading-6 text-[#64748B]">

          {address.addressLine1 && (
            <p>{address.addressLine1}</p>
          )}

          {address.addressLine2 && (
            <p>{address.addressLine2}</p>
          )}

          {address.landmark && (
            <p>
              <span className="font-medium text-[#475569]">
                Landmark:
              </span>{" "}
              {address.landmark}
            </p>
          )}

          <p>
            {[address.city, address.state]
              .filter(Boolean)
              .join(", ")}

            {address.pincode && ` - ${address.pincode}`}
          </p>

          {address.country && (
            <p>{address.country}</p>
          )}
        </div>

        {/* Contact Details */}
        <div className="mt-4 space-y-2 border-t border-[#E2E8F0]/80 pt-4">

          {address.phone && (
            <div className="flex items-center gap-2 text-sm text-[#475569]">
              <Phone size={15} className="shrink-0 text-[#0755E9]" />
              <span>{address.phone}</span>
            </div>
          )}

          {address.alternatePhone && (
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <Phone size={15} className="shrink-0 text-[#94A3B8]" />
              <span>
                Alternate: {address.alternatePhone}
              </span>
            </div>
          )}
        </div>

        {/* Selected Label */}
        {selected && (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0755E9] px-3 py-1.5 text-[11px] font-semibold text-white">
            <MapPin size={13} />
            Selected Delivery Address
          </div>
        )}

      </div>
    </motion.label>
  );
}
