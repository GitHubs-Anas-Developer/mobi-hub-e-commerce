"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import authService from "@/services/authService";

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

  // Password strength
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

  // Reset Password API
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

        setSuccessMessage(response.message || "Password reset successful.");

        setFormData({
          password: "",
          confirmPassword: "",
        });
      } else {
        setValidationError(response?.message || "Unable to reset password.");
      }
    } catch (error) {
      setValidationError(
        error.response?.data?.message ||
          "Unable to reset password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans antialiased">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#F8FAFC] flex-col justify-between p-12 border-r border-[#E2E8F0]">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-10 h-10 bg-[#1D4ED8] rounded-xl flex items-center justify-center shadow-md">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>

          <span className="text-2xl font-bold text-[#1D4ED8] tracking-tight">
            MOBI HUB
          </span>
        </Link>

        {/* Hero Content */}
        <div>
          <h2 className="text-3xl font-bold text-[#0F172A] leading-tight mb-4">
            Secure your digital lifestyle.
          </h2>

          <p className="text-base text-[#64748B] max-w-sm">
            Create a strong, new password to protect your personal information,
            orders, and payment details.
          </p>
        </div>

        {/* Footer */}
        <div className="text-sm text-[#64748B]">
          © {currentYear} MOBI HUB. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto">
        {/* Mobile Logo */}
        <Link
          href="/"
          className="flex lg:hidden items-center gap-2.5 mb-10 mt-6"
        >
          <div className="w-8 h-8 bg-[#1D4ED8] rounded-lg flex items-center justify-center shadow-sm">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>

          <span className="text-xl font-bold text-[#1D4ED8] tracking-tight">
            MOBI HUB
          </span>
        </Link>

        {/* Form Container */}
        <div className="w-full max-w-[420px] my-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[32px] font-bold text-[#0F172A] tracking-tight mb-2">
              Create new password
            </h1>

            <p className="text-base text-[#64748B]">
              Create a strong password for your MOBI HUB account.
            </p>
          </div>

          {/* Success State */}
          {isSubmitted ? (
            <div className="space-y-5">
              <div
                role="status"
                className="p-4 rounded-lg text-sm bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]"
              >
                <div className="font-semibold mb-1">
                  Password reset successful!
                </div>

                {successMessage}
              </div>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full h-12 bg-[#1D4ED8] hover:bg-blue-800 text-white font-semibold text-base rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Continue to Login
              </button>
            </div>
          ) : !token ? (
            /* Invalid Token State */
            <div className="space-y-5">
              <div
                role="alert"
                className="p-4 rounded-lg text-sm bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
              >
                Invalid or missing password reset link. Please request a new
                reset link.
              </div>

              <Link
                href="/forgot-password"
                className="block w-full text-center h-12 leading-[48px] bg-[#1D4ED8] hover:bg-blue-800 text-white font-semibold rounded-lg"
              >
                Request New Reset Link
              </Link>
            </div>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#0F172A]"
                >
                  New Password
                </label>

                <div className="relative flex items-center">
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
                    className="w-full h-12 pl-4 pr-16 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#64748B] outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-all shadow-sm"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 text-xs font-medium text-[#64748B] hover:text-[#1D4ED8] transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="pt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            passwordStrength >= level
                              ? passwordStrength <= 2
                                ? "bg-red-500"
                                : passwordStrength <= 3
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-[#64748B] mt-1">
                      Password strength:{" "}
                      {passwordStrength <= 2
                        ? "Weak"
                        : passwordStrength <= 3
                          ? "Medium"
                          : "Strong"}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-[#0F172A]"
                >
                  Confirm Password
                </label>

                <div className="relative flex items-center">
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
                    className="w-full h-12 pl-4 pr-16 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#64748B] outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-all shadow-sm"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 text-xs font-medium text-[#64748B] hover:text-[#1D4ED8] transition-colors"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Validation Error */}
              {validationError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg text-sm bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
                >
                  {validationError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 mt-4 bg-[#1D4ED8] hover:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold text-base rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Resetting Password...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <p className="text-center text-sm text-[#64748B] mt-8">
            <Link
              href="/login"
              className="text-[#1D4ED8] font-medium hover:underline inline-flex items-center justify-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-[#64748B]">
          Loading reset password page...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
