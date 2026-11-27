"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";

import {
  X,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { BRAND_ASSETS, BRAND_NAME, BRAND_TAGLINE } from "@/config/brand";

import { useAuth } from "@/hooks/useAuth";
import { registerUser } from "@/store/thunks/authThunks";
import axiosInstance from "@/lib/axios";

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const { dispatch, isLoading } = useAuth();

  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [registrationComplete, setRegistrationComplete] = useState(false);

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
      modalRef.current?.querySelector("input, button")?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }

      if (event.key === "Tab" && modalRef.current) {
        const elements = modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
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
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormError("");
    setSuccessMessage("");
    setResendMessage("");
  };

  // REGISTER SUBMIT
  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");
    setResendMessage("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      setFormError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    try {
      await dispatch(
        registerUser({
          name,
          email,
          password,
        }),
      ).unwrap();

      setRegistrationComplete(true);

      setSuccessMessage("Account created successfully!");
    } catch (error) {
      setFormError(
        typeof error === "string"
          ? error
          : error?.message || "Registration failed. Please try again.",
      );
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

  if (!mounted || !isOpen) {
    return null;
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="relative my-auto w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* TOP ACCENT */}
        <div className="h-1 w-full bg-blue-600" />

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close register modal"
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <X size={20} />
        </button>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          {/* BRAND */}
          <div className="mb-4 flex items-center justify-center">
            <img
              src={BRAND_ASSETS.logo}
              alt={`${BRAND_NAME} - ${BRAND_TAGLINE}`}
              className="h-9 w-auto object-contain"
            />
          </div>

          {/* HEADING */}
          <div className="mb-5 text-center">
            <h2
              id="register-modal-title"
              className="text-xl font-bold text-slate-900"
            >
              {registrationComplete
                ? "Verify your email"
                : "Create your account"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {registrationComplete
                ? "One more step to activate your ELENZO account."
                : "Join ELENZO and discover amazing tech & electronics."}
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

          {/* REGISTRATION SUCCESS */}
          {registrationComplete ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Mail size={27} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Check your inbox
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  We have sent a verification link to:
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-blue-600">
                  {formData.email.trim()}
                </p>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Please open the email and click the verification link to
                  activate your ELENZO account. You cannot log in until your
                  email is verified.
                </p>
              </div>

              {/* RESEND MESSAGE */}
              {resendMessage && (
                <div
                  role="status"
                  className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-medium text-green-700"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    {resendMessage}
                  </div>
                </div>
              )}

              {/* RESEND VERIFICATION */}
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingEmail}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
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

              {/* LOGIN BUTTON */}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Continue to Login
                <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <>
              {/* REGISTER FORM */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* FULL NAME */}
                <div>
                  <label
                    htmlFor="register-name"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="register-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="register-email"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="register-email"
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
                    htmlFor="register-password"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      required
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="register-confirm-password"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
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
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {/* REGISTER BUTTON */}
                <button
                  type="submit"
                  disabled={Boolean(isLoading)}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              {/* LOGIN SWITCH */}
              <p className="mt-4 text-center text-xs text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-bold text-blue-600 transition hover:text-blue-700"
                >
                  Login
                </button>
              </p>
            </>
          )}

          {/* SECURITY */}
          <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
            <ShieldCheck size={14} className="text-green-600" />
            Your information is secure and protected.
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
