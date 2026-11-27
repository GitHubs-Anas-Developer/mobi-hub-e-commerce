import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import mongoose from "mongoose";

// Configure test env vars safely (mocked only - no real gateway calls)
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key";
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "rzp_test_mock_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "rzp_test_webhook_secret";

import { validate } from "../src/middlewares/validate.middleware.js";
import { authorize } from "../src/middlewares/auth.middleware.js";
import {
  cancelOrderSchema,
  adminCancelOrderSchema,
  orderQuerySchema,
} from "../src/validators/order.validator.js";
import {
  refundPaymentSchema,
  syncOrderRefundSchema,
} from "../src/validators/payment.validator.js";
import {
  toPaise,
  fromPaise,
  createRazorpayRefund,
  fetchRazorpayPaymentRefunds,
} from "../src/utils/razorpayGateway.js";
import {
  isOrderCancellable,
  cancelOrder,
  updatePaymentStatus,
} from "../src/services/order.service.js";
import {
  sanitizePaymentForCustomer,
  sanitizeRefundForCustomer,
  buildRefundSummary,
  initiateOrderCancellationRefund,
  syncOrderCancellationRefund,
  handleRazorpayWebhook,
} from "../src/services/payment.service.js";
import { verifyCustomerPayment } from "../src/controllers/payment.controller.js";
import razorpay from "../src/config/razorpay.js";

import Order from "../src/models/order.model.js";
import Payment from "../src/models/payment.model.js";
import PaymentRefund from "../src/models/payment-refund.model.js";
import WebhookEvent from "../src/models/webhook-event.model.js";
import Product from "../src/models/product.model.js";
import InventoryTransaction from "../src/models/inventory-transaction.model.js";
import Coupon from "../src/models/coupon.model.js";
import CouponUsage from "../src/models/coupon-usage.model.js";
import Notification from "../src/models/notification.model.js";

const makeOid = () => new mongoose.Types.ObjectId();

const clone = (val) => {
  if (val === null || val === undefined || typeof val !== "object") return val;
  if (val instanceof mongoose.Types.ObjectId) {
    return new mongoose.Types.ObjectId(val.toString());
  }
  if (val instanceof Date) {
    return new Date(val.getTime());
  }
  if (Array.isArray(val)) {
    return val.map(clone);
  }
  const out = {};
  for (const [k, v] of Object.entries(val)) {
    out[k] = clone(v);
  }
  return out;
};

const toComparable = (v) => {
  if (v instanceof mongoose.Types.ObjectId) return v.toString();
  if (v instanceof Date) return v.toISOString();
  if (v && typeof v === "object" && typeof v.toString === "function") {
    return v.toString();
  }
  return String(v);
};

const matchQuery = (doc, filter = {}) => {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const [key, cond] of Object.entries(filter)) {
    if (key === "$and") {
      if (!cond.every((sub) => matchQuery(doc, sub))) return false;
      continue;
    }
    if (key === "$or") {
      if (!cond.some((sub) => matchQuery(doc, sub))) return false;
      continue;
    }
    if (key === "$expr") continue; // Checked explicitly when relevant

    const parts = key.split(".");
    let val = doc;
    for (const p of parts) {
      val = val?.[p];
    }

    if (cond && typeof cond === "object" && !(cond instanceof mongoose.Types.ObjectId) && !(cond instanceof Date)) {
      if ("$in" in cond) {
        if (!cond.$in.some((item) => toComparable(item) === toComparable(val))) return false;
      }
      if ("$nin" in cond) {
        if (cond.$nin.some((item) => toComparable(item) === toComparable(val))) return false;
      }
      if ("$ne" in cond) {
        if (cond.$ne === true ? val === true : toComparable(val) === toComparable(cond.$ne)) return false;
      }
      if ("$gt" in cond) {
        if (!(Number(val) > Number(cond.$gt))) return false;
      }
      if ("$gte" in cond) {
        if (!(Number(val) >= Number(cond.$gte))) return false;
      }
      if ("$lte" in cond) {
        if (!(val <= cond.$lte)) return false;
      }
      if ("$exists" in cond) {
        const exists = val !== undefined;
        if (exists !== Boolean(cond.$exists)) return false;
      }
      continue;
    }

    if (cond === null) {
      if (val !== null && val !== undefined) return false;
    } else if (toComparable(val) !== toComparable(cond)) {
      return false;
    }
  }
  return true;
};

const makeChainQuery = (resolver) => {
  const query = {
    _sort: null,
    session() { return query; },
    select() { return query; },
    populate() { return query; },
    sort(s) { query._sort = s; return query; },
    skip() { return query; },
    limit() { return query; },
    lean() { return query; },
    then(onFulfilled, onRejected) {
      return Promise.resolve().then(() => resolver(query)).then(onFulfilled, onRejected);
    },
  };
  return query;
};

