
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
} from "lucide-react";

import {
  updateUserProfile,
  changeUserPassword,
  logoutUser,
} from "@/store/thunks/authThunks";
import { clearCredentials, updateUser } from "@/store/slices/authSlice";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function ProfilePageContent() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user } = useSelector((state) => state.auth);

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

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordForm;

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
      setPasswordError(
        "New password must be different from current password.",
      );
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

      // Backend has cleared authentication cookies.
      // Clear local Redux authentication state as well.
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
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to My Account
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Profile Settings
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your personal information and account security.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Information */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-2">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <User size={21} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Personal Information
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Update your account details.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5 p-5 sm:p-6">
              {profileError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div
                  role="status"
                  className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                  {profileSuccess}
                </div>
              )}

              <div>
                <label htmlFor="name" className={labelClass}>
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className={`${inputClass} cursor-not-allowed bg-slate-50 pl-10 text-slate-500`}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Email address cannot be changed here.
                </p>
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter your phone number"
                    maxLength={20}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />
                  {profileLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>

          {/* Account Information */}
          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Account Information
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Your account details.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500">Account Name</p>
                <p className="mt-1 break-words text-sm font-medium text-slate-900">
                  {user?.name || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Account Role</p>
                <p className="mt-1 text-sm font-medium capitalize text-slate-900">
                  {user?.role || "Customer"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Email Verification</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {user?.isEmailVerified ? "Verified" : "Not verified"}
                </p>
              </div>
            </div>
          </aside>

          {/* Change Password */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-3">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Lock size={21} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Change Password
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Update your password to keep your account secure.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5 p-5 sm:p-6">
              {passwordError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div
                  role="status"
                  className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                  {passwordSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="currentPassword"
                    className={labelClass}
                  >
                    Current Password
                  </label>

                  <div className="relative">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
                      placeholder="Enter current password"
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword((previous) => !previous)
                      }
                      aria-label={
                        showCurrentPassword
                          ? "Hide current password"
                          : "Show current password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className={labelClass}>
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword((previous) => !previous)
                      }
                      aria-label={
                        showNewPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showNewPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Minimum 8 characters.
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className={labelClass}>
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      placeholder="Confirm new password"
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((previous) => !previous)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Lock size={17} />
                  {passwordLoading ? "Updating..." : "Change Password"}
                </button>
              </div>
            </form>
          </section>
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
