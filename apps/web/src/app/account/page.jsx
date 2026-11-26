"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { motion, useScroll, useSpring } from "framer-motion";

import {
  Package,
  UserRound,
  Heart,
  MapPin,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const accountLinks = [
  {
    title: "My Orders",
    description: "Track your orders and check delivery updates.",
    href: "/account/orders",
    icon: Package,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "My Profile",
    description: "Manage your personal details and account.",
    href: "/account/profile",
    icon: UserRound,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    title: "My Wishlist",
    description: "View the products you have saved for later.",
    href: "/wishlist",
    icon: Heart,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    title: "Saved Addresses",
    description: "Manage your shipping and delivery addresses.",
    href: "/account/addresses",
    icon: MapPin,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

const revealTransition = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1],
};

const revealVariants = {
  hidden: {
    opacity: 0,
    y: 45,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: revealTransition,
  },
};

function AccountContent() {
  // Smooth scroll progress
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8">
      {/* Blue Scroll Progress */}
      <motion.div
        className="fixed left-0 top-0 z-[100] h-1 w-full origin-left bg-gradient-to-r from-[#0755E9] via-[#2583FF] to-cyan-400"
        style={{ scaleX: smoothProgress }}
      />

      <div className="mx-auto w-full">
        {/* Page Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-2">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: 24 }}
              transition={{ duration: 0.7 }}
              className="h-1.5 rounded-full bg-[#0755E9]"
            />

            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#0755E9]">
              ELEZIO
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#101828] sm:text-3xl">
            My Account
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage your account, orders and shopping preferences.
          </p>
        </motion.div>

        {/* Welcome Banner */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={revealVariants}
          className="group relative mb-10 overflow-hidden rounded-2xl bg-[#071B49] px-6 py-8 text-white shadow-lg shadow-blue-950/10 sm:px-9 sm:py-10"
        >
          {/* Animated Background Decorations */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, 25, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl"
          />

          <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100"
              >
                <Sparkles size={14} />
                Your personal shopping space
              </motion.div>

              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome to ELEZIO!
              </h2>

              <p className="mt-3 max-w-md text-sm leading-7 text-blue-100/80">
                Everything you need to manage your shopping experience, all in
                one place. View orders, update your profile and manage your
                saved items.
              </p>

              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 inline-flex"
              >
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0755E9] shadow-sm transition-colors hover:bg-blue-50"
                >
                  <ShoppingBag size={17} />
                  Continue Shopping
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>

            {/* Animated Shopping Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: 0.2,
                ease: "easeOut",
              }}
              whileHover={{ scale: 1.08, rotate: 5 }}
              className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 sm:flex"
            >
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10"
              >
                <ShoppingBag
                  size={44}
                  strokeWidth={1.4}
                  className="text-blue-100"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Account Overview Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={revealVariants}
          className="mb-5"
        >
          <h2 className="text-lg font-bold text-[#101828]">Account Overview</h2>

          <p className="mt-1 text-sm text-slate-500">
            Quick access to your account settings and activities.
          </p>
        </motion.div>

        {/* Account Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {accountLinks.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 45,
                    scale: 0.96,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: revealTransition,
                  },
                }}
                whileHover={{
                  y: -7,
                  boxShadow: "0px 15px 35px rgba(7,85,233,0.09)",
                  borderColor: "#BFDBFE",
                }}
                whileTap={{ scale: 0.98 }}
                className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
              >
                <Link href={item.href} className="block">
                  <div className="flex items-start justify-between">
                    <motion.div
                      whileHover={{
                        scale: 1.12,
                        rotate: -7,
                      }}
                      transition={{ duration: 0.25 }}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg}`}
                    >
                      <Icon
                        size={23}
                        className={item.iconColor}
                        strokeWidth={1.8}
                      />
                    </motion.div>

                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-blue-50 group-hover:text-[#0755E9]"
                    >
                      <ChevronRight size={17} />
                    </motion.div>
                  </div>

                  <h3 className="mt-5 font-bold text-[#101828] transition-colors group-hover:text-[#0755E9]">
                    {item.title}
                  </h3>

                  <p className="mt-2 min-h-[42px] text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#0755E9]">
                    Manage
                    <motion.span
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight size={15} />
                    </motion.span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Information Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={revealVariants}
          className="mt-8 flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7"
        >
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -8 }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0755E9]"
            >
              <ShieldCheck size={22} />
            </motion.div>

            <div>
              <h3 className="font-bold text-[#101828]">
                Your shopping journey starts here
              </h3>

              <p className="mt-1 max-w-lg text-sm leading-6 text-slate-500">
                Discover the latest gadgets, electronics and tech essentials at
                ELEZIO.
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="shrink-0"
          >
            <Link
              href="/products"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0645C4] sm:w-auto"
            >
              Explore Products
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.section>
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}
