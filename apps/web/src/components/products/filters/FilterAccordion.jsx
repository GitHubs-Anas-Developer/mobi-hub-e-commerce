
"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { ChevronDown } from "lucide-react";

export default function FilterAccordion({
  title,
  subtitle,
  icon: Icon,
  count = 0,
  children,
  defaultOpen = true,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="border-b border-slate-100 py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Icon size={17} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900">
              {title}
            </h3>

            <p className="mt-0.5 text-[10px] text-slate-400">
              {subtitle}
            </p>
          </div>

          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-50 px-1.5 text-[10px] font-bold text-blue-600">
              {count}
            </span>
          )}
        </div>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.2,
          }}
          className="shrink-0 text-slate-400"
        >
          <ChevronDown size={17} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : { height: 0, opacity: 0 }
            }
            animate={{ height: "auto", opacity: 1 }}
            exit={{
              height: shouldReduceMotion ? "auto" : 0,
              opacity: shouldReduceMotion ? 1 : 0,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.25,
              ease: "easeInOut",
            }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
