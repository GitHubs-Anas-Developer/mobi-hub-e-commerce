
"use client";

import { motion } from "framer-motion";
import {
  User,
  Phone,
  MapPin,
  Home,
  Briefcase,
  MapPinned,
  Check,
  Save,
  X,
} from "lucide-react";

const addressFields = [
  {
    name: "fullName",
    label: "Full Name",
    required: true,
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
    label: "Address Line 1",
    required: true,
    minLength: 5,
    autoComplete: "address-line1",
    icon: MapPin,
    fullWidth: true,
  },
  {
    name: "addressLine2",
    label: "Address Line 2",
    required: false,
    autoComplete: "address-line2",
    icon: MapPin,
    fullWidth: true,
  },
  {
    name: "landmark",
    label: "Landmark",
    required: false,
    icon: MapPinned,
  },
  {
    name: "city",
    label: "City",
    required: true,
    autoComplete: "address-level2",
    icon: MapPin,
  },
  {
    name: "state",
    label: "State",
    required: true,
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
    autoComplete: "country-name",
    icon: MapPinned,
  },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-[#101828] outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0755E9] focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700";

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
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className=" overflow-hidden rounded-2xl  border-slate-200 bg-white"
    >

      {/* Form Fields */}
      <div className=" sm:p-6 p-1">
        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
          {addressFields.map((field) => {
            const Icon = field.icon;
            const isAlternatePhone =
              field.name === "alternatePhone";

            return (
              <div
                key={field.name}
                className={field.fullWidth ? "sm:col-span-2" : ""}
              >
                <label
                  htmlFor={field.name}
                  className={labelClass}
                >
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>

                <div className="relative">
                  <Icon
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

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
                    className={inputClass}
                  />
                </div>
              </div>
            );
          })}

          {/* Address Type */}
          <div>
            <label
              htmlFor="addressType"
              className={labelClass}
            >
              Address Type
            </label>

            <div className="relative">
              <Home
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                id="addressType"
                name="addressType"
                value={addressForm.addressType || "Home"}
                onChange={onChange}
                disabled={saving}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Default Address */}
          <div className="flex items-center">
            <label
              htmlFor="isDefault"
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition hover:border-blue-200 hover:bg-blue-50/50"
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

              <span className="text-sm font-medium text-slate-700">
                Set as default address
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-[#0645C4] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Address
              </>
            )}
          </button>
        </div>
      </div>
    </motion.form>
  );
}
