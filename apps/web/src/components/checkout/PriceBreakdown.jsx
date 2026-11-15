
"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag,
  Truck,
  Tag,
  Receipt,
  CheckCircle2,
} from "lucide-react";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export default function PriceBreakdown({
  subtotal = 0,
  shippingFee = 0,
  discount = 0,
  totalAmount = 0,
}) {
  return (
    <div className="space-y-4">
      {/* Subtotal */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShoppingBag
            size={16}
            className="text-slate-400"
          />
          <span className="text-sm text-slate-600">
            Subtotal
          </span>
        </div>

        <span className="text-sm font-semibold text-[#101828]">
          {formatPrice(subtotal)}
        </span>
      </div>

      {/* Shipping */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Truck
            size={16}
            className="text-slate-400"
          />
          <span className="text-sm text-slate-600">
            Shipping Fee
          </span>
        </div>

        {Number(shippingFee) === 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
            <CheckCircle2 size={12} />
            Free
          </span>
        ) : (
          <span className="text-sm font-semibold text-[#101828]">
            {formatPrice(shippingFee)}
          </span>
        )}
      </div>

      {/* Discount */}
      {Number(discount) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <Tag
              size={16}
              className="text-green-600"
            />

            <span className="text-sm text-green-700">
              Discount
            </span>
          </div>

          <span className="text-sm font-bold text-green-600">
            -{formatPrice(discount)}
          </span>
        </motion.div>
      )}

      {/* Total */}
      <div className="border-t border-dashed border-slate-200 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#101828]">
              Total Amount
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              Inclusive of applicable charges
            </p>
          </div>

          <motion.p
            key={totalAmount}
            initial={{ opacity: 0.7, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-extrabold tracking-tight text-[#0755E9] sm:text-2xl"
          >
            {formatPrice(totalAmount)}
          </motion.p>
        </div>
      </div>

      {/* Savings Message */}
      {Number(discount) > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5">
          <Receipt
            size={16}
            className="shrink-0 text-green-600"
          />

          <p className="text-xs font-semibold text-green-700">
            You're saving {formatPrice(discount)} on this order!
          </p>
        </div>
      )}
    </div>
  );
}
