
"use client";

const addressFields = [
  {
    name: "fullName",
    label: "Full Name",
    required: true,
    autoComplete: "name",
  },
  {
    name: "phone",
    label: "Phone Number",
    required: true,
    maxLength: 10,
    pattern: "[0-9]{10}",
    inputMode: "numeric",
    autoComplete: "tel",
  },
  {
    name: "alternatePhone",
    label: "Alternate Phone",
    required: false,
    maxLength: 10,
    pattern: "[0-9]{10}",
    inputMode: "numeric",
  },
  {
    name: "addressLine1",
    label: "Address Line 1",
    required: true,
    minLength: 5,
    autoComplete: "address-line1",
  },
  {
    name: "addressLine2",
    label: "Address Line 2",
    required: false,
    autoComplete: "address-line2",
  },
  {
    name: "landmark",
    label: "Landmark",
    required: false,
  },
  {
    name: "city",
    label: "City",
    required: true,
    autoComplete: "address-level2",
  },
  {
    name: "state",
    label: "State",
    required: true,
    autoComplete: "address-level1",
  },
  {
    name: "pincode",
    label: "PIN Code",
    required: true,
    maxLength: 6,
    pattern: "[0-9]{6}",
    inputMode: "numeric",
    autoComplete: "postal-code",
  },
  {
    name: "country",
    label: "Country",
    required: true,
    autoComplete: "country-name",
  },
];

export default function AddressForm({
  addressForm = {},
  onChange,
  onSubmit,
  onCancel,
  saving = false,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();

    const phone = String(addressForm.phone || "").trim();
    const alternatePhone = String(
      addressForm.alternatePhone || ""
    ).trim();

    if (
      alternatePhone &&
      phone === alternatePhone
    ) {
      event.currentTarget.elements.alternatePhone.setCustomValidity(
        "Alternate phone number must be different."
      );
      event.currentTarget.elements.alternatePhone.reportValidity();
      return;
    }

    event.currentTarget.elements.alternatePhone.setCustomValidity("");

    onSubmit?.(event);
  };

  const handleAlternatePhoneChange = (event) => {
    event.target.setCustomValidity("");
    onChange?.(event);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 border-t border-slate-200 pt-6"
    >
      <h3 className="mb-5 text-lg font-semibold text-slate-900">
        Add New Address
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addressFields.map((field) => {
          const isAlternatePhone =
            field.name === "alternatePhone";

          return (
            <div
              key={field.name}
              className={
                field.name === "addressLine1" ||
                field.name === "addressLine2"
                  ? "sm:col-span-2"
                  : ""
              }
            >
              <label
                htmlFor={field.name}
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                {field.label}

                {field.required && (
                  <span className="text-red-500"> *</span>
                )}
              </label>

              <input
                id={field.name}
                name={field.name}
                type="text"
                value={addressForm[field.name] ?? ""}
                onChange={
                  isAlternatePhone
                    ? handleAlternatePhoneChange
                    : onChange
                }
                required={field.required}
                maxLength={field.maxLength}
                minLength={field.minLength}
                pattern={field.pattern}
                inputMode={field.inputMode}
                autoComplete={field.autoComplete}
                disabled={saving}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
          );
        })}

        {/* Address Type */}
        <div>
          <label
            htmlFor="addressType"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Address Type
          </label>

          <select
            id="addressType"
            name="addressType"
            value={addressForm.addressType || "Home"}
            onChange={onChange}
            disabled={saving}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Default Address */}
        <div className="flex items-center gap-2 self-end pb-3">
          <input
            id="isDefault"
            name="isDefault"
            type="checkbox"
            checked={Boolean(addressForm.isDefault)}
            onChange={onChange}
            disabled={saving}
            className="h-4 w-4 rounded accent-blue-600"
          />

          <label
            htmlFor="isDefault"
            className="cursor-pointer text-sm text-slate-700"
          >
            Set as default address
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Address"}
        </button>
      </div>
    </form>
  );
}
