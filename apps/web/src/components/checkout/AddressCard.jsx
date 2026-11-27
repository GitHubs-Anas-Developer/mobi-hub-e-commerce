"use client";

import { useState } from "react";
import {
  Phone,
  CheckCircle2,
  Home,
  Briefcase,
  MapPinned,
  Pencil,
  Trash2,
  LoaderCircle,
} from "lucide-react";

const getAddressIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "home":
      return Home;
    case "office":
    case "work":
      return Briefcase;
    default:
      return MapPinned;
  }
};

export default function AddressCard({
  address,
  selected = false,
  disabled = false,
  deleting = false,
  onSelect,
  onEdit,
  onDelete,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!address) return null;

  const AddressIcon = getAddressIcon(address.addressType);

  return (
    <div
      className={`relative rounded-xl border p-3.5 transition-all duration-150 sm:p-4 ${
        selected
          ? "border-[#0755E9] bg-[#EFF6FF]/65 ring-1 ring-[#0755E9]"
          : "border-[#E2E8F0] bg-white hover:border-[#0755E9]/45 hover:bg-[#F8FAFC]"
      } ${disabled ? "opacity-65" : ""}`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="pt-1">
          <input
            type="radio"
            id={`address-${address._id}`}
            name="deliveryAddress"
            value={address._id}
            checked={selected}
            disabled={disabled}
            onChange={() => onSelect?.(address._id)}
            className="h-4 w-4 cursor-pointer accent-[#0755E9]"
          />
        </div>

        <label
          htmlFor={`address-${address._id}`}
          className="min-w-0 flex-1 cursor-pointer"
        >
          {/* Name & Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-[#101828] sm:text-base">
                {address.fullName}
              </h3>

              {address.addressType && (
                <span className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-bold text-[#64748B]">
                  <AddressIcon size={11} aria-hidden="true" />
                  {address.addressType}
                </span>
              )}

              {address.isDefault && (
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  DEFAULT
                </span>
              )}
            </div>

            {selected && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0755E9]">
                <CheckCircle2 size={15} aria-hidden="true" />
                <span>Selected</span>
              </span>
            )}
          </div>

          {/* Street & Location */}
          <div className="mt-2.5 space-y-1 text-xs leading-5 text-[#64748B] sm:text-sm">
            {address.addressLine1 && <p>{address.addressLine1}</p>}
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            {address.landmark && (
              <p className="text-xs text-[#64748B]">
                <span className="font-semibold text-[#101828]">Landmark:</span>{" "}
                {address.landmark}
              </p>
            )}
            <p className="font-medium text-[#101828]">
              {[address.city, address.state].filter(Boolean).join(", ")}
              {address.pincode ? ` – ${address.pincode}` : ""}
            </p>
            {address.country && <p className="text-xs">{address.country}</p>}
          </div>

          {/* Phones */}
          {(address.phone || address.alternatePhone) && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B]">
              {address.phone && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#101828] tabular-nums">
                  <Phone size={12} className="text-[#0755E9]" aria-hidden="true" />
                  {address.phone}
                </span>
              )}
              {address.alternatePhone && (
                <span className="tabular-nums">
                  Alt: {address.alternatePhone}
                </span>
              )}
            </div>
          )}
        </label>
      </div>

      {/* Action Bar: Edit & Delete */}
      {(onEdit || onDelete) && (
        <div className="mt-3.5 flex flex-wrap items-center justify-end gap-2 border-t border-[#E2E8F0] pt-3">
          {onEdit && (
            <button
              type="button"
              disabled={disabled || deleting}
              onClick={() => onEdit(address)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] disabled:opacity-50"
            >
              <Pencil size={12} aria-hidden="true" />
              <span>Edit</span>
            </button>
          )}

          {onDelete && (
            confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={disabled || deleting}
                  onClick={() => {
                    setConfirmDelete(false);
                    onDelete(address._id);
                  }}
                  className="inline-flex h-8 items-center gap-1 rounded-lg bg-red-600 px-3 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? (
                    <LoaderCircle size={12} className="animate-spin" />
                  ) : null}
                  <span>Confirm Delete</span>
                </button>

                <button
                  type="button"
                  disabled={disabled || deleting}
                  onClick={() => setConfirmDelete(false)}
                  className="inline-flex h-8 items-center rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-semibold text-[#64748B] hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={disabled || deleting}
                onClick={() => setConfirmDelete(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#64748B] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 size={12} aria-hidden="true" />
                <span>Delete</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
