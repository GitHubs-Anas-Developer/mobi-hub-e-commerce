
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

import {
  subscribeNewsletter,
} from "@/store/thunks/newsletterThunks";

import {
  resetNewsletterState,
} from "@/store/slices/newsletterSlice";

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
        // Error is displayed from Redux state.
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
    <section className="bg-white  ">
      <div className="relative mx-auto w-full overflow-hidden  bg-[#082B70] px-5 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">

        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border-[35px] border-white/5" />

        <div className="pointer-events-none absolute -bottom-28 right-1/3 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative grid items-center gap-9 lg:grid-cols-2 lg:gap-12">

          {/* LEFT CONTENT */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2">
              <Sparkles size={13} className="text-blue-200" />

              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">
                Stay Connected
              </span>
            </div>

            <h2 className="max-w-xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]">
              Good Tech.
              <br />
              <span className="text-blue-300">
                Great Updates.
              </span>
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-blue-100/75">
              Be the first to discover new arrivals, exclusive deals,
              product highlights and the latest updates from ELEZIO.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-white/80">
                <CheckCircle2 size={15} className="text-blue-300" />
                Latest arrivals
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-white/80">
                <CheckCircle2 size={15} className="text-blue-300" />
                Exclusive offers
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="relative rounded-xl border border-white/10 bg-white p-5 shadow-2xl shadow-blue-950/20 sm:p-7">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0755E9]">
                <Mail size={21} />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-[#101828]">
                  Join our newsletter
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Get updates delivered to your inbox.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <label
                htmlFor="newsletter-email"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
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
                  className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 pr-4 text-sm text-[#101828] outline-none transition placeholder:text-slate-400 focus:border-[#0755E9] focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#0755E9] px-5 text-sm font-bold text-white transition hover:bg-[#0645C4] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Subscribing...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={17} />
                    Subscribed Successfully
                  </>
                ) : (
                  <>
                    Subscribe Now
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* FEEDBACK */}
            {validationError && (
              <p role="alert" className="mt-3 text-xs font-medium text-red-600">
                {validationError}
              </p>
            )}

            {error && (
              <p role="alert" className="mt-3 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            {success && (
              <p role="status" className="mt-3 flex items-center gap-2 text-xs font-semibold text-green-700">
                <CheckCircle2 size={15} />
                {message}
              </p>
            )}

            <div className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4">
              <Send size={13} className="mt-0.5 shrink-0 text-slate-400" />

              <p className="text-[10px] leading-5 text-slate-400">
                By subscribing, you agree to receive email updates from
                ELEZIO. You can unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
