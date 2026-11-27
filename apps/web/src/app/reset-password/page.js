"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Headphones,
} from "lucide-react";
import Logo from "@/components/layout/navbar/Logo";
import authService from "@/services/authService";
import { motion } from "motion/react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [currentYear, setCurrentYear] = useState("");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setCurrentYear(String(new Date().getFullYear()));
  }, []);

  const getPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setValidationError("");
    setSuccessMessage("");

    if (!token) {
      setValidationError(
        "Invalid or missing password reset link. Please request a new link.",
      );
      return;
    }

    if (formData.password.length < 8) {
      setValidationError("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await authService.resetPassword({
        token,
        password: formData.password,
      });

      if (response?.success) {
        setIsSubmitted(true);

        setSuccessMessage(
          response.message || "Your password has been reset successfully.",
        );

        setFormData({
          password: "",
          confirmPassword: "",
        });
      } else {
        setValidationError(response?.message || "Unable to reset password.");
      }
    } catch (error) {
      setValidationError(
        error?.response?.data?.message ||
        "Unable to reset password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
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
          <div className="relative z-10">
            <Logo variant="white" />
          </div>

          <div className="relative z-10 max-w-md">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-blue-100">
              <ShieldCheck size={15} />
              Account Security
            </span>

            <h1 className="text-3xl font-bold leading-tight xl:text-4xl">
              Secure your account.
              <span className="mt-1 block text-blue-300">Start fresh.</span>
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100/80">
              Create a strong new password to protect your personal information,
              orders and account details with ELENZO.
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
            © {currentYear} ELENZO. All rights reserved.
          </p>
        </motion.section>

        {/* RIGHT RESET PASSWORD SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          className="flex items-center justify-center px-4 py-7 sm:px-6 lg:px-8"
        >
          <div className="w-full max-w-[400px]">
            {/* MOBILE BRAND */}
            <div className="mb-7 flex justify-center lg:hidden">
              <Logo />
            </div>

            {/* HEADER */}
            <div className="mb-6">
              <p className="mb-2 text-xs font-semibold tracking-wide text-blue-600">
                ACCOUNT RECOVERY
              </p>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {isSubmitted ? "Password updated!" : "Create new password"}
              </h2>

              <p className="mt-2 text-sm leading-5 text-slate-500">
                {isSubmitted
                  ? "Your account password has been successfully updated."
                  : "Create a strong password to secure your ELENZO account."}
              </p>
            </div>

            {/* SUCCESS STATE */}
            {isSubmitted ? (
              <motion.div
                key="reset-success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                >
                  <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

                  <div>
                    <p className="font-semibold">Password reset successful!</p>
                    <p className="mt-1 leading-5">{successMessage}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.replace("/login")}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Continue to Login
                  <ArrowRight size={17} />
                </button>
              </motion.div>
            ) : !token ? (
              /* INVALID TOKEN STATE */
              <motion.div
                key="invalid-token"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700"
                >
                  Invalid or missing password reset link. Please request a new
                  reset link.
                </div>

                <Link
                  href="/forgot-password"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Request New Reset Link
                  <ArrowRight size={17} />
                </Link>
              </motion.div>
            ) : (
              /* RESET PASSWORD FORM */
              <motion.form
                key="reset-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* NEW PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* PASSWORD STRENGTH */}
                  {formData.password && (
                    <div className="pt-2.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength >= level
                              ? passwordStrength <= 2
                                ? "bg-red-500"
                                : passwordStrength <= 3
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              : "bg-slate-200"
                              }`}
                          />
                        ))}
                      </div>

                      <p className="mt-1.5 text-xs text-slate-500">
                        Password strength:{" "}
                        <span className="font-semibold">
                          {passwordStrength <= 2
                            ? "Weak"
                            : passwordStrength <= 3
                              ? "Medium"
                              : "Strong"}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
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
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {/* VALIDATION ERROR */}
                {validationError && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                  >
                    {validationError}
                  </div>
                )}

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {/* SECURITY FOOTER */}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-blue-600" size={26} />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
