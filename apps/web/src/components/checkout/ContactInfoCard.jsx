"use client";

import Link from "next/link";
import { UserRound, Mail, Phone, CheckCircle2 } from "lucide-react";

export default function ContactInfoCard({ user, selectedAddressDetails }) {
  const accountName = user?.name || "";
  const accountEmail = user?.email || "";
  const accountPhone = user?.phone || selectedAddressDetails?.phone || "";

  if (!accountName && !accountEmail && !accountPhone) {
    return null;
  }

  return (
    <section
      aria-labelledby="checkout-contact-heading"
      className="rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
            <UserRound size={17} aria-hidden="true" />
          </div>

          <div>
            <h2
              id="checkout-contact-heading"
              className="text-base font-bold text-[#101828] sm:text-lg"
            >
              Contact Information
            </h2>
            <p className="text-xs text-[#64748B]">
              Order confirmation and updates will be sent here
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 size={12} aria-hidden="true" />
            Verified Account
          </span>

          <Link
            href="/account/profile"
            className="text-xs font-semibold text-[#0755E9] hover:text-[#082B70] hover:underline"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[#E2E8F0] pt-4 sm:grid-cols-3">
        {accountName && (
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Account Name
            </p>
            <p className="mt-1 truncate text-xs font-bold text-[#101828] sm:text-sm">
              {accountName}
            </p>
          </div>
        )}

        {accountEmail && (
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              <Mail size={11} aria-hidden="true" />
              Email
            </p>
            <p className="mt-1 truncate text-xs font-bold text-[#101828] sm:text-sm">
              {accountEmail}
            </p>
          </div>
        )}

        {accountPhone && (
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              <Phone size={11} aria-hidden="true" />
              Phone
            </p>
            <p className="mt-1 truncate text-xs font-bold text-[#101828] tabular-nums sm:text-sm">
              {accountPhone}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

