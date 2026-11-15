"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";

import {
  updateUserProfile,
  changeUserPassword,
} from "@/store/thunks/authThunks";
import { clearCredentials, updateUser } from "@/store/slices/authSlice";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Animation variants
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

function ProfilePageContent() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user } = useSelector((state) => state.auth);

  // Scroll progress
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setProfileError("");
    setProfileSuccess("");

    const name = profileForm.name.trim();
    const phone = profileForm.phone.trim();

    if (name.length < 2) {
      setProfileError("Name must be at least 2 characters.");
      return;
    }

    if (name.length > 50) {
      setProfileError("Name cannot exceed 50 characters.");
      return;
    }

    if (phone && !/^[+]?[\d\s()-]{7,20}$/.test(phone)) {
      setProfileError("Please enter a valid phone number.");
      return;
    }

    setProfileLoading(true);

    try {
      const result = await dispatch(
        updateUserProfile({
          name,
          phone: phone || null,
        }),
      ).unwrap();

      dispatch(updateUser(result));

      setProfileSuccess("Profile updated successfully.");
    } catch (error) {
      setProfileError(
        typeof error === "string"
          ? error
          : "Unable to update profile. Please try again.",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    setPasswordLoading(true);

    try {
      await dispatch(
        changeUserPassword({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      ).unwrap();

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordSuccess("Password changed successfully.");

      // Backend clears authentication cookies.
      dispatch(clearCredentials());

      router.replace("/login");
    } catch (error) {
      setPasswordError(
        typeof error === "string"
          ? error
          : "Unable to change password. Please try again.",
      );

      setPasswordLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  const sectionHeader = (Icon, title, description) => (
    <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={22} />
      </div>

      <div>
        <h2 className="font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">{description}</p>
      </div>
    </div>
  );

  const PasswordInput = ({
    id,
    name,
    label,
    value,
    visible,
    toggle,
    placeholder,
    autoComplete,
  }) => (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={handlePasswordChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`${inputClass} pr-12`}
        />

        <button
          type="button"
          onClick={toggle}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600"
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      {/* Blue Scroll Progress */}
      <motion.div
        className="fixed left-0 top-0 z-[100] h-1 w-full origin-left bg-gradient-to-r from-[#0755E9] via-[#2583FF] to-cyan-400"
        style={{ scaleX: smoothProgress }}
      />

      <div className="mx-auto w-full">
        {/* Page Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={fadeUp}>
            <Link
              href="/account"
              className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Back to My Account
            </Link>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-8 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                    My Account
                  </span>
                </div>

                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  Profile Settings
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Manage your personal information and account security.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white">
                  <User size={21} />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-600">
                    Welcome back
                  </p>
                  <p className="max-w-[180px] truncate text-sm font-bold text-slate-900">
                    {user?.name || "Customer"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Personal Information */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md lg:col-span-2"
          >
            {sectionHeader(
              User,
              "Personal Information",
              "Update your personal account details.",
            )}

            <form
              onSubmit={handleProfileSubmit}
              className="space-y-6 p-5 sm:p-7"
            >
              {profileError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <AlertCircle size={18} />
                  {profileError}
                </motion.div>
              )}

              {profileSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="status"
                  className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                  <CheckCircle2 size={18} />
                  {profileSuccess}
                </motion.div>
              )}

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-5"
              >
                <motion.div variants={fadeUp}>
                  <label htmlFor="name" className={labelClass}>
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                      maxLength={50}
                      required
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <label htmlFor="email" className={labelClass}>
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      className={`${inputClass} cursor-not-allowed bg-slate-50 pl-11 text-slate-500`}
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Email address cannot be changed here.
                  </p>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <label htmlFor="phone" className={labelClass}>
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                      maxLength={20}
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </motion.div>
              </motion.div>

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <motion.button
                  type="submit"
                  disabled={profileLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />
                  {profileLoading ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </form>
          </motion.section>

          {/* Account Information */}
          <motion.aside
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -4 }}
            className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ShieldCheck size={23} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Account Information
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Your account details.
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <p className="text-xs font-medium text-slate-400">
                  Account Name
                </p>
                <p className="mt-1 break-words text-sm font-bold text-slate-900">
                  {user?.name || "Not available"}
                </p>
              </div>

              <div className="border-b border-slate-100 pb-4">
                <p className="text-xs font-medium text-slate-400">
                  Account Role
                </p>
                <p className="mt-1 text-sm font-bold capitalize text-slate-900">
                  {user?.role || "Customer"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Email Verification
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      user?.isEmailVerified ? "bg-green-500" : "bg-amber-500"
                    }`}
                  />

                  <p
                    className={`text-sm font-bold ${
                      user?.isEmailVerified
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    {user?.isEmailVerified ? "Verified" : "Not verified"}
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Change Password */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md lg:col-span-3"
          >
            {sectionHeader(
              Lock,
              "Change Password",
              "Update your password to keep your account secure.",
            )}

            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-6 p-5 sm:p-7"
            >
              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <AlertCircle size={18} />
                  {passwordError}
                </motion.div>
              )}

              {passwordSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="status"
                  className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                  <CheckCircle2 size={18} />
                  {passwordSuccess}
                </motion.div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <PasswordInput
                    id="currentPassword"
                    name="currentPassword"
                    label="Current Password"
                    value={passwordForm.currentPassword}
                    visible={showCurrentPassword}
                    toggle={() =>
                      setShowCurrentPassword((previous) => !previous)
                    }
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                </div>

                <div>
                  <PasswordInput
                    id="newPassword"
                    name="newPassword"
                    label="New Password"
                    value={passwordForm.newPassword}
                    visible={showNewPassword}
                    toggle={() => setShowNewPassword((previous) => !previous)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Minimum 8 characters.
                  </p>
                </div>

                <div>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm New Password"
                    value={passwordForm.confirmPassword}
                    visible={showConfirmPassword}
                    toggle={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <motion.button
                  type="submit"
                  disabled={passwordLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Lock size={17} />
                  {passwordLoading ? "Updating..." : "Change Password"}
                </motion.button>
              </div>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
