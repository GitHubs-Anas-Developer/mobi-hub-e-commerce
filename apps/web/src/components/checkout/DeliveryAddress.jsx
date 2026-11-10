
"use client";

import AddressForm from "./AddressForm";

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
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Delivery Address
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select an address for your delivery.
          </p>
        </div>

        {!showAddressForm && (
          <button
            type="button"
            onClick={onOpenAddressForm}
            disabled={addressLoading}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add New Address
          </button>
        )}
      </div>

      {/* Error Message */}
      {addressError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
        >
          {addressError}
        </div>
      )}

      {/* Address Loading */}
      {addressLoading ? (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-500">
            Loading addresses...
          </p>
        </div>
      ) : (
        <>
          {/* Empty Address State */}
          {addresses.length === 0 && !showAddressForm && (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center">
              <div className="mb-3 flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-400"
                >
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </div>

              <p className="mb-2 text-sm font-medium text-slate-700">
                No saved delivery addresses found.
              </p>

              <p className="mb-4 text-xs text-slate-500">
                Add an address to continue with your checkout.
              </p>

              <button
                type="button"
                onClick={onOpenAddressForm}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Add your first address
              </button>
            </div>
          )}

          {/* Address List */}
          {addresses.length > 0 && (
            <div className="space-y-4">
              {addresses.map((address) => {
                const isSelected =
                  String(selectedAddress || "") ===
                  String(address._id);

                return (
                  <label
                    key={address._id}
                    className={`flex cursor-pointer gap-4 rounded-lg border p-4 transition ${
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryAddress"
                      value={address._id}
                      checked={isSelected}
                      onChange={() =>
                        onSelectAddress(address._id)
                      }
                      className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                    />

                    <div className="min-w-0 flex-1">
                      {/* Name and Badges */}
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

                        {isSelected && (
                          <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                            Selected
                          </span>
                        )}
                      </div>

                      {/* Address Details */}
                      <div className="space-y-1 text-sm text-slate-600">
                        {address.addressLine1 && (
                          <p>{address.addressLine1}</p>
                        )}

                        {address.addressLine2 && (
                          <p>{address.addressLine2}</p>
                        )}

                        {address.landmark && (
                          <p>
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
                      <div className="mt-3 space-y-1 text-sm text-slate-700">
                        {address.phone && (
                          <p>
                            Phone: {address.phone}
                          </p>
                        )}

                        {address.alternatePhone && (
                          <p className="text-slate-500">
                            Alternate Phone: {address.alternatePhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Add Address Form */}
      {showAddressForm && (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <AddressForm
            addressForm={addressForm}
            onChange={onAddressChange}
            onSubmit={onAddAddress}
            onCancel={onCancelAddressForm}
            saving={savingAddress}
          />
        </div>
      )}
    </section>
  );
}