// Lightweight stateful DB mock binding Mongoose model methods for isolated tests
const createInMemoryHarness = () => {
  const db = {
    orders: new Map(),
    payments: new Map(),
    refunds: new Map(),
    webhooks: new Map(),
    products: new Map(),
    inventoryTx: new Map(),
    coupons: new Map(),
    couponUsages: new Map(),
    notifications: [],
    locks: new Set(),
  };

  const wrapDoc = (collection, raw) => {
    const doc = { ...raw };
    Object.defineProperty(doc, "toObject", {
      enumerable: false,
      value: () => ({ ...doc }),
    });
    Object.defineProperty(doc, "save", {
      enumerable: false,
      value: async () => {
        doc.updatedAt = new Date();
        collection.set(doc._id.toString(), clone(doc));
        return doc;
      },
    });
    return doc;
  };

  const restoreFns = [];
  const stub = (obj, key, impl) => {
    const original = obj[key];
    obj[key] = impl;
    restoreFns.push(() => {
      obj[key] = original;
    });
  };

  stub(mongoose, "startSession", async () => {
    let activeTx = false;
    const session = {
      startTransaction() { activeTx = true; },
      inTransaction() { return activeTx; },
      async commitTransaction() { activeTx = false; },
      async abortTransaction() { activeTx = false; },
      async endSession() { activeTx = false; },
      async withTransaction(fn) {
        activeTx = true;
        try {
          return await fn();
        } finally {
          activeTx = false;
        }
      },
    };
    return session;
  });

  stub(Order, "findById", (id) =>
    makeChainQuery(() => {
      const found = db.orders.get(toComparable(id));
      return found ? wrapDoc(db.orders, clone(found)) : null;
    }),
  );

  stub(Order, "findOne", (filter) =>
    makeChainQuery(() => {
      for (const item of db.orders.values()) {
        if (matchQuery(item, filter)) return wrapDoc(db.orders, clone(item));
      }
      return null;
    }),
  );

  stub(Order, "findOneAndUpdate", (filter, update) =>
    makeChainQuery(() => {
      for (const [id, item] of db.orders.entries()) {
        if (matchQuery(item, filter)) {
          const next = clone(item);
          if (update.$set) Object.assign(next, update.$set);
          if (update.$push) {
            for (const [k, v] of Object.entries(update.$push)) {
              next[k] = [...(next[k] || []), v];
            }
          }
          db.orders.set(id, next);
          return wrapDoc(db.orders, clone(next));
        }
      }
      return null;
    }),
  );

  stub(Order, "updateOne", (filter, update) =>
    makeChainQuery(() => {
      for (const [id, item] of db.orders.entries()) {
        if (matchQuery(item, filter)) {
          const next = clone(item);
          if (update.$set) Object.assign(next, update.$set);
          db.orders.set(id, next);
          return { matchedCount: 1, modifiedCount: 1 };
        }
      }
      return { matchedCount: 0, modifiedCount: 0 };
    }),
  );

  stub(Payment, "findById", (id) =>
    makeChainQuery(() => {
      const found = db.payments.get(toComparable(id));
      return found ? wrapDoc(db.payments, clone(found)) : null;
    }),
  );

  stub(Payment, "findOne", (filter) =>
    makeChainQuery((q) => {
      let matches = Array.from(db.payments.values()).filter((p) =>
        matchQuery(p, filter),
      );
      if (q._sort?.createdAt === -1) matches.reverse();
      return matches[0] ? wrapDoc(db.payments, clone(matches[0])) : null;
    }),
  );

  stub(Payment, "find", (filter) =>
    makeChainQuery(() =>
      Array.from(db.payments.values())
        .filter((p) => matchQuery(p, filter))
        .map((p) => wrapDoc(db.payments, clone(p))),
    ),
  );

  stub(Payment, "findOneAndUpdate", (filter, update) =>
    makeChainQuery(() => {
      for (const [id, item] of db.payments.entries()) {
        if (!matchQuery(item, filter)) continue;
        // Simulate exact MongoDB $expr reservation check
        if (filter.$expr && update.$inc?.reservedRefundAmount > 0) {
          const added = update.$inc.reservedRefundAmount;
          const totalAfter =
            toPaise(item.refundedAmount) +
            toPaise(item.reservedRefundAmount) +
            toPaise(added);
          if (totalAfter > toPaise(item.amount)) continue;
        }
        const next = clone(item);
        if (update.$inc) {
          for (const [k, v] of Object.entries(update.$inc)) {
            next[k] = Number(((next[k] || 0) + v).toFixed(2));
          }
        }
        if (update.$set) Object.assign(next, update.$set);
        db.payments.set(id, next);
        return wrapDoc(db.payments, clone(next));
      }
      return null;
    }),
  );

  stub(PaymentRefund, "findById", (id) =>
    makeChainQuery(() => {
      const found = db.refunds.get(toComparable(id));
      return found ? wrapDoc(db.refunds, clone(found)) : null;
    }),
  );

  stub(PaymentRefund, "findOne", (filter) =>
    makeChainQuery((q) => {
      const matches = Array.from(db.refunds.values()).filter((r) =>
        matchQuery(r, filter),
      );
      if (q._sort?.attempt === -1) {
        matches.sort((a, b) => (b.attempt || 0) - (a.attempt || 0));
      }
      return matches[0] ? wrapDoc(db.refunds, clone(matches[0])) : null;
    }),
  );

  stub(PaymentRefund, "find", (filter) =>
    makeChainQuery((q) => {
      const matches = Array.from(db.refunds.values()).filter((r) =>
        matchQuery(r, filter),
      );
      if (q._sort?.createdAt === -1) {
        matches.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
      }
      return matches.map((r) => wrapDoc(db.refunds, clone(r)));
    }),
  );

  stub(PaymentRefund, "countDocuments", (filter) =>
    makeChainQuery(
      () =>
        Array.from(db.refunds.values()).filter((r) => matchQuery(r, filter))
          .length,
    ),
  );

  stub(PaymentRefund.prototype, "save", async function saveMock() {
    if (!this._id) this._id = makeOid();
    const raw = {
      _id: this._id,
      payment: this.payment ?? null,
      order: this.order,
      user: this.user,
      referenceType: this.referenceType,
      referenceId: this.referenceId,
      attempt: this.attempt ?? 1,
      provider: this.provider,
      amount: this.amount,
      currency: this.currency || "INR",
      status: this.status || "Pending",
      idempotencyKey: this.idempotencyKey,
      providerRefundId: this.providerRefundId ?? undefined,
      providerStatus: this.providerStatus ?? null,
      providerStatusCheckedAt: this.providerStatusCheckedAt ?? null,
      reason: this.reason || "",
      failureReason: this.failureReason ?? null,
      uncertainState: Boolean(this.uncertainState),
      initiatedBy: this.initiatedBy ?? null,
      initiatedByRole: this.initiatedByRole ?? null,
      processedAt: this.processedAt ?? null,
      reservationReleasedAt: this.reservationReleasedAt ?? null,
      createdAt: this.createdAt || new Date(),
      updatedAt: new Date(),
    };
    db.refunds.set(raw._id.toString(), raw);
    return this;
  });

  stub(WebhookEvent, "create", async (payload) => {
    for (const ev of db.webhooks.values()) {
      if (ev.eventId === payload.eventId) {
        const dup = new Error("Duplicate webhook");
        dup.code = 11000;
        throw dup;
      }
    }
    const doc = { _id: makeOid(), ...payload };
    db.webhooks.set(doc._id.toString(), doc);
    return doc;
  });

  stub(WebhookEvent, "findOne", (filter) =>
    makeChainQuery(() => {
      for (const ev of db.webhooks.values()) {
        if (matchQuery(ev, filter)) return clone(ev);
      }
      return null;
    }),
  );

  stub(WebhookEvent, "findOneAndUpdate", (filter, update) =>
    makeChainQuery(() => {
      for (const [id, ev] of db.webhooks.entries()) {
        if (matchQuery(ev, filter)) {
          const next = { ...ev, ...(update.$set || {}) };
          db.webhooks.set(id, next);
          return next;
        }
      }
      return null;
    }),
  );

  stub(WebhookEvent, "updateOne", (filter, update) =>
    makeChainQuery(() => {
      for (const [id, ev] of db.webhooks.entries()) {
        if (matchQuery(ev, filter)) {
          const next = { ...ev, ...(update.$set || {}) };
          db.webhooks.set(id, next);
          return { matchedCount: 1, modifiedCount: 1 };
        }
      }
      return { matchedCount: 0, modifiedCount: 0 };
    }),
  );

  stub(InventoryTransaction, "findOne", (filter) =>
    makeChainQuery(() => {
      for (const tx of db.inventoryTx.values()) {
        if (matchQuery(tx, filter)) return clone(tx);
      }
      return null;
    }),
  );

  stub(InventoryTransaction, "create", async ([data]) => {
    const doc = { _id: makeOid(), ...data, createdAt: new Date() };
    if (doc.idempotencyKey) {
      for (const existing of db.inventoryTx.values()) {
        if (existing.idempotencyKey === doc.idempotencyKey) {
          const err = new Error("Duplicate idempotencyKey");
          err.code = 11000;
          throw err;
        }
      }
    }
    db.inventoryTx.set(doc._id.toString(), doc);
    return [doc];
  });

  stub(Product, "findById", (id) =>
    makeChainQuery(() => {
      const p = db.products.get(toComparable(id));
      if (!p) return null;
      const cloned = clone(p);
      cloned.variants = {
        ...cloned.variants,
        id: (vid) =>
          p.variants.find((v) => v._id.toString() === vid.toString()) || null,
      };
      return cloned;
    }),
  );

  stub(Product, "findOneAndUpdate", (filter, update) =>
    makeChainQuery(() => {
      const p = db.products.get(toComparable(filter._id));
      if (!p) return null;
      const vid = filter.variants.$elemMatch._id.toString();
      const target = p.variants.find((v) => v._id.toString() === vid);
      if (!target || target.stock !== filter.variants.$elemMatch.stock) {
        return null;
      }
      target.stock += update.$inc["variants.$.stock"];
      p.totalStock += update.$inc.totalStock;
      return clone(p);
    }),
  );

  stub(Coupon, "updateOne", (filter, update) =>
    makeChainQuery(() => {
      const c = db.coupons.get(toComparable(filter._id));
      if (!c || (filter.usedCount?.$gt !== undefined && !(c.usedCount > filter.usedCount.$gt))) {
        return { modifiedCount: 0 };
      }
      c.usedCount += update.$inc.usedCount;
      return { modifiedCount: 1 };
    }),
  );

  stub(CouponUsage, "updateOne", (filter, update) =>
    makeChainQuery(() => {
      for (const u of db.couponUsages.values()) {
        if (
          u.coupon.toString() === filter.coupon.toString() &&
          u.user.toString() === filter.user.toString() &&
          u.usedCount > (filter.usedCount?.$gt ?? -1)
        ) {
          u.usedCount += update.$inc.usedCount;
          return { modifiedCount: 1 };
        }
      }
      return { modifiedCount: 0 };
    }),
  );

  stub(Notification, "create", async (payload) => {
    const allowedTypes = [
      "ORDER_PLACED",
      "ORDER_CONFIRMED",
      "ORDER_SHIPPED",
      "ORDER_DELIVERED",
      "ORDER_CANCELLED",
      "PAYMENT_SUCCESS",
      "PAYMENT_FAILED",
      "REFUND_PROCESSED",
      "LOW_STOCK",
      "OUT_OF_STOCK",
      "SYSTEM",
    ];
    if (!allowedTypes.includes(payload.type)) {
      throw new Error(`Invalid notification type: ${payload.type}`);
    }
    const note = { _id: makeOid(), ...payload };
    db.notifications.push(note);
    return note;
  });

  return {
    db,
    cleanup() {
      for (const restore of restoreFns.reverse()) restore();
    },
  };
};

