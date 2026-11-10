"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const accountLinks = [
  {
    title: "My Orders",
    description: "Track, view and manage your orders.",
    href: "/account/orders",
    icon: "📦",
  },
  {
    title: "My Profile",
    description: "View and update your personal information.",
    href: "/account/profile",
    icon: "👤",
  },
  {
    title: "My Wishlist",
    description: "Find products you have saved.",
    href: "/wishlist",
    icon: "♡",
  },
  {
    title: "Saved Addresses",
    description: "Manage your delivery addresses.",
    href: "/account/addresses",
    icon: "📍",
  },
];

function AccountContent() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">MOBI HUB</p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            My Account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Welcome back! Manage your account and shopping activities.
          </p>
        </div>

        {/* Welcome Card */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-blue-700 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Welcome to MOBI HUB!
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100">
                Your account dashboard is the place to manage your orders,
                profile, wishlist and delivery addresses.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex w-fit items-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Continue Shopping →
            </Link>
          </div>
        </div>

        {/* Account Sections */}
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">Account Overview</h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose a section to manage your account.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {accountLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-700 transition group-hover:bg-blue-100">
                {item.icon}
              </div>

              <h3 className="mt-5 font-bold text-slate-900 group-hover:text-blue-700">
                {item.title}
              </h3>

              <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                {item.description}
              </p>

              <span className="mt-5 inline-flex items-center text-sm font-semibold text-blue-600">
                Manage
                <span className="ml-2 transition group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>

        {/* Shopping Link */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">
            Looking for something new?
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Explore our latest tech accessories and discover your next favourite
            product.
          </p>

          <Link
            href="/products"
            className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Explore Products
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}
