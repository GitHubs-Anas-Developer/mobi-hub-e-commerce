
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

import { motion, useScroll, useSpring } from "framer-motion";
import { BRAND_NAME, BRAND_SUPPORT_EMAIL } from "@/config/brand";

const footerLinks = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "New Arrivals", href: "/products?sort=newest" },
    {
      label: "Featured Products",
      href: "/products?isFeatured=true",
    },
  ],

  "Customer Service": [
    { label: "My Account", href: "/account" },
    { label: "Track Orders", href: "/account/orders" },
    { label: "Returns & Refunds", href: "/account/returns" },
    { label: "Contact Us", href: "/contact" },
  ],
};

const socialLinks = [
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
];

const contactDetails = [
  {
    icon: Mail,
    text: BRAND_SUPPORT_EMAIL,
  },
  {
    icon: Phone,
    text: "Contact support for assistance",
  },
  {
    icon: MapPin,
    text: "India",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Footer() {
  const [currentYear, setCurrentYear] = useState("2026");

  useEffect(() => {
    setCurrentYear(String(new Date().getFullYear()));
  }, []);

  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <footer className="relative mt-auto w-full overflow-hidden border-t border-[#E2E8F0] bg-white pb-20 text-[#101828] sm:pb-0">

      {/* Scroll Progress */}
      <motion.div
        style={{ scaleX }}
        className="absolute left-0 top-0 z-20 h-[2px] w-full origin-left bg-[#0755E9]"
      />

      {/* Background Decorations */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -left-32 h-72 w-72 rounded-full bg-indigo-100/30 blur-3xl" />

      {/* Main Footer */}
      <div className="mh-container relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 gap-x-5 gap-y-8 py-9 sm:gap-x-8 sm:gap-y-9 sm:py-10 lg:grid-cols-4 lg:gap-8 lg:py-12"
        >

          {/* Brand */}
          <motion.div
            variants={itemVariants}
            className="col-span-2 lg:col-span-1"
          >
            <Link
              href="/"
              className="inline-flex items-center text-xl font-extrabold tracking-tight text-[#101828] sm:text-[22px]"
            >
              ELE<span className="text-[#0755E9]">ZIO</span>
            </Link>

            <p className="mt-3 max-w-sm text-[12px] leading-[1.8] text-[#64748B] sm:text-[13px]">
              Discover quality gadgets and electronics designed to make your everyday
              digital life smarter, easier, and better.
            </p>

            {/* Social Links */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {socialLinks.map(({ label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 18,
                  }}
                  className="flex h-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-3 text-[11px] font-semibold text-[#64748B] transition-colors hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white"
                >
                  {label}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Shop & Customer Service */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <motion.div
              key={heading}
              variants={itemVariants}
              className="min-w-0"
            >
              <h3 className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#101828] sm:text-[13px] sm:tracking-[0.08em]">
                {heading}
              </h3>

              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex max-w-full items-center gap-1 text-[12px] text-[#64748B] transition-colors duration-200 hover:text-[#0755E9] sm:text-[13px]"
                    >
                      <span>{link.label}</span>

                      <ArrowUpRight
                        size={13}
                        className="shrink-0 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact */}
          <motion.div
            variants={itemVariants}
            className="col-span-2 lg:col-span-1"
          >
            <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#101828] sm:text-[13px]">
              Get In Touch
            </h3>

            <ul className="mt-4 space-y-4">
              {contactDetails.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex min-w-0 items-center gap-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
                    <Icon size={16} strokeWidth={1.8} />
                  </div>

                  <span className="min-w-0 break-words text-[12px] leading-5 text-[#64748B] sm:text-[13px]">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

        </motion.div>
      </div>

      {/* Bottom Footer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="relative border-t border-[#E2E8F0] bg-white"
      >
        <div className="mh-container">
          <div className="flex flex-col items-center gap-3 py-5 text-center sm:flex-row sm:justify-between sm:text-left">

            <p className="text-[11px] leading-5 text-[#64748B] sm:text-xs">
              © {currentYear}{" "}
              <span className="font-semibold text-[#101828]">
                {BRAND_NAME}.
              </span>{" "}
              All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-[#64748B] sm:justify-end sm:text-xs">
              <Link
                href="/privacy-policy"
                className="transition-colors hover:text-[#0755E9]"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="transition-colors hover:text-[#0755E9]"
              >
                Terms & Conditions
              </Link>
            </div>

          </div>
        </div>
      </motion.div>

    </footer>
  );
}
