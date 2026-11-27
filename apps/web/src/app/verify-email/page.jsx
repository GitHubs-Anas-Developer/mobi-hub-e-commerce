"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  MailCheck,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { BRAND_ASSETS, BRAND_NAME, BRAND_TAGLINE } from "@/config/brand";
import authService from "@/services/authService";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let cancelled = false;

    const verifyEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        if (!cancelled) {
          setStatus("error");
          setMessage("Verification token is missing.");
        }
        return;
      }

      try {
        const data = await authService.verifyEmail(token);
        if (!cancelled) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully.");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            error?.response?.data?.message ||
              "Email verification failed. Please try again."
          );
        }
      }
    };

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-[400px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-900/5"
      >
        <div className="h-1 w-full bg-[#0755E9]" />

        <div className="px-6 py-7 text-center sm:px-8 sm:py-8">
          {/* BRAND */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.3 }}
            className="mb-7 flex items-center justify-center"
          >
            <img
              src={BRAND_ASSETS.logo}
              alt={`${BRAND_NAME} - ${BRAND_TAGLINE}`}
              className="h-10 w-auto object-contain"
            />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {status === "loading" && (
                <>
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Loader2 size={30} className="animate-spin" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Verifying Email
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Please wait while we verify your email address.
                  </p>
                </>
              )}

              {status === "success" && (
                <>
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 15 }}
                    className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600"
                  >
                    <CheckCircle2 size={34} />
                  </motion.div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Email Verified!
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {message}
                  </p>
                  <Link
                    href="/login"
                    className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
                  >
                    Continue to Login
                    <ArrowRight size={17} />
                  </Link>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <XCircle size={34} />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Verification Failed
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-red-600">
                    {message}
                  </p>
                  <Link
                    href="/login"
                    className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
                  >
                    Go to Login
                    <ArrowRight size={17} />
                  </Link>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
            <ShieldCheck size={14} className="text-green-600" />
            Secure and protected verification
          </div>
        </div>
      </motion.div>
    </main>
  );
}
