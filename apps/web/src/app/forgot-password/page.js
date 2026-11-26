
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Headphones,
} from "lucide-react";
import BrandMark from "@/components/common/BrandMark";

import axiosInstance from "@/lib/axios";

export default function ForgotPasswordPage() {
  const [currentYear, setCurrentYear] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setCurrentYear(String(new Date().getFullYear()));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setFormError("Please enter your email address.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axiosInstance.post(
        "/auth/forgot-password",
        { email: cleanEmail }
      );

      setSubmitted(true);
      setSuccessMessage(
        response?.data?.message ||
          "If an account exists with this email, a password reset link has been sent."
      );
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT BRAND SECTION */}
        <motion.section
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative hidden overflow-hidden bg-[#082b70] px-8 py-8 text-white lg:flex lg:flex-col lg:justify-between xl:px-14"
        >
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />

          <Link href="/" className="relative z-10 flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700">
              <BrandMark className="h-5 w-5" />
            </span>

            <span className="text-xl font-extrabold tracking-tight">
              ELE<span className="text-blue-300">ZIO</span>
            </span>
          </Link>

          <div className="relative z-10 max-w-md">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-blue-100">
              <ShieldCheck size={15} />
              Account Security
            </span>

            <h1 className="text-3xl font-bold leading-tight xl:text-4xl">
              Your account.
              <span className="mt-1 block text-blue-300">
                Your security.
              </span>
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100/80">
              Forgot your password? Don't worry. We'll help you securely
              regain access to your ELEZIO account.
            </p>

            <div className="mt-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Truck size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold">Reliable Delivery</p>
                  <p className="text-xs text-blue-100/70">
                    Track your orders with ease.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold">Secure Shopping</p>
                  <p className="text-xs text-blue-100/70">
                    Your account security matters.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Headphones size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold">Customer Support</p>
                  <p className="text-xs text-blue-100/70">
                    Help when you need it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-blue-100/60">
            © {currentYear} ELEZIO. All rights reserved.
          </p>
        </motion.section>

        {/* RIGHT FORGOT PASSWORD SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          className="flex items-center justify-center px-4 py-7 sm:px-6 lg:px-8"
        >
          <div className="w-full max-w-[400px]">

            {/* MOBILE BRAND */}
            <Link
              href="/"
              className="mb-7 flex items-center justify-center gap-2 lg:hidden"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                <BrandMark className="h-5 w-5" />
              </span>

              <span className="text-lg font-extrabold text-slate-900">
                ELE<span className="text-blue-600">ZIO</span>
              </span>
            </Link>

            {!submitted ? (
              <>
                <div className="mb-6">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-blue-600">
                    ACCOUNT RECOVERY
                  </p>

                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Forgot your password?
                  </h2>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Enter the email address associated with your account.
                    We'll send you a link to reset your password.
                  </p>
                </div>

                {/* ERROR MESSAGE */}
                {formError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                  >
                    {formError}
                  </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFormError("");
                        }}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* SUCCESS SECTION */
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <CheckCircle2 size={29} />
                </div>

                <p className="mb-2 text-xs font-semibold tracking-wide text-green-600">
                  REQUEST SUBMITTED
                </p>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Check your email
                </h2>

                <p className="mt-3 text-sm leading-5 text-slate-500">
                  {successMessage}
                </p>

                <div className="mt-5 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left">
                  <Mail size={19} className="shrink-0 text-blue-600" />
                  <p className="break-all text-sm font-semibold text-slate-700">
                    {email.trim()}
                  </p>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-400">
                  If you don't see the email, check your spam or junk folder.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setSuccessMessage("");
                  }}
                  className="mt-5 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Try another email
                </button>
              </div>
            )}

            {/* FOOTER */}
            <div className="mt-7 border-t border-slate-200 pt-5">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={15} className="text-green-600" />
                Secure account authentication
              </div>

              <Link
                href="/login"
                className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>

              <Link
                href="/"
                className="mt-3 block text-center text-sm font-medium text-slate-500 transition hover:text-blue-600"
              >
                Back to shopping
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
