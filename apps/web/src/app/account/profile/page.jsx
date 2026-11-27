"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Pencil,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountShell from "@/components/account/AccountShell";
import {
  updateUserProfile,
  changeUserPassword,
} from "@/store/thunks/authThunks";
import { clearCredentials, updateUser } from "@/store/slices/authSlice";

function getInitials(name = "") {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "EL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const inputClass =
  "w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#101828] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0755E9] focus:bg-white focus:ring-2 focus:ring-[#0755E9]/15 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass = "mb-1.5 block text-xs font-bold text-[#101828]";

function PasswordField({
  id,
  name,
  label,
  value,
  visible,
  onToggle,
  onChange,
  placeholder,
  autoComplete,
  disabled,
}) {
  return (
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
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          className={`${inputClass} pr-11`}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#64748B] transition hover:text-[#0755E9]"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

function ProfilePageContent() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user } = useSelector((state) => state.auth || {});

  const [activeNavSection, setActiveNavSection] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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
    const syncHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#password") {
        setActiveNavSection("password");
      } else {
        setActiveNavSection("profile");
      }
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

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
    setProfileForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleCancelEdit = () => {
    setProfileForm({
      name: user?.name || "",
      phone: user?.phone || "",
    });
    setProfileError("");
    setProfileSuccess("");
    setIsEditingProfile(false);
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
        })
      ).unwrap();

      dispatch(updateUser(result));
      setProfileSuccess("Profile updated successfully.");
      toast.success("Profile updated successfully.");
      setIsEditingProfile(false);
    } catch (err) {
      setProfileError(
        typeof err === "string"
          ? err
          : "Unable to update profile. Please try again."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((previous) => ({ ...previous, [name]: value }));
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
        })
      ).unwrap();

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordSuccess("Password updated successfully. Redirecting to login...");
      toast.success("Password updated. Please sign in again.");

      dispatch(clearCredentials());
      router.replace("/login");
    } catch (err) {
      setPasswordError(
        typeof err === "string"
          ? err
          : "Unable to change password. Please try again."
      );
      setPasswordLoading(false);
    }
  };

  return (
    <AccountShell
      activeSection={activeNavSection}
      breadcrumbLabel="Profile & Security"
      title="My Profile & Security"
      description="View and update your personal details, verify account status, and manage your password."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Personal Information Card */}
          <section
            aria-labelledby="profile-info-heading"
            className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white xl:col-span-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0755E9] text-sm font-extrabold text-white">
                  {getInitials(user?.name)}
                </div>

                <div>
                  <h2
                    id="profile-info-heading"
                    className="text-base font-bold text-[#101828]"
                  >
                    Personal Information
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Your verified ELENZO customer details
                  </p>
                </div>
              </div>

              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileError("");
                    setProfileSuccess("");
                    setIsEditingProfile(true);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#0755E9] bg-[#EFF6FF] px-3.5 text-xs font-bold text-[#0755E9] transition hover:bg-[#0755E9] hover:text-white"
                >
                  <Pencil size={13} aria-hidden="true" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            <div className="p-5 sm:p-6">
              {profileError && (
                <div
                  role="alert"
                  className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 sm:text-sm"
                >
                  <AlertCircle size={17} className="shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div
                  role="status"
                  className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 sm:text-sm"
                >
                  <CheckCircle2 size={17} className="shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                        aria-hidden="true"
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
                        disabled={profileLoading}
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
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                        aria-hidden="true"
                      />
                      <input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        readOnly
                        className={`${inputClass} cursor-not-allowed bg-slate-100 pl-10 text-[#64748B]`}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#64748B]">
                      Email address cannot be updated directly for security reasons.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                        aria-hidden="true"
                      />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        placeholder="Enter your phone number"
                        maxLength={20}
                        disabled={profileLoading}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-2.5 border-t border-[#E2E8F0] pt-4 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={profileLoading}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#64748B] transition hover:bg-slate-50 hover:text-[#101828] disabled:opacity-50"
                    >
                      <X size={15} />
                      <span>Cancel</span>
                    </button>

                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0645C4] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {profileLoading ? (
                        <LoaderCircle size={15} className="animate-spin" />
                      ) : (
                        <Save size={15} />
                      )}
                      <span>{profileLoading ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                      Full Name
                    </dt>
                    <dd className="mt-1 text-sm font-bold text-[#101828]">
                      {user?.name || "Not provided"}
                    </dd>
                  </div>

                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                      Phone Number
                    </dt>
                    <dd className="mt-1 text-sm font-bold text-[#101828] tabular-nums">
                      {user?.phone || "Not added yet"}
                    </dd>
                  </div>

                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 sm:col-span-2">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                      Email Address
                    </dt>
                    <dd className="mt-1 break-all text-sm font-bold text-[#101828]">
                      {user?.email || "Not available"}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </section>

          {/* Account Status Card */}
          <aside className="h-fit rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
                <ShieldCheck size={19} aria-hidden="true" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-[#101828]">
                  Account Information
                </h2>
                <p className="text-[11px] text-[#64748B]">
                  Verification &amp; membership details
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Account Role
                </p>
                <p className="mt-1 text-sm font-bold capitalize text-[#101828]">
                  {user?.role || "Customer"}
                </p>
              </div>

              <div className="border-t border-[#E2E8F0] pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Email Verification
                </p>

                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      user?.isEmailVerified ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      user?.isEmailVerified
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {user?.isEmailVerified ? "Verified" : "Pending Verification"}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Change Password Section */}
        <section
          id="password"
          aria-labelledby="change-password-heading"
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white"
        >
          <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-4 sm:px-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
              <Lock size={19} aria-hidden="true" />
            </div>

            <div>
              <h2
                id="change-password-heading"
                className="text-base font-bold text-[#101828]"
              >
                Change Password
              </h2>
              <p className="text-xs text-[#64748B]">
                Update your password to keep your ELENZO account protected
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5 p-5 sm:p-6">
            {passwordError && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 sm:text-sm"
              >
                <AlertCircle size={17} className="shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 sm:text-sm"
              >
                <CheckCircle2 size={17} className="shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <PasswordField
                id="currentPassword"
                name="currentPassword"
                label="Current Password"
                value={passwordForm.currentPassword}
                visible={showCurrentPassword}
                onToggle={() => setShowCurrentPassword((v) => !v)}
                onChange={handlePasswordChange}
                placeholder="Current password"
                autoComplete="current-password"
                disabled={passwordLoading}
              />

              <div>
                <PasswordField
                  id="newPassword"
                  name="newPassword"
                  label="New Password"
                  value={passwordForm.newPassword}
                  visible={showNewPassword}
                  onToggle={() => setShowNewPassword((v) => !v)}
                  onChange={handlePasswordChange}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  disabled={passwordLoading}
                />
              </div>

              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm New Password"
                value={passwordForm.confirmPassword}
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((v) => !v)}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={passwordLoading}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">
              <p className="text-xs text-[#64748B]">
                After updating your password, you will be asked to sign in again.
              </p>

              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#082B70] px-5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0755E9] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
              >
                {passwordLoading ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <Lock size={15} aria-hidden="true" />
                )}
                <span>{passwordLoading ? "Updating..." : "Update Password"}</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </AccountShell>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