// ==================================================
// 1. VALIDATION & AUTHORIZATION UNIT TESTS
// ==================================================

test("Validators enforce cancellation reasons, comment length, and refund params", () => {
  const validCancel = cancelOrderSchema.safeParse({
    reason: "Ordered by mistake",
    comment: "Picked wrong storage size",
  });
  assert.equal(validCancel.success, true);

  const emptyReason = cancelOrderSchema.safeParse({ reason: "  " });
  assert.equal(emptyReason.success, false);

  const longComment = cancelOrderSchema.safeParse({
    reason: "Other",
    comment: "x".repeat(501),
  });
  assert.equal(longComment.success, false);

  const adminValid = adminCancelOrderSchema.safeParse({ reason: "Fraud suspicion" });
  assert.equal(adminValid.success, true);

  const refundValid = refundPaymentSchema.safeParse({
    orderId: makeOid().toString(),
    amount: 250,
    provider: "Razorpay",
  });
  assert.equal(refundValid.success, true);

  const refundEmpty = refundPaymentSchema.safeParse({ reason: "Missing id" });
  assert.equal(refundEmpty.success, false);

  const syncValid = syncOrderRefundSchema.safeParse({
    orderId: makeOid().toString(),
  });
  assert.equal(syncValid.success, true);

  const queryPartial = orderQuerySchema.safeParse({
    paymentStatus: "PartiallyRefunded",
  });
  assert.equal(queryPartial.success, true);
});

