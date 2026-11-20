"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

import {
  X,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { loginUser } from "@/store/thunks/authThunks";
import axiosInstance from "@/lib/axios";

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const router = useRouter();
  const { dispatch, isLoading } = useAuth();

  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  // CLIENT MOUNT
  useEffect(() => {
    setMounted(true);
  }, []);

  // MODAL OPEN / CLOSE
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = requestAnimationFrame(() => {
      modalRef.current?.querySelector("input")?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }

      if (event.key === "Tab" && modalRef.current) {
        const elements = modalRef.current.querySelectorAll(
          "button:not([disabled]), input:not([disabled]), a[href]",
        );

        if (!elements.length) return;

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  // INPUT CHANGE
  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFormError("");
    setEmailNotVerified(false);
    setResendMessage("");
  };

  // LOGIN SUBMIT
  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setEmailNotVerified(false);
    setResendMessage("");

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setFormError("Please enter your email and password.");
      return;
    }

    try {
      const response = await dispatch(loginUser({ email, password })).unwrap();

      onClose?.();

      const role = response?.user?.role || response?.role;

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error) {
      const errorCode = error?.code || error?.response?.data?.code;

      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message ||
            error?.response?.data?.message ||
            "Invalid email or password. Please try again.";

      if (errorCode === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
        setFormError("Please verify your email before logging in.");
      } else {
        setFormError(errorMessage);
      }
    }
  };

  // RESEND VERIFICATION EMAIL
  const handleResendVerification = async () => {
    try {
      setResendingEmail(true);
      setResendMessage("");
      setFormError("");

      await axiosInstance.post("/auth/resend-verification", {
        email: formData.email.trim(),
      });

      setResendMessage(
        "If your account needs verification, a new verification email has been sent.",
      );
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
          "Unable to resend verification email. Please try again.",
      );
    } finally {
      setResendingEmail(false);
    }
  };

  // GOOGLE LOGIN
  const handleGoogleLogin = () => {
    setFormError("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setFormError("Authentication server URL is not configured.");
      return;
    }

    window.location.href = `${apiUrl.replace(/\/$/, "")}/auth/google`;
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      {/* LOGIN MODAL */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="relative my-auto w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* TOP ACCENT */}
        <div className="h-1 w-full bg-blue-600" />

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login modal"
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <X size={20} />
        </button>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          {/* BRAND */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Smartphone size={21} />
            </span>

            <span className="text-lg font-extrabold text-slate-900">
              Mobi <span className="text-blue-600">Hub</span>
            </span>
          </div>

          {/* HEADING */}
          <div className="mb-5 text-center">
            <h2
              id="login-modal-title"
              className="text-xl font-bold text-slate-900"
            >
              Welcome back!
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sign in to continue shopping.
            </p>
          </div>

          {/* ERROR */}
          {formError && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600"
            >
              {formError}
            </div>
          )}

          {/* EMAIL VERIFICATION ACTION */}
          {emailNotVerified && (
            <div className="mb-4 space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <Mail size={18} className="mt-0.5 shrink-0 text-amber-600" />

                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Email verification required
                  </p>

                  <p className="mt-1 break-all text-xs leading-5 text-amber-700">
                    {formData.email.trim()}
                  </p>
                </div>
              </div>

              {resendMessage && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-2 text-xs text-green-700"
                >
                  <CheckCircle2 size={15} className="shrink-0" />
                  {resendMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingEmail}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resendingEmail ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Resend Verification Email
                  </>
                )}
              </button>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* EMAIL */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="flex items-center justify-between gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                Remember me
              </label>

              <a
                href="/forgot-password"
                onClick={onClose}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </a>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={Boolean(isLoading)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* GOOGLE */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-1.9 4.6-4 6v5h6.5c3.8-3.5 6.1-8.6 6.1-14.7z"
              />
              <path
                fill="#34A853"
                d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.5-5c-1.8 1.2-4.1 1.9-7 1.9-5.3 0-9.8-3.6-11.4-8.4H5.9v5.2C9.3 39.5 16 44 24 44z"
              />
              <path
                fill="#FBBC05"
                d="M12.6 27.7a12 12 0 0 1 0-7.4v-5.2H5.9a20 20 0 0 0 0 17.8l6.7-5.2z"
              />
              <path
                fill="#EA4335"
                d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.9 29.5 4 24 4 16 4 9.3 8.5 5.9 15.1l6.7 5.2c1.6-4.8 6.1-8.4 11.4-8.4z"
              />
            </svg>
            Continue with Google
          </button>

          {/* REGISTER SWITCH */}
          <p className="mt-5 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign Up
            </button>
          </p>

          {/* SECURITY */}
          <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
            <ShieldCheck size={14} className="text-green-600" />
            Secure and protected login
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
