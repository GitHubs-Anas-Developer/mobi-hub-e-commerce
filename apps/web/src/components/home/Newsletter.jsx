"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";

import { subscribeNewsletter } from "@/store/thunks/newsletterThunks";
import { resetNewsletterState } from "@/store/slices/newsletterSlice";

export default function Newsletter() {
  const dispatch = useDispatch();

  const {
    loading,
    success,
    message,
    error,
  } = useSelector((state) => state.newsletter || {});

  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    return () => {
      dispatch(resetNewsletterState());
    };
  }, [dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      setValidationError("Please enter your email address.");
      return;
    }

    if (!emailRegex.test(normalizedEmail)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    if (normalizedEmail.length > 254) {
      setValidationError("Email address is too long.");
      return;
    }

    setValidationError("");

    dispatch(subscribeNewsletter(normalizedEmail))
      .unwrap()
      .then(() => {
        setEmail("");
      })
      .catch(() => {
        // Error is handled via Redux state.
      });
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setValidationError("");

    if (success || error) {
      dispatch(resetNewsletterState());
    }
  };

  return (
    <section
      aria-labelledby="home-newsletter-heading"
      className="w-full py-2 sm:py-4"
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-[#082B70] bg-[#082B70] px-5 py-9 sm:px-10 sm:py-12 lg:px-12">
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* LEFT CONTENT */}
            <div className="lg:col-span-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                <Sparkles size={13} className="text-blue-200" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">
                  Stay Updated
                </span>
              </div>

              <h2
                id="home-newsletter-heading"
                className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl"
              >
                New Arrivals &amp; Gadget Drops,{" "}
                <span className="text-blue-300">First to Know.</span>
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-blue-100/80">
                Subscribe to receive curated product announcements, new arrivals,
                and technology updates from ELENZO.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-blue-100">
                  <CheckCircle2 size={15} className="text-blue-300" />
                  New product launches
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-blue-100">
                  <CheckCircle2 size={15} className="text-blue-300" />
                  Seasonal promotions
                </span>
              </div>
            </div>

            {/* RIGHT FORM CARD */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-lg sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
                    <Mail size={19} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#101828]">
                      Join our newsletter
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Updates straight to your inbox.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <label
                    htmlFor="newsletter-email"
                    className="mb-2 block text-xs font-semibold text-[#101828]"
                  >
                    Email address
                  </label>

                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <input
                      id="newsletter-email"
                      type="email"
                      name="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Enter your email address"
                      autoComplete="email"
                      disabled={loading || success}
                      maxLength={254}
                      className="h-11 min-w-0 flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#101828] outline-none transition placeholder:text-slate-400 focus:border-[#0755E9] focus:bg-white focus:ring-2 focus:ring-[#0755E9]/15 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="submit"
                      disabled={loading || success}
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-5 text-sm font-semibold text-white transition hover:bg-[#0645C4] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Subscribing...
                        </>
                      ) : success ? (
                        <>
                          <CheckCircle2 size={16} />
                          Subscribed
                        </>
                      ) : (
                        <>
                          Subscribe
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {validationError && (
                  <p role="alert" className="mt-2.5 text-xs font-medium text-[#DC2626]">
                    {validationError}
                  </p>
                )}

                {error && (
                  <p role="alert" className="mt-2.5 text-xs font-medium text-[#DC2626]">
                    {error}
                  </p>
                )}

                {success && (
                  <p
                    role="status"
                    className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-[#16A34A]"
                  >
                    <CheckCircle2 size={15} />
                    {message || "Subscribed successfully!"}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2 border-t border-[#E2E8F0]/70 pt-3">
                  <Send size={12} className="shrink-0 text-slate-400" />
                  <p className="text-[11px] text-[#64748B]">
                    By subscribing, you agree to receive email updates from ELENZO. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
