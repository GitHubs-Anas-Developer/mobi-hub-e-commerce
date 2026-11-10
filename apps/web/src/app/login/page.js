
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import { loginUser } from "@/store/thunks/authThunks";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.email.trim() || !formData.password) {
      setFormError("Please enter your email and password.");
      return;
    }

    try {
      const loggedInUser = await dispatch(
        loginUser({
          email: formData.email.trim(),
          password: formData.password,
        }),
      ).unwrap();

      if (loggedInUser?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    } catch (err) {
      setFormError(
        typeof err === "string"
          ? err
          : "Invalid email or password. Please try again.",
      );
    }
  };

  return (
    <div className="flex min-h-screen font-sans antialiased">
      {/* Left Branding Panel */}
      <div className="hidden flex-col justify-between border-r border-[#E2E8F0] bg-[#F8FAFC] p-12 lg:flex lg:w-[40%]">
        <Link href="/" className="flex w-fit items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D4ED8] shadow-md">
            <svg
              className="h-6 w-6 text-white"
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

          <span className="text-2xl font-bold tracking-tight text-[#1D4ED8]">
            MOBI HUB
          </span>
        </Link>

        <div>
          <h2 className="mb-4 text-3xl leading-tight font-bold text-[#0F172A]">
            The premium destination for modern electronics.
          </h2>

          <p className="max-w-sm text-base text-[#64748B]">
            Sign in to access exclusive deals, track your orders, and manage
            your wishlist.
          </p>
        </div>

        <div className="text-sm text-[#64748B]">
          © {new Date().getFullYear()} MOBI HUB. All rights reserved.
        </div>
      </div>

      {/* Right Authentication Panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white p-6 sm:p-12">
        {/* Mobile Logo */}
        <div className="mb-10 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D4ED8] shadow-sm">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18h.01M8 21h8a2 2 0 00-2-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>

          <span className="text-xl font-bold tracking-tight text-[#1D4ED8]">
            MOBI HUB
          </span>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-[32px] font-bold tracking-tight text-[#0F172A]">
              Welcome back
            </h1>

            <p className="text-base text-[#64748B]">
              Enter your details to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                autoComplete="email"
                className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172A] shadow-sm outline-none transition-all placeholder:text-[#64748B] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#0F172A]"
              >
                Password
              </label>

              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-white py-3 pr-12 pl-4 text-sm text-[#0F172A] shadow-sm outline-none transition-all placeholder:text-[#64748B] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 text-[#64748B] transition-colors hover:text-[#0F172A]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
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
                      className="h-5 w-5"
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

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between pt-1 pb-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 cursor-pointer rounded border-[#E2E8F0] text-[#1D4ED8] focus:ring-[#1D4ED8]"
                />

                <span className="text-sm text-[#64748B]">
                  Remember me
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#1D4ED8] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {formError && (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full cursor-pointer rounded-lg bg-[#1D4ED8] text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-[#64748B]">or</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => {
              // Google OAuth handler
            }}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] shadow-sm transition-colors hover:bg-[#F8FAFC]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>

            Sign in with Google
          </button>

          {/* Register Link */}
          <p className="mt-8 text-center text-sm text-[#64748B]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-[#1D4ED8] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