test("Middleware authorize rejects non-admin and validate rejects malformed payload", () => {
  const authMw = authorize("admin");
  let status = null;
  let body = null;
  let nextCalled = false;

  authMw(
    { user: { role: "customer" } },
    {
      status(s) {
        status = s;
        return this;
      },
      json(b) {
        body = b;
      },
    },
    () => {
      nextCalled = true;
    },
  );
  assert.equal(status, 403);
  assert.equal(body.success, false);
  assert.equal(nextCalled, false);

  const valMw = validate(cancelOrderSchema, "body");
  status = null;
  valMw(
    { body: { reason: "" } },
    {
      status(s) {
        status = s;
        return this;
      },
      json(b) {
        body = b;
      },
    },
    () => {},
  );
  assert.equal(status, 400);
});

// ==================================================
// 2. CANCELLATION ELIGIBILITY & GATEWAY TIMEOUT TESTS
// ==================================================

test("isOrderCancellable blocks Processing/Shipped/Delivered/Cancelled & dispatched shipments", () => {
  assert.equal(isOrderCancellable({ orderStatus: "Pending" }).cancellable, true);
  assert.equal(
    isOrderCancellable({
      orderStatus: "Confirmed",
      shipment: { currentStatus: "NEW", shipmentId: "123" },
    }).cancellable,
    true,
  );
  assert.equal(
    isOrderCancellable({ orderStatus: "Processing" }).cancellable,
    false,
  );
  assert.equal(isOrderCancellable({ orderStatus: "Shipped" }).cancellable, false);
  assert.equal(
    isOrderCancellable({ orderStatus: "Delivered" }).cancellable,
    false,
  );
  assert.equal(
    isOrderCancellable({ orderStatus: "Cancelled" }).cancellable,
    false,
  );
  assert.equal(
    isOrderCancellable({
      orderStatus: "Confirmed",
      shipment: { currentStatus: "PICKED UP", shippedAt: new Date() },
    }).cancellable,
    false,
  );
  assert.equal(
    isOrderCancellable({
      orderStatus: "Confirmed",
      shipment: { awbCode: "AWB999" },
    }).cancellable,
    false,
  );
});

test("Razorpay gateway helpers enforce AbortController timeout & distinguish 4xx vs 5xx", async () => {
  assert.equal(toPaise(199.99), 19999);
  assert.equal(fromPaise(19999), 199.99);

  const originalFetch = globalThis.fetch;
  try {
    // Hanging request triggers AbortController 504 uncertain error
    globalThis.fetch = (_url, opts) =>
      new Promise((_resolve, reject) => {
        opts.signal.addEventListener("abort", () => {
          const err = new Error("Aborted");
          err.name = "AbortError";
          reject(err);
        });
      });

    await assert.rejects(
      () =>
        createRazorpayRefund({
          razorpayPaymentId: "pay_hang",
          amountPaise: 50000,
          receipt: "rcpt_hang",
          timeoutMs: 30,
        }),
      (err) => err.statusCode === 504 && err.isUncertain === true,
    );

    // Explicit 400 gateway rejection marks isUncertain=false
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          error: { code: "BAD_REQUEST_ERROR", description: "Refund amount invalid" },
        }),
        { status: 400 },
      );

    await assert.rejects(
      () =>
        createRazorpayRefund({
          razorpayPaymentId: "pay_400",
          amountPaise: 50000,
          receipt: "rcpt_400",
        }),
      (err) => err.statusCode === 400 && err.isUncertain === false,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Response sanitization removes sensitive Razorpay signatures & internal flags", () => {
  const safePayment = sanitizePaymentForCustomer({
    _id: makeOid(),
    order: makeOid(),
    provider: "Razorpay",
    razorpayOrderId: "order_rzp1",
    razorpayPaymentId: "pay_rzp1",
    amount: 1499,
    status: "Paid",
    signature: "secret_hmac_signature",
    refundIdempotencyKey: "secret_idem",
    refundReconciliationReason: "internal audit detail",
  });

  assert.equal(safePayment.signature, undefined);
  assert.equal(safePayment.refundIdempotencyKey, undefined);
  assert.equal(safePayment.refundReconciliationReason, undefined);
  assert.equal(safePayment.razorpayPaymentId, "pay_rzp1");

  const safeRefund = sanitizeRefundForCustomer({
    _id: makeOid(),
    status: "Processed",
    failureReason: "stale internal msg",
    providerRefundId: "rfnd_1",
  });
  assert.equal(safeRefund.failureReason, null);
});

