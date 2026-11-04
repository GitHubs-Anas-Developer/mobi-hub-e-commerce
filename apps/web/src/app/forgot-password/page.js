"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");
    setIsSubmitted(false);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    // Frontend demo only.
    // Actual email verification will be implemented later.
    setIsSubmitted(true);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setIsSubmitted(false);
    setError("");
  };

  return (
    <div className="min-h-screen flex font-sans antialiased">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#F8FAFC] flex-col justify-between p-12 border-r border-[#E2E8F0]">
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

        <div>
          <h2 className="text-3xl font-bold text-[#0F172A] leading-tight mb-4">
            Secure access to your tech hub.
          </h2>

          <p className="text-base text-[#64748B] max-w-sm">
            Lost your password? Don't worry, we'll help you regain access to
            your orders, wishlist, and exclusive tech deals.
          </p>
        </div>

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
          <div className="mb-8">
            <h1 className="text-[32px] font-bold text-[#0F172A] tracking-tight mb-2">
              Forgot password
            </h1>

            <p className="text-base text-[#64748B]">
              Enter your registered email address to continue with password
              recovery.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#0F172A]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="w-full h-12 px-4 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#64748B] outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-all shadow-sm"
              />
            </div>

            {/* Success Message */}
            {isSubmitted && (
              <div
                role="status"
                className="p-3 rounded-lg text-sm bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]"
              >
                Email submitted successfully. Password recovery will be
                available once email verification is implemented.
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="p-3 rounded-lg text-sm bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!email.trim()}
              className="w-full h-12 mt-4 bg-[#1D4ED8] hover:bg-blue-800 text-white font-semibold text-base rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              Continue
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-[#64748B] mt-8">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-[#1D4ED8] font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
