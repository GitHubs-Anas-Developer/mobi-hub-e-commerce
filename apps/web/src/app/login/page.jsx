
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Smartphone,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  Truck,
  Headphones,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { loginUser } from "@/store/thunks/authThunks";
import axiosInstance from "@/lib/axios";
import { motion } from "motion/react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dispatch, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formError, setFormError] = useState("");
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setEmailNotVerified(false);
    setResendMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setFormError("Please enter your email and password.");
      return;
    }

    try {
      const response = await dispatch(
        loginUser({
          email: cleanEmail,
          password,
        })
      ).unwrap();

      const role = response?.user?.role || response?.role;

      if (role === "admin") {
        router.replace("/admin");
        return;
      }

      // Only allow internal application redirects.
      const next = searchParams.get("next");
      const safeNext =
        next?.startsWith("/") && !next.startsWith("//")
          ? next
          : "/";

      router.replace(safeNext);
    } catch (error) {
      const errorCode =
        error?.code || error?.response?.data?.code;

      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message ||
            error?.response?.data?.message ||
            "Invalid email or password. Please try again.";

      if (errorCode === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
        setFormError(
          "Please verify your email before logging in."
        );
      } else {
        setFormError(errorMessage);
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendingEmail(true);
      setResendMessage("");
      setFormError("");

      await axiosInstance.post("/auth/resend-verification", {
        email: email.trim(),
      });

      setResendMessage(
        "If your account needs verification, a new verification email has been sent."
      );
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
          "Unable to resend verification email. Please try again."
      );
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT BRAND SECTION */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative hidden overflow-hidden bg-[#082b70] px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20"
        >
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />

          <Link href="/" className="relative z-10 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700">
              <Smartphone size={27} />
            </span>
            <span className="text-2xl font-extrabold tracking-tight">
              Mobi <span className="text-blue-300">Hub</span>
            </span>
          </Link>

          <div className="relative z-10 max-w-lg">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100">
              <ShoppingBag size={16} />
              Your trusted shopping destination
            </span>

            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
              Everything you need.
              <span className="mt-2 block text-blue-300">
                All in one hub.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-blue-100/80">
              Discover quality mobile accessories, explore
              your favourite brands and enjoy a simple
              shopping experience with Mobi Hub.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Truck size={21} />
                </span>
                <div>
                  <p className="font-semibold">Reliable Delivery</p>
                  <p className="text-sm text-blue-100/70">
                    Track your orders with ease.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck size={21} />
                </span>
                <div>
                  <p className="font-semibold">Secure Shopping</p>
                  <p className="text-sm text-blue-100/70">
                    Your account security matters.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Headphones size={21} />
                </span>
                <div>
                  <p className="font-semibold">Customer Support</p>
                  <p className="text-sm text-blue-100/70">
                    Help when you need it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-blue-100/60">
            © {new Date().getFullYear()} Mobi Hub. All rights reserved.
          </p>
        </motion.section>

        {/* RIGHT LOGIN SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
          className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12"
        >
          <div className="w-full max-w-md">

            {/* MOBILE BRAND */}
            <Link
              href="/"
              className="mb-10 flex items-center justify-center gap-2 lg:hidden"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Smartphone size={22} />
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                Mobi <span className="text-blue-600">Hub</span>
              </span>
            </Link>

            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold text-blue-600">
                WELCOME BACK
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your account details to continue shopping
                with Mobi Hub.
              </p>
            </div>

            {/* ERROR MESSAGE */}
            {formError && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {formError}
              </div>
            )}

            {/* EMAIL VERIFICATION */}
            {emailNotVerified && (
              <div className="mb-5 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 shrink-0 text-amber-600" size={20} />
                  <div>
                    <p className="font-semibold text-amber-900">
                      Email verification required
                    </p>
                    <p className="mt-1 break-all text-sm text-amber-700">
                      {email.trim()}
                    </p>
                  </div>
                </div>

                {resendMessage && (
                  <div
                    role="status"
                    className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-xs text-green-700"
                  >
                    <CheckCircle2 size={16} className="shrink-0" />
                    {resendMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
                >
                  {resendingEmail ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={17} />
                      Resend Verification Email
                    </>
                  )}
                </button>
              </div>
            )}

            {/* LOGIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormError("");
                      setEmailNotVerified(false);
                      setResendMessage("");
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormError("");
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={Boolean(isLoading)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* REGISTER */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                New to Mobi Hub?{" "}
                <Link
                  href="/register"
                  className="font-bold text-blue-600 hover:text-blue-700"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* SECURITY FOOTER */}
            <div className="mt-10 border-t border-slate-200 pt-6">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={16} className="text-green-600" />
                Secure account authentication
              </div>

              <p className="mt-4 text-center text-xs text-slate-400">
                By signing in, you agree to Mobi Hub's{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>.
              </p>

              <Link
                href="/"
                className="mt-6 block text-center text-sm font-medium text-slate-500 transition hover:text-blue-600"
              >
                ← Back to shopping
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-blue-600" size={30} />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
