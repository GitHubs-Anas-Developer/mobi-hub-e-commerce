
"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  User,
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
import Logo from "@/components/layout/navbar/Logo";

import { useAuth } from "@/hooks/useAuth";
import { registerUser } from "@/store/thunks/authThunks";
import axiosInstance from "@/lib/axios";

export default function RegisterPage() {
  const { dispatch, isLoading } = useAuth();

  const [currentYear, setCurrentYear] = useState("");

  useEffect(() => {
    setCurrentYear(String(new Date().getFullYear()));
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formError, setFormError] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormError("");
    setResendMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setResendMessage("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      setFormError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    try {
      await dispatch(
        registerUser({
          name,
          email,
          password,
        })
      ).unwrap();

      setFormData((prev) => ({
        ...prev,
        email,
      }));

      setRegistrationComplete(true);
    } catch (error) {
      setFormError(
        typeof error === "string"
          ? error
          : error?.message ||
          error?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendingEmail(true);
      setResendMessage("");
      setFormError("");

      await axiosInstance.post("/auth/resend-verification", {
        email: formData.email.trim().toLowerCase(),
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
    <main className="min-h-dvh bg-slate-50">
      <div className="grid min-h-dvh lg:grid-cols-2">

        {/* LEFT BRAND SECTION */}
        <motion.section
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="
            relative hidden overflow-hidden
            bg-[#082b70] px-8 py-8 text-white
            lg:flex lg:flex-col lg:justify-between
            xl:px-12
          "
        >
          <div className="relative z-10">
            <Logo variant="white" />
          </div>

          <div className="relative z-10 max-w-md">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-blue-100">
              <ShoppingBag size={14} />
              Join the ELENZO community
            </span>

            <h1 className="text-3xl font-bold leading-tight xl:text-4xl">
              Your tech journey starts here.
              <span className="mt-1 block text-blue-300">
                Create your account.
              </span>
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100/80">
              Explore quality gadgets and electronics, discover your favourite
              brands and enjoy a simple shopping experience.
            </p>

            <div className="mt-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Truck size={19} />
                </span>

                <div>
                  <p className="text-sm font-semibold">
                    Reliable Delivery
                  </p>
                  <p className="text-xs text-blue-100/70">
                    Track your orders with ease.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <ShieldCheck size={19} />
                </span>

                <div>
                  <p className="text-sm font-semibold">
                    Secure Shopping
                  </p>
                  <p className="text-xs text-blue-100/70">
                    Your account security matters.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Headphones size={19} />
                </span>

                <div>
                  <p className="text-sm font-semibold">
                    Customer Support
                  </p>
                  <p className="text-xs text-blue-100/70">
                    Help when you need it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-[11px] text-blue-100/60">
            © {currentYear} ELENZO. All rights reserved.
          </p>
        </motion.section>

        {/* RIGHT REGISTER SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="
            flex min-h-dvh items-center justify-center
            px-4 py-6 sm:px-6 sm:py-8
          "
        >
          <div className="w-full max-w-[400px]">

            {/* MOBILE BRAND */}
            <div className="mb-6 flex justify-center lg:hidden">
              <Logo />
            </div>

            {registrationComplete ? (
              /* REGISTRATION SUCCESS */
              <motion.div
                key="registration-success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="
                  rounded-xl border border-slate-200
                  bg-white p-5 shadow-sm sm:p-6
                "
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Mail size={23} />
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs font-bold text-blue-600">
                    ONE MORE STEP
                  </p>

                  <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                    Check your inbox
                  </h2>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    We have sent a verification link to:
                  </p>

                  <p className="mt-1.5 break-all text-sm font-bold text-blue-600">
                    {formData.email.trim()}
                  </p>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Open the email and click the verification link to
                    activate your ELENZO account. You cannot log in
                    until your email is verified.
                  </p>
                </div>

                {formError && (
                  <div
                    role="alert"
                    className="mt-4 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700"
                  >
                    {formError}
                  </div>
                )}

                {resendMessage && (
                  <div
                    role="status"
                    className="mt-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-2.5 text-xs leading-5 text-green-700"
                  >
                    <CheckCircle2 size={16} className="shrink-0" />
                    {resendMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="
                    mt-4 flex h-10 w-full items-center
                    justify-center gap-2 rounded-lg
                    border border-blue-200 bg-blue-50
                    text-xs font-semibold text-blue-700
                    transition hover:bg-blue-100
                    disabled:cursor-not-allowed disabled:opacity-60
                  "
                >
                  {resendingEmail ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={15} />
                      Resend Verification Email
                    </>
                  )}
                </button>

                <Link
                  href="/login"
                  className="
                    mt-2.5 flex h-10 w-full items-center
                    justify-center gap-2 rounded-lg
                    bg-blue-600 text-xs font-semibold
                    text-white transition hover:bg-blue-700
                  "
                >
                  Continue to Login
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="registration-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* HEADING */}
                <div className="mb-5">
                  <p className="mb-1.5 text-xs font-bold tracking-wide text-blue-600">
                    CREATE ACCOUNT
                  </p>

                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[27px]">
                    Join ELENZO
                  </h2>

                  <p className="mt-1.5 text-sm leading-5 text-slate-500">
                    Create your account and start exploring our gadgets and
                    electronics.
                  </p>
                </div>

                {/* ERROR */}
                {formError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700"
                  >
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">

                  {/* NAME */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                      Full Name
                    </label>

                    <div className="relative">
                      <User
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                        className="
                          h-11 w-full rounded-lg
                          border border-slate-200 bg-white
                          pl-10 pr-3 text-sm text-slate-900
                          outline-none transition
                          placeholder:text-slate-400
                          focus:border-blue-500
                          focus:ring-2 focus:ring-blue-500/10
                        "
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
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
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="
                          h-11 w-full rounded-lg
                          border border-slate-200 bg-white
                          pl-10 pr-3 text-sm text-slate-900
                          outline-none transition
                          placeholder:text-slate-400
                          focus:border-blue-500
                          focus:ring-2 focus:ring-blue-500/10
                        "
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        autoComplete="new-password"
                        minLength={6}
                        required
                        className="
                          h-11 w-full rounded-lg
                          border border-slate-200 bg-white
                          pl-10 pr-11 text-sm text-slate-900
                          outline-none transition
                          placeholder:text-slate-400
                          focus:border-blue-500
                          focus:ring-2 focus:ring-blue-500/10
                        "
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="
                          absolute right-3.5 top-1/2
                          -translate-y-1/2 text-slate-400
                          transition hover:text-blue-600
                        "
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                      Confirm Password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        required
                        className="
                          h-11 w-full rounded-lg
                          border border-slate-200 bg-white
                          pl-10 pr-11 text-sm text-slate-900
                          outline-none transition
                          placeholder:text-slate-400
                          focus:border-blue-500
                          focus:ring-2 focus:ring-blue-500/10
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((prev) => !prev)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        className="
                          absolute right-3.5 top-1/2
                          -translate-y-1/2 text-slate-400
                          transition hover:text-blue-600
                        "
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={Boolean(isLoading)}
                    className="
                      mt-1 flex h-11 w-full items-center
                      justify-center gap-2 rounded-lg
                      bg-blue-600 text-sm font-semibold
                      text-white shadow-sm shadow-blue-600/20
                      transition hover:bg-blue-700
                      active:scale-[0.99]
                      disabled:cursor-not-allowed disabled:opacity-60
                    "
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>

                {/* LOGIN LINK */}
                <div className="mt-5 text-center">
                  <p className="text-xs text-slate-500">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-bold text-blue-600 hover:text-blue-700"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>

                {/* SECURITY FOOTER */}
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck
                      size={14}
                      className="text-green-600"
                    />
                    Secure account authentication
                  </div>

                  <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">
                    By creating an account, you agree to ELENZO's{" "}
                    <Link
                      href="/terms"
                      className="text-blue-600 hover:underline"
                    >
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>.
                  </p>

                  <Link
                    href="/"
                    className="
                      mt-3 block text-center text-xs
                      font-medium text-slate-500
                      transition hover:text-blue-600
                    "
                  >
                    ← Back to shopping
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
