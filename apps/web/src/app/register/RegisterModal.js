
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  X,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { registerUser } from "@/store/thunks/authThunks";

export default function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}) {
  const { dispatch, isLoading } = useAuth();

  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const successTimerRef = useRef(null);

  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );

        if (!elements.length) return;

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
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

  // CLEANUP SUCCESS TIMER
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  // INPUT CHANGE
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormError("");
    setSuccessMessage("");
  };

  // REGISTER SUBMIT
  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

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
        })
      ).unwrap();

      setSuccessMessage(
        "Account created successfully! Opening login..."
      );

      successTimerRef.current = setTimeout(() => {
        onSwitchToLogin?.();
      }, 1500);
    } catch (error) {
      setFormError(
        typeof error === "string"
          ? error
          : error?.message ||
              "Registration failed. Please try again."
      );
    }
  };

  if (!mounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="relative my-auto w-full max-w-[400px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-black/20 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* TOP ACCENT */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400" />

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close register modal"
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <X size={18} />
        </button>

        <div className="px-4 py-5 sm:px-6 sm:py-6">

          {/* BRAND */}
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Smartphone size={21} />
              </span>

              <span>
                <span className="block text-lg font-extrabold tracking-tight text-slate-900">
                  Mobi <span className="text-blue-600">Hub</span>
                </span>

                <span className="block text-[9px] font-semibold tracking-[1.2px] text-slate-400">
                  MOBILE ACCESSORIES STORE
                </span>
              </span>
            </div>
          </div>

          {/* HEADING */}
          <div className="mb-5 text-center">
            <h2
              id="register-modal-title"
              className="text-xl font-bold tracking-tight text-slate-900"
            >
              Create your account
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Join Mobi Hub and discover amazing tech accessories.
            </p>
          </div>

          {/* ERROR */}
          {formError && (
            <div
              role="alert"
              className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600"
            >
              {formError}
            </div>
          )}

          {/* SUCCESS */}
          {successMessage && (
            <div
              role="status"
              className="mb-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-medium text-green-700"
            >
              <CheckCircle2 size={16} />
              {successMessage}
            </div>
          )}

          {/* REGISTER FORM */}
          <form onSubmit={handleSubmit} className="space-y-3">

            {/* FULL NAME */}
            <div>
              <label
                htmlFor="register-name"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
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
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="register-email"
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
                  id="register-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="register-password"
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
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
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
                htmlFor="register-confirm-password"
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
                  id="register-confirm-password"
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
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
              disabled={Boolean(isLoading) || Boolean(successMessage)}
              className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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

          {/* SECURITY */}
          <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
            <ShieldCheck size={14} className="text-green-600" />
            Your information is secure and protected.
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