// ==================================================
// 3. END-TO-END WORKFLOW TESTS (MOCKED DB + RAZORPAY)
// ==================================================

test("Customer cancels Pending COD order: restores stock, skips refund cleanly", async () => {
  const harness = createInMemoryHarness();
  try {
    const userId = makeOid();
    const productId = makeOid();
    const variantId = makeOid();
    const orderId = makeOid();

    harness.db.products.set(productId.toString(), {
      _id: productId,
      isActive: true,
      totalStock: 8,
      variants: [{ _id: variantId, sku: "SKU-1", stock: 8, isActive: true }],
    });

    harness.db.orders.set(orderId.toString(), {
      _id: orderId,
      orderNumber: "MH-COD-1",
      user: userId,
      orderStatus: "Pending",
      paymentMethod: "COD",
      paymentStatus: "Pending",
      totalAmount: 1999,
      items: [{ product: productId, variantId, quantity: 2 }],
      orderStatusHistory: [],
      shipment: {},
    });

    const result = await cancelOrder(orderId, userId, {
      reason: "Ordered by mistake",
      comment: "Need black variant instead",
    });

    assert.equal(result.orderStatus, "Cancelled");
    assert.equal(result.refundStatus, "NOT_REQUIRED");
    assert.equal(result.cancellationReason, "Ordered by mistake");
    assert.equal(result.cancellationComment, "Need black variant instead");
    assert.equal(harness.db.products.get(productId.toString()).totalStock, 10);
    assert.equal(harness.db.refunds.size, 0);
  } finally {
    harness.cleanup();
  }
});

