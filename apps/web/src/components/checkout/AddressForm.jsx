"use client";

import {
  User,
  Phone,
  MapPin,
  Home,
  MapPinned,
  Save,
  X,
  LoaderCircle,
} from "lucide-react";

const addressFields = [
  {
    name: "fullName",
    label: "Full Name",
    required: true,
    minLength: 2,
    maxLength: 100,
    autoComplete: "name",
    icon: User,
  },
  {
    name: "phone",
    label: "Phone Number",
    required: true,
    maxLength: 10,
    pattern: "[0-9]{10}",
    inputMode: "numeric",
    autoComplete: "tel",
    icon: Phone,
  },
  {
    name: "alternatePhone",
    label: "Alternate Phone",
    required: false,
    maxLength: 10,
    pattern: "[0-9]{10}",
    inputMode: "numeric",
    icon: Phone,
  },
  {
    name: "addressLine1",
    label: "Flat / House No., Building & Street",
    required: true,
    minLength: 5,
    maxLength: 200,
    autoComplete: "address-line1",
    icon: MapPin,
    fullWidth: true,
  },
  {
    name: "addressLine2",
    label: "Area / Locality (Optional)",
    required: false,
    maxLength: 200,
    autoComplete: "address-line2",
    icon: MapPin,
    fullWidth: true,
  },
  {
    name: "landmark",
    label: "Landmark (Optional)",
    required: false,
    maxLength: 100,
    icon: MapPinned,
  },
  {
    name: "city",
    label: "City",
    required: true,
    minLength: 2,
    maxLength: 100,
    autoComplete: "address-level2",
    icon: MapPin,
  },
  {
    name: "state",
    label: "State",
    required: true,
    minLength: 2,
    maxLength: 100,
    autoComplete: "address-level1",
    icon: MapPinned,
  },
  {
    name: "pincode",
    label: "PIN Code",
    required: true,
    maxLength: 6,
    pattern: "[0-9]{6}",
    inputMode: "numeric",
    autoComplete: "postal-code",
    icon: MapPin,
  },
  {
    name: "country",
    label: "Country",
    required: true,
    minLength: 2,
    maxLength: 100,
    autoComplete: "country-name",
    icon: MapPinned,
  },
];

const inputClass =
  "w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-10 pr-3 text-sm text-[#101828] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0755E9] focus:bg-white focus:ring-2 focus:ring-[#0755E9]/15 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass = "mb-1.5 block text-xs font-bold text-[#101828]";

export default function AddressForm({
  mode = "create",
  addressForm = {},
  onChange,
  onSubmit,
  onCancel,
  saving = false,
}) {
  const isEditing = mode === "edit";

  const handleSubmit = (event) => {
    event.preventDefault();

    const phone = String(addressForm.phone || "").trim();
    const alternatePhone = String(addressForm.alternatePhone || "").trim();

    if (alternatePhone && phone === alternatePhone) {
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
      className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]/50 p-4 sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div>
          <h3 className="text-sm font-bold text-[#101828] sm:text-base">
            {isEditing ? "Edit Delivery Address" : "Add New Delivery Address"}
          </h3>
          <p className="mt-0.5 text-xs text-[#64748B]">
            Fields marked with * are required for order delivery
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          aria-label="Close address form"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] transition hover:bg-slate-100 hover:text-[#101828]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        {addressFields.map((field) => {
          const Icon = field.icon;
          const isAlternatePhone = field.name === "alternatePhone";

          return (
            <div
              key={field.name}
              className={field.fullWidth ? "sm:col-span-2" : ""}
            >
              <label htmlFor={field.name} className={labelClass}>
                {field.label}
                {field.required && <span className="ml-0.5 text-red-500">*</span>}
              </label>

              <div className="relative">
                <Icon
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                  aria-hidden="true"
                />

                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={addressForm[field.name] ?? ""}
                  onChange={isAlternatePhone ? handleAlternatePhoneChange : onChange}
                  required={field.required}
                  maxLength={field.maxLength}
                  minLength={field.minLength}
                  pattern={field.pattern}
                  inputMode={field.inputMode}
                  autoComplete={field.autoComplete}
                  disabled={saving}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className={inputClass}
                />
              </div>
            </div>
          );
        })}

        <div>
          <label htmlFor="addressType" className={labelClass}>
            Address Type
          </label>

          <div className="relative">
            <Home
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />

            <select
              id="addressType"
              name="addressType"
              value={addressForm.addressType || "Home"}
              onChange={onChange}
              disabled={saving}
              className={`${inputClass} cursor-pointer appearance-none`}
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex items-end">
          <label
            htmlFor="isDefault"
            className="flex h-[42px] w-full cursor-pointer items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 transition hover:border-[#0755E9]/40"
          >
            <input
              id="isDefault"
              name="isDefault"
              type="checkbox"
              checked={Boolean(addressForm.isDefault)}
              onChange={onChange}
              disabled={saving}
              className="h-4 w-4 rounded accent-[#0755E9]"
            />
            <span className="text-xs font-semibold text-[#101828]">
              Set as default address
            </span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-[#E2E8F0] pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 text-xs font-bold text-[#64748B] transition hover:bg-slate-50 hover:text-[#101828] disabled:opacity-50 sm:text-sm"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-6 text-xs font-bold text-white shadow-xs transition hover:bg-[#0645C4] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          {saving ? (
            <>
              <LoaderCircle size={15} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={15} />
              <span>{isEditing ? "Update Address" : "Save Address"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
