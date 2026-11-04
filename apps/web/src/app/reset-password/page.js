
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [validationError, setValidationError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationError("");
    setIsSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setValidationError("");
    setIsSubmitted(false);

    if (formData.password.length < 8) {
      setValidationError(
        "Password must be at least 8 characters long.",
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    // Frontend validation only.
    // Actual password update will be implemented later.

    setIsSubmitted(true);

    setFormData({
      password: "",
      confirmPassword: "",
    });
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
          © {new Date().getFullYear()} MOBI HUB. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto">

        {/* Mobile Logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10 mt-6">
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
        </div>

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

          {isSubmitted ? (
            /* Success State */
            <div className="space-y-5">
              <div
                role="status"
                className="p-4 rounded-lg text-sm bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]"
              >
                Password details validated successfully. Actual password
                updating will be enabled after backend integration.
              </div>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full h-12 bg-[#1D4ED8] hover:bg-blue-800 text-white font-semibold text-base rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Continue to Login
              </button>
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
                    className="w-full h-12 pl-4 pr-12 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#64748B] outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-all shadow-sm"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-4 text-[#64748B] hover:text-[#0F172A] transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
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
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full h-12 pl-4 pr-12 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#64748B] outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-all shadow-sm"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="absolute right-4 text-[#64748B] hover:text-[#0F172A] transition-colors"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
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
                className="w-full h-12 mt-4 bg-[#1D4ED8] hover:bg-blue-800 text-white font-semibold text-base rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Reset Password
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