test("Prepaid Confirmed order cancellation restores stock & coupon and triggers Razorpay refund", async () => {
  const harness = createInMemoryHarness();
  const originalFetch = globalThis.fetch;
  let refundPostCalls = 0;

  try {
    globalThis.fetch = async (url, opts) => {
      if (String(url).includes("/refund") && opts?.method === "POST") {
        refundPostCalls += 1;
        return new Response(
          JSON.stringify({
            id: "rfnd_success_1",
            payment_id: "pay_online_1",
            amount: 249900,
            status: "processed",
          }),
          { status: 200 },
        );
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    };

    const userId = makeOid();
    const productId = makeOid();
    const variantId = makeOid();
    const couponId = makeOid();
    const orderId = makeOid();
    const paymentId = makeOid();

    harness.db.products.set(productId.toString(), {
      _id: productId,
      isActive: true,
      totalStock: 4,
      variants: [{ _id: variantId, sku: "SKU-2", stock: 4, isActive: true }],
    });
    harness.db.coupons.set(couponId.toString(), {
      _id: couponId,
      code: "TECH10",
      usedCount: 1,
    });
    harness.db.couponUsages.set("u1", {
      coupon: couponId,
      user: userId,
      usedCount: 1,
    });
    harness.db.orders.set(orderId.toString(), {
      _id: orderId,
      orderNumber: "MH-ONL-1",
      user: userId,
      orderStatus: "Confirmed",
      paymentMethod: "Online",
      paymentStatus: "Paid",
      totalAmount: 2499,
      coupon: { couponId, code: "TECH10" },
      items: [{ product: productId, variantId, quantity: 1 }],
      orderStatusHistory: [],
      shipment: { currentStatus: "PENDING" },
    });
    harness.db.payments.set(paymentId.toString(), {
      _id: paymentId,
      order: orderId,
      user: userId,
      razorpayOrderId: "order_rzp_onl1",
      razorpayPaymentId: "pay_online_1",
      amount: 2499,
      currency: "INR",
      status: "Paid",
      refundedAmount: 0,
      reservedRefundAmount: 0,
    });

    const cancelled = await cancelOrder(orderId, userId, {
      reason: "Found a better price elsewhere",
    });

    assert.equal(refundPostCalls, 1);
    assert.equal(cancelled.orderStatus, "Cancelled");
    assert.equal(cancelled.paymentStatus, "Refunded");
    assert.equal(cancelled.refundStatus, "SUCCESS");
    assert.equal(cancelled.refundSummary.gatewayRefundId, "rfnd_success_1");
    assert.equal(harness.db.products.get(productId.toString()).totalStock, 5);
    assert.equal(harness.db.coupons.get(couponId.toString()).usedCount, 0);

    // Security: customer cannot cancel another user's order
    const otherUserId = makeOid();
    await assert.rejects(
      () => cancelOrder(orderId, otherUserId, { reason: "Hack attempt" }),
      (err) => err.statusCode === 403,
    );

    // Duplicate cancel prevented
    await assert.rejects(
      () => cancelOrder(orderId, userId, { reason: "Repeat cancel" }),
      (err) => err.statusCode === 409,
    );

    // Triggering refund twice does NOT make another Razorpay API call
    const secondRefund = await initiateOrderCancellationRefund({ orderId });
    assert.equal(secondRefund.alreadyProcessed, true);
    assert.equal(refundPostCalls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    harness.cleanup();
  }
});

test("Timeout during refund preserves reservation & reconciliation lock until syncOrderCancellationRefund", async () => {
  const harness = createInMemoryHarness();
  const originalFetch = globalThis.fetch;
  const originalTimeoutEnv = process.env.RAZORPAY_REQUEST_TIMEOUT_MS;

  try {
    process.env.RAZORPAY_REQUEST_TIMEOUT_MS = "30";

    // Simulate slow/hanging Razorpay POST response
    globalThis.fetch = (_url, opts) =>
      new Promise((_resolve, reject) => {
        opts.signal.addEventListener("abort", () => {
          const e = new Error("Aborted");
          e.name = "AbortError";
          reject(e);
        });
      });

    const userId = makeOid();
    const productId = makeOid();
    const variantId = makeOid();
    const orderId = makeOid();
    const paymentId = makeOid();

    harness.db.products.set(productId.toString(), {
      _id: productId,
      totalStock: 10,
      variants: [{ _id: variantId, sku: "SKU-3", stock: 10 }],
    });
    harness.db.orders.set(orderId.toString(), {
      _id: orderId,
      orderNumber: "MH-TMO-1",
      user: userId,
      orderStatus: "Pending",
      paymentMethod: "Online",
      paymentStatus: "Paid",
      totalAmount: 1000,
      items: [{ product: productId, variantId, quantity: 1 }],
      orderStatusHistory: [],
      shipment: {},
    });
    harness.db.payments.set(paymentId.toString(), {
      _id: paymentId,
      order: orderId,
      user: userId,
      razorpayPaymentId: "pay_tmo_1",
      amount: 1000,
      currency: "INR",
      status: "Paid",
      refundedAmount: 0,
      reservedRefundAmount: 0,
    });

    const cancelled = await cancelOrder(orderId, userId, {
      reason: "No longer needed",
    });

    assert.equal(cancelled.orderStatus, "Cancelled");
    assert.equal(cancelled.refundStatus, "RECONCILIATION_REQUIRED");
    const paymentAfterTimeout = harness.db.payments.get(paymentId.toString());
    assert.equal(paymentAfterTimeout.reservedRefundAmount, 1000);
    assert.equal(paymentAfterTimeout.refundReconciliationRequired, true);

    // Sync finds Razorpay DID NOT create the refund -> releases reservation safely
    process.env.RAZORPAY_REQUEST_TIMEOUT_MS = "5000";
    globalThis.fetch = async (url) => {
      if (String(url).includes("/payments/pay_tmo_1/refunds")) {
        return new Response(JSON.stringify({ items: [] }), { status: 200 });
      }
      if (String(url).includes("/payments/pay_tmo_1/refund")) {
        return new Response(
          JSON.stringify({
            id: "rfnd_retry_2",
            payment_id: "pay_tmo_1",
            amount: 100000,
            status: "processed",
          }),
          { status: 200 },
        );
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    };

    const synced = await syncOrderCancellationRefund(orderId);
    assert.equal(synced.refund.status, "Failed");
    assert.equal(synced.order.refundStatus, "FAILED");
    assert.equal(harness.db.payments.get(paymentId.toString()).reservedRefundAmount, 0);
    assert.equal(harness.db.payments.get(paymentId.toString()).refundReconciliationRequired, false);

    // Safe retry now succeeds as attempt 2!
    const retried = await initiateOrderCancellationRefund({ orderId });
    assert.equal(retried.refund.attempt, 2);
    assert.equal(retried.refund.status, "Processed");
    assert.equal(retried.order.paymentStatus, "Refunded");
    assert.equal(retried.order.refundStatus, "SUCCESS");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalTimeoutEnv === undefined) {
      delete process.env.RAZORPAY_REQUEST_TIMEOUT_MS;
    } else {
      process.env.RAZORPAY_REQUEST_TIMEOUT_MS = originalTimeoutEnv;
    }
    harness.cleanup();
  }
});

test("Partial refunds enforce balance limit and transition PartiallyRefunded -> Refunded", async () => {
  const harness = createInMemoryHarness();
  const originalFetch = globalThis.fetch;
  let seq = 0;

  try {
    globalThis.fetch = async (_url, opts) => {
      const body = JSON.parse(opts.body);
      seq += 1;
      return new Response(
        JSON.stringify({
          id: `rfnd_part_${seq}`,
          payment_id: "pay_part_1",
          amount: body.amount,
          status: "processed",
        }),
        { status: 200 },
      );
    };

    const orderId = makeOid();
    const paymentId = makeOid();
    const userId = makeOid();

    harness.db.orders.set(orderId.toString(), {
      _id: orderId,
      orderNumber: "MH-PART-1",
      user: userId,
      orderStatus: "Cancelled",
      paymentMethod: "Online",
      paymentStatus: "Paid",
      totalAmount: 1000,
    });
    harness.db.payments.set(paymentId.toString(), {
      _id: paymentId,
      order: orderId,
      user: userId,
      razorpayPaymentId: "pay_part_1",
      amount: 1000,
      currency: "INR",
      status: "Paid",
      refundedAmount: 0,
      reservedRefundAmount: 0,
    });

    const first = await initiateOrderCancellationRefund({
      orderId,
      amount: 400,
      reason: "Partial refund 1",
    });
    assert.equal(first.order.paymentStatus, "PartiallyRefunded");
    assert.equal(first.refund.amount, 400);

    // Attempt to refund > remaining (700 > 600) must fail
    await assert.rejects(
      () =>
        initiateOrderCancellationRefund({
          orderId,
          amount: 700,
          reason: "Over-refund",
        }),
      (err) => err.statusCode === 409,
    );

    const second = await initiateOrderCancellationRefund({
      orderId,
      amount: 600,
      reason: "Remaining refund 2",
    });
    assert.equal(second.refund.attempt, 2);
    assert.equal(second.order.paymentStatus, "Refunded");
    assert.equal(second.order.refundStatus, "SUCCESS");
    assert.equal(harness.db.payments.get(paymentId.toString()).refundedAmount, 1000);
  } finally {
    globalThis.fetch = originalFetch;
    harness.cleanup();
  }
});

test("COD refund rejects unpaid orders and requires explicit manual confirmation when paid", async () => {
  const harness = createInMemoryHarness();
  try {
    const unpaidOrderId = makeOid();
    const paidCodOrderId = makeOid();
    const userId = makeOid();

    harness.db.orders.set(unpaidOrderId.toString(), {
      _id: unpaidOrderId,
      orderNumber: "MH-COD-UNPAID",
      user: userId,
      orderStatus: "Cancelled",
      paymentMethod: "COD",
      paymentStatus: "Pending",
      totalAmount: 500,
    });
    harness.db.orders.set(paidCodOrderId.toString(), {
      _id: paidCodOrderId,
      orderNumber: "MH-COD-PAID",
      user: userId,
      orderStatus: "Cancelled",
      paymentMethod: "COD",
      paymentStatus: "Paid",
      totalAmount: 500,
    });

    await assert.rejects(
      () => initiateOrderCancellationRefund({ orderId: unpaidOrderId }),
      (err) => err.statusCode === 400,
    );

    await assert.rejects(
      () =>
        initiateOrderCancellationRefund({
          orderId: paidCodOrderId,
          provider: "Razorpay",
        }),
      (err) => err.statusCode === 400,
    );

    await assert.rejects(
      () =>
        initiateOrderCancellationRefund({
          orderId: paidCodOrderId,
          provider: "Manual",
          manualRefundConfirmed: false,
        }),
      (err) => err.statusCode === 400,
    );

    const codRefund = await initiateOrderCancellationRefund({
      orderId: paidCodOrderId,
      provider: "Manual",
      manualRefundConfirmed: true,
      reason: "Bank NEFT sent",
    });
    assert.equal(codRefund.refund.provider, "Manual");
    assert.equal(codRefund.order.paymentStatus, "Refunded");
    assert.equal(codRefund.order.refundStatus, "SUCCESS");

    // Cannot revert already refunded payment via updatePaymentStatus
    await assert.rejects(
      () => updatePaymentStatus(paidCodOrderId, "Paid"),
      (err) => err.statusCode === 400,
    );
  } finally {
    harness.cleanup();
  }
});

test("Webhook rejects invalid signatures/tampered amounts, deduplicates events, and settles async cancellation refunds", async () => {
  const harness = createInMemoryHarness();
  const originalFetch = globalThis.fetch;

  const signBody = (raw) =>
    crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(raw)
      .digest("hex");

  try {
    const orderId = makeOid();
    const paymentId = makeOid();
    const refundId = makeOid();
    const userId = makeOid();

    harness.db.orders.set(orderId.toString(), {
      _id: orderId,
      orderNumber: "MH-WH-1",
      user: userId,
      orderStatus: "Cancelled",
      paymentMethod: "Online",
      paymentStatus: "Paid",
      refundStatus: "PROCESSING",
      refundAmount: 1500,
      totalAmount: 1500,
    });
    harness.db.payments.set(paymentId.toString(), {
      _id: paymentId,
      order: orderId,
      user: userId,
      razorpayPaymentId: "pay_wh_1",
      amount: 1500,
      currency: "INR",
      status: "RefundPending",
      refundedAmount: 0,
      reservedRefundAmount: 1500,
    });
    harness.db.refunds.set(refundId.toString(), {
      _id: refundId,
      payment: paymentId,
      order: orderId,
      user: userId,
      referenceType: "OrderCancellation",
      referenceId: orderId,
      attempt: 1,
      provider: "Razorpay",
      amount: 1500,
      currency: "INR",
      status: "Processing",
      idempotencyKey: `order-cancel-${orderId}-attempt-1`,
      providerRefundId: "rfnd_wh_1",
      providerStatus: "pending",
    });

    const payload = {
      event: "refund.processed",
      payload: {
        refund: {
          entity: {
            id: "rfnd_wh_1",
            payment_id: "pay_wh_1",
            amount: 150000,
          },
        },
      },
    };
    const rawBody = Buffer.from(JSON.stringify(payload), "utf8");

    // 1. Bad signature rejected
    await assert.rejects(
      () => handleRazorpayWebhook(rawBody, "deadbeef", "evt_bad_sig"),
      (err) => err.statusCode === 400,
    );

    // 2. Tampered amount rejected
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          id: "rfnd_wh_1",
          payment_id: "pay_wh_1",
          amount: 1000, // mismatched
          status: "processed",
        }),
        { status: 200 },
      );

    await assert.rejects(
      () => handleRazorpayWebhook(rawBody, signBody(rawBody), "evt_tamper"),
      (err) => err.statusCode === 409,
    );

    // 3. Valid webhook succeeds & updates Order + Payment + Notification
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          id: "rfnd_wh_1",
          payment_id: "pay_wh_1",
          amount: 150000,
          status: "processed",
        }),
        { status: 200 },
      );

    const whOk = await handleRazorpayWebhook(
      rawBody,
      signBody(rawBody),
      "evt_ok_1",
    );
    assert.equal(whOk.processed, true);
    assert.equal(harness.db.orders.get(orderId.toString()).paymentStatus, "Refunded");
    assert.equal(harness.db.orders.get(orderId.toString()).refundStatus, "SUCCESS");
    assert.equal(harness.db.payments.get(paymentId.toString()).reservedRefundAmount, 0);
    assert.equal(harness.db.notifications.length, 1);
    assert.equal(harness.db.notifications[0].type, "REFUND_PROCESSED");

    // 4. Duplicate webhook ignored cleanly
    const whDup = await handleRazorpayWebhook(
      rawBody,
      signBody(rawBody),
      "evt_ok_1",
    );
    assert.equal(whDup.duplicate, true);
    assert.equal(whDup.processed, false);
  } finally {
    globalThis.fetch = originalFetch;
    harness.cleanup();
  }
});

