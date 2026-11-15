
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
    text: "support@mobihub.com",
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
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 22,
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
    <footer className="relative mt-auto overflow-hidden border-t border-[#E2E8F0] bg-white text-[#101828]">

      {/* Scroll Progress */}
      <motion.div
        style={{ scaleX }}
        className="absolute left-0 top-0 z-20 h-[3px] w-full origin-left bg-[#0755E9]"
      />

      {/* Background Decorations */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-indigo-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main Footer */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:py-14"
        >

          {/* Brand */}
          <motion.div variants={itemVariants}>
            <Link
              href="/"
              className="inline-flex items-center text-2xl font-extrabold tracking-tight text-[#101828]"
            >
              MOBI
              <span className="text-[#0755E9]"> HUB</span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-[#64748B]">
              Discover quality tech accessories designed to make your everyday
              digital life smarter, easier, and better.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {socialLinks.map(({ label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ y: -4, scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 18,
                  }}
                  className="flex h-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#64748B] transition-colors hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white"
                >
                  {label}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Shop & Customer Service */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <motion.div key={heading} variants={itemVariants}>
              <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[#101828]">
                {heading}
              </h3>

              <ul className="mt-6 space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-[#64748B] transition-colors duration-200 hover:text-[#0755E9]"
                    >
                      <span>{link.label}</span>

                      <ArrowUpRight
                        size={14}
                        className="opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[#101828]">
              Get In Touch
            </h3>

            <ul className="mt-6 space-y-5">
              {contactDetails.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
                    <Icon size={17} strokeWidth={1.8} />
                  </div>

                  <span className="pt-2 text-sm leading-5 text-[#64748B]">
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
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative border-t border-[#E2E8F0] bg-[#F8FAFC]"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">

          <p className="text-xs text-[#64748B]">
            © {currentYear}{" "}
            <span className="font-semibold text-[#101828]">MOBI HUB.</span>{" "}
            All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-[#64748B]">
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
      </motion.div>

    </footer>
  );
}
