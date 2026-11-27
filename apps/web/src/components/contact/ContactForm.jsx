"use client";

import { useState } from "react";
import {
  Send,
  Mail,
  AlertCircle,
  Info,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

import { BRAND_NAME, BRAND_SUPPORT_EMAIL } from "@/config/brand";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const MAX_MESSAGE_LENGTH = 1000;

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [validatedDraft, setValidatedDraft] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (validatedDraft) {
      setValidatedDraft(null);
    }
  };

  const validate = () => {
    const nextErrors = {};
    const name = form.fullName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (name.length < 2) {
      nextErrors.fullName = "Please enter your full name (at least 2 characters).";
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (phone && !/^[+]?[\d\s()-]{7,20}$/.test(phone)) {
      nextErrors.phone = "Please enter a valid phone number or leave blank.";
    }

    if (subject.length < 3) {
      nextErrors.subject = "Please enter a subject (at least 3 characters).";
    }

    if (message.length < 10) {
      nextErrors.message =
        "Please enter a message of at least 10 characters so we can assist you.";
    } else if (message.length > MAX_MESSAGE_LENGTH) {
      nextErrors.message = `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    // No backend contact endpoint exists in the API; surface honest state
    // and prepare a pre-filled email fallback instead of faking delivery.
    setTimeout(() => {
      setValidatedDraft({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSubmitting(false);
    }, 250);
  };

  const mailtoHref = validatedDraft
    ? `mailto:${BRAND_SUPPORT_EMAIL}?subject=${encodeURIComponent(
        `[${BRAND_NAME} Support] ${validatedDraft.subject}`
      )}&body=${encodeURIComponent(
        [
          `Name: ${validatedDraft.fullName}`,
          `Email: ${validatedDraft.email}`,
          validatedDraft.phone ? `Phone: ${validatedDraft.phone}` : null,
          "",
          validatedDraft.message,
        ]
          .filter((line) => line !== null)
          .join("\n")
      )}`
    : `mailto:${BRAND_SUPPORT_EMAIL}`;

  const inputBase =
    "w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#101828] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0755E9] focus:bg-white focus:ring-2 focus:ring-[#0755E9]/15";

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-7">
      <div className="mb-5 border-b border-[#E2E8F0] pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0755E9]">
          Send an Inquiry
        </span>
        <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#101828] sm:text-2xl">
          Message Support
        </h2>
        <p className="mt-1 text-xs leading-5 text-[#64748B] sm:text-sm">
          Fill in your question below. We validate every field before preparing
          your inquiry for our team.
        </p>
      </div>

      {/* Honest API integration notice */}
      <div
        role="note"
        className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#0755E9]/20 bg-[#EFF6FF] p-3.5 text-xs leading-5 text-[#082B70]"
      >
        <Info size={16} className="mt-0.5 shrink-0 text-[#0755E9]" />
        <span>
          Direct web-form API delivery is currently not configured on the backend
          server. Submitting this form validates your message and generates a
          pre-filled email draft directly to{" "}
          <strong className="font-bold">{BRAND_SUPPORT_EMAIL}</strong>.
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contact-fullName"
              className="mb-1.5 block text-xs font-bold text-[#101828]"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              aria-invalid={Boolean(errors.fullName)}
              className={`${inputBase} ${
                errors.fullName ? "border-red-400 focus:border-red-500" : ""
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="mb-1.5 block text-xs font-bold text-[#101828]"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              className={`${inputBase} ${
                errors.email ? "border-red-400 focus:border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contact-phone"
              className="mb-1.5 block text-xs font-bold text-[#101828]"
            >
              Phone Number{" "}
              <span className="font-normal text-[#64748B]">(Optional)</span>
            </label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Optional contact number"
              aria-invalid={Boolean(errors.phone)}
              className={`${inputBase} ${
                errors.phone ? "border-red-400 focus:border-red-500" : ""
              }`}
            />
            {errors.phone && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="contact-subject"
              className="mb-1.5 block text-xs font-bold text-[#101828]"
            >
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              value={form.subject}
              onChange={handleChange}
              placeholder="Order inquiry, product question, etc."
              aria-invalid={Boolean(errors.subject)}
              className={`${inputBase} ${
                errors.subject ? "border-red-400 focus:border-red-500" : ""
              }`}
            />
            {errors.subject && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {errors.subject}
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label
              htmlFor="contact-message"
              className="text-xs font-bold text-[#101828]"
            >
              Message <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] font-medium text-[#64748B] tabular-nums">
              {form.message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            maxLength={MAX_MESSAGE_LENGTH}
            value={form.message}
            onChange={handleChange}
            placeholder="Share product names, order numbers, or details so we can help..."
            aria-invalid={Boolean(errors.message)}
            className={`${inputBase} ${
              errors.message ? "border-red-400 focus:border-red-500" : ""
            }`}
          />
          {errors.message && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
              <AlertCircle size={12} aria-hidden="true" />
              {errors.message}
            </p>
          )}
        </div>

        {validatedDraft && (
          <div
            role="status"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-amber-700"
              />
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-xs font-extrabold text-amber-900 sm:text-sm">
                  Form validated — backend submission endpoint not yet connected
                </p>
                <p className="text-xs leading-5 text-amber-800">
                  Because no server contact-ticket API is configured yet, your
                  message has not been stored on our server. Send it directly via
                  your email client using the button below:
                </p>
                <a
                  href={mailtoHref}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white transition hover:bg-[#0645C4]"
                >
                  <Mail size={14} aria-hidden="true" />
                  Send Prepared Email to {BRAND_SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#64748B]">
            Prefer direct email? Reach us at{" "}
            <a
              href={`mailto:${BRAND_SUPPORT_EMAIL}`}
              className="font-bold text-[#0755E9] hover:underline"
            >
              {BRAND_SUPPORT_EMAIL}
            </a>
            .
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-6 text-sm font-bold text-white shadow-xs transition hover:bg-[#0645C4] disabled:opacity-60 sm:w-auto"
          >
            {submitting ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <Send size={15} aria-hidden="true" />
                Prepare Support Inquiry
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