test("Late payment.captured webhook on Cancelled order automatically refunds without crashing", async () => {
  const harness = createInMemoryHarness();
  const originalFetch = globalThis.fetch;

  const signBody = (raw) =>
    crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(raw)
      .digest("hex");

  const origRzpFetch = razorpay.payments.fetch;

  try {
    razorpay.payments.fetch = async () => ({
      id: "pay_late_1",
      order_id: "order_rzp_late_1",
      amount: 120000,
      currency: "INR",
      status: "captured",
      method: "upi",
    });

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          id: "rfnd_late_1",
          payment_id: "pay_late_1",
          amount: 120000,
          status: "processed",
        }),
        { status: 200 },
      );

    const orderId = makeOid();
    const paymentId = makeOid();
    const userId = makeOid();

    harness.db.orders.set(orderId.toString(), {
      _id: orderId,
      orderNumber: "MH-LATE-1",
      user: userId,
      orderStatus: "Cancelled",
      paymentMethod: "Online",
      paymentStatus: "Pending",
      totalAmount: 1200,
    });
    harness.db.payments.set(paymentId.toString(), {
      _id: paymentId,
      order: orderId,
      user: userId,
      razorpayOrderId: "order_rzp_late_1",
      amount: 1200,
      currency: "INR",
      status: "Created",
      refundedAmount: 0,
      reservedRefundAmount: 0,
    });

    const rawBody = Buffer.from(
      JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_late_1",
              order_id: "order_rzp_late_1",
              amount: 120000,
              currency: "INR",
              status: "captured",
            },
          },
        },
      }),
      "utf8",
    );

    const res = await handleRazorpayWebhook(
      rawBody,
      signBody(rawBody),
      "evt_late_cap_1",
    );
    assert.equal(res.processed, true);
    assert.equal(harness.db.orders.get(orderId.toString()).orderStatus, "Cancelled");
    assert.equal(harness.db.orders.get(orderId.toString()).paymentStatus, "Refunded");
    assert.equal(harness.db.orders.get(orderId.toString()).refundStatus, "SUCCESS");
  } finally {
    razorpay.payments.fetch = origRzpFetch;
    globalThis.fetch = originalFetch;
    harness.cleanup();
  }
});

