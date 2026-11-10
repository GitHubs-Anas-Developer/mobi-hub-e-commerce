
"use client";

export default function AddressCard({
  address,
  selected = false,
  onSelect,
}) {
  if (!address) return null;

  return (
    <label
      className={`flex cursor-pointer gap-4 rounded-lg border p-4 transition ${
        selected
          ? "border-blue-600 bg-blue-50"
          : "border-slate-200 hover:border-blue-300"
      }`}
    >
      <input
        type="radio"
        name="deliveryAddress"
        value={address._id}
        checked={selected}
        onChange={() => onSelect?.(address._id)}
        className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
      />

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-900">
            {address.fullName}
          </span>

          {address.addressType && (
            <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {address.addressType}
            </span>
          )}

          {address.isDefault && (
            <span className="rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
              Default
            </span>
          )}

          {selected && (
            <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
              Selected
            </span>
          )}
        </div>

        <div className="space-y-1 text-sm text-slate-600">
          {address.addressLine1 && <p>{address.addressLine1}</p>}
          {address.addressLine2 && <p>{address.addressLine2}</p>}

          {address.landmark && (
            <p>Landmark: {address.landmark}</p>
          )}

          <p>
            {[address.city, address.state]
              .filter(Boolean)
              .join(", ")}
            {address.pincode && ` - ${address.pincode}`}
          </p>

          {address.country && <p>{address.country}</p>}
        </div>

        <div className="mt-3 space-y-1 text-sm text-slate-700">
          {address.phone && <p>Phone: {address.phone}</p>}

          {address.alternatePhone && (
            <p className="text-slate-500">
              Alternate Phone: {address.alternatePhone}
            </p>
          )}
        </div>
      </div>
    </label>
  );
}