test("Customer verifyCustomerPayment controller returns sanitized payment without signature", async () => {
  const harness = createInMemoryHarness();
  const origRzpFetch = razorpay.payments.fetch;

  try {
    const userId = makeOid();
    const orderId = makeOid();
    const paymentId = makeOid();
    const rzpOrderId = "order_rzp_v1";
    const rzpPayId = "pay_rzp_v1";

    const sig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${rzpOrderId}|${rzpPayId}`)
      .digest("hex");

    harness.db.orders.set(orderId.toString(), {
      _id: orderId,
      user: userId,
      orderStatus: "Pending",
      paymentMethod: "Online",
      paymentStatus: "Pending",
      totalAmount: 999,
    });
    harness.db.payments.set(paymentId.toString(), {
      _id: paymentId,
      order: orderId,
      user: userId,
      provider: "Razorpay",
      razorpayOrderId: rzpOrderId,
      amount: 999,
      currency: "INR",
      status: "Created",
    });

    razorpay.payments.fetch = async () => ({
      id: rzpPayId,
      order_id: rzpOrderId,
      amount: 99900,
      currency: "INR",
      status: "captured",
      method: "card",
    });

    let jsonOut = null;
    let statusCode = null;
    await verifyCustomerPayment(
      {
        user: { _id: userId },
        validatedData: {
          body: {
            razorpay_order_id: rzpOrderId,
            razorpay_payment_id: rzpPayId,
            razorpay_signature: sig,
          },
        },
      },
      {
        status(s) {
          statusCode = s;
          return this;
        },
        json(d) {
          jsonOut = d;
        },
      },
      (err) => {
        throw err;
      },
    );

    assert.equal(statusCode, 200);
    assert.equal(jsonOut.data.status, "Paid");
    assert.equal(jsonOut.data.signature, undefined);
    assert.equal(jsonOut.data.razorpayPaymentId, rzpPayId);
  } finally {
    razorpay.payments.fetch = origRzpFetch;
    harness.cleanup();
  }
});
