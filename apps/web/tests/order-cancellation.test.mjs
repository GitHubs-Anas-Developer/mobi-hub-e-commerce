import test from "node:test";
import assert from "node:assert/strict";

import {
  ORDER_CANCELLATION_REASONS,
  canCancelOrder,
  getRefundStatusMeta,
} from "../src/components/orders/orderTimelineUtils.js";
import orderService from "../src/services/orderService.js";
import { store } from "../src/store/store.js";
import {
  clearCancelError,
  clearSelectedOrder,
  resetOrdersState,
  selectCancellingOrderId,
  selectOrderCancelError,
  selectOrderDetailsError,
  selectOrderDetailsStatusCode,
  selectSelectedOrder,
  selectUserOrders,
} from "../src/store/slices/orderSlice.js";
import {
  cancelUserOrder,
  fetchUserOrderById,
  fetchUserOrders,
} from "../src/store/thunks/orderThunks.js";

test("ORDER_CANCELLATION_REASONS and canCancelOrder enforce cancellation rules", () => {
  assert.ok(Array.isArray(ORDER_CANCELLATION_REASONS));
  assert.ok(ORDER_CANCELLATION_REASONS.includes("Ordered by mistake"));
  assert.ok(ORDER_CANCELLATION_REASONS.includes("Other"));

  assert.equal(canCancelOrder({ orderStatus: "Pending" }), true);
  assert.equal(
    canCancelOrder({
      orderStatus: "Confirmed",
      shipment: { currentStatus: "NEW", shipmentId: "SHP123" },
    }),
    true,
  );
  assert.equal(
    canCancelOrder({
      orderStatus: "Confirmed",
      cancellable: false,
    }),
    false,
  );
  assert.equal(
    canCancelOrder({
      orderStatus: "Confirmed",
      shipment: { currentStatus: "PICKUP SCHEDULED" },
    }),
    false,
  );
  assert.equal(
    canCancelOrder({
      orderStatus: "Confirmed",
      shipment: { awbCode: "AWB12345" },
    }),
    false,
  );
  assert.equal(canCancelOrder({ orderStatus: "Processing" }), false);
  assert.equal(canCancelOrder({ orderStatus: "Shipped" }), false);
  assert.equal(canCancelOrder({ orderStatus: "Delivered" }), false);
  assert.equal(canCancelOrder({ orderStatus: "Cancelled" }), false);
});

test("getRefundStatusMeta maps every refund and COD status accurately", () => {
  assert.equal(getRefundStatusMeta("SUCCESS", "Refunded", "Online").label, "Refund Completed");
  assert.equal(getRefundStatusMeta("PROCESSING", "Paid", "Online").label, "Refund Processing");
  assert.equal(getRefundStatusMeta("PENDING", "Paid", "Online").label, "Refund Pending");
  assert.equal(getRefundStatusMeta("FAILED", "Paid", "Online").label, "Refund Failed");
  assert.equal(
    getRefundStatusMeta("RECONCILIATION_REQUIRED", "Paid", "Online").label,
    "Under Verification",
  );
  assert.equal(
    getRefundStatusMeta("NOT_REQUIRED", "Pending", "COD").label,
    "No Payment Charged",
  );
});

test("Redux orders slice and thunks fetch, select, cancel, and propagate errors cleanly", async () => {
  const originalGetOrders = orderService.getOrders;
  const originalGetOrderById = orderService.getOrderById;
  const originalCancelOrder = orderService.cancelOrder;

  store.dispatch(resetOrdersState());

  try {
    orderService.getOrders = async () => ({
      success: true,
      data: {
        orders: [
          {
            _id: "ord_1",
            orderNumber: "MH-UI-1",
            orderStatus: "Pending",
            paymentMethod: "Online",
            paymentStatus: "Paid",
            totalAmount: 1999,
          },
        ],
        pagination: { total: 1, page: 1, totalPages: 1 },
      },
    });

    orderService.getOrderById = async () => ({
      success: true,
      data: {
        _id: "ord_1",
        orderNumber: "MH-UI-1",
        orderStatus: "Pending",
        paymentMethod: "Online",
        paymentStatus: "Paid",
        totalAmount: 1999,
      },
    });

    orderService.cancelOrder = async (orderId, payload) => {
      assert.equal(orderId, "ord_1");
      assert.equal(payload.reason, "Ordered by mistake");
      assert.equal(payload.comment, "Bought wrong color");

      return {
        success: true,
        data: {
          _id: "ord_1",
          orderNumber: "MH-UI-1",
          orderStatus: "Cancelled",
          paymentMethod: "Online",
          paymentStatus: "Refunded",
          refundStatus: "SUCCESS",
          cancellationReason: payload.reason,
          cancellationComment: payload.comment,
          refundSummary: {
            status: "SUCCESS",
            amount: 1999,
            gatewayRefundId: "rfnd_ui_1",
          },
        },
      };
    };

    await store.dispatch(fetchUserOrders());
    assert.equal(selectUserOrders(store.getState()).length, 1);

    await store.dispatch(fetchUserOrderById({ orderId: "ord_1" }));
    assert.equal(selectSelectedOrder(store.getState())?._id, "ord_1");

    // Cancel updates BOTH selectedOrder and orders list immediately
    const cancelResult = await store.dispatch(
      cancelUserOrder({
        orderId: "ord_1",
        reason: "Ordered by mistake",
        comment: "Bought wrong color",
      }),
    );
    assert.equal(cancelResult.meta.requestStatus, "fulfilled");
    assert.equal(selectCancellingOrderId(store.getState()), null);
    assert.equal(selectSelectedOrder(store.getState())?.orderStatus, "Cancelled");
    assert.equal(selectSelectedOrder(store.getState())?.refundStatus, "SUCCESS");
    assert.equal(selectUserOrders(store.getState())[0].orderStatus, "Cancelled");

    // Rejected cancel stores clean error message
    orderService.cancelOrder = async () => {
      const error = new Error("Request failed");
      error.response = {
        status: 400,
        data: { message: "Shipped orders cannot be cancelled" },
      };
      throw error;
    };

    const failedCancel = await store.dispatch(
      cancelUserOrder({ orderId: "ord_1", reason: "Too late" }),
    );
    assert.equal(failedCancel.meta.requestStatus, "rejected");
    assert.equal(
      selectOrderCancelError(store.getState()),
      "Shipped orders cannot be cancelled",
    );

    store.dispatch(clearCancelError());
    assert.equal(selectOrderCancelError(store.getState()), null);

    // Rejected 404 detail fetch preserves status code for Not Found UI
    orderService.getOrderById = async () => {
      const err = new Error("Not found");
      err.response = { status: 404, data: { message: "Order not found" } };
      throw err;
    };
    await store.dispatch(fetchUserOrderById({ orderId: "missing_1" }));
    assert.equal(selectOrderDetailsStatusCode(store.getState()), 404);
    assert.equal(selectOrderDetailsError(store.getState()), "Order not found");

    store.dispatch(clearSelectedOrder());
    assert.equal(selectSelectedOrder(store.getState()), null);
  } finally {
    orderService.getOrders = originalGetOrders;
    orderService.getOrderById = originalGetOrderById;
    orderService.cancelOrder = originalCancelOrder;
    store.dispatch(resetOrdersState());
  }
});

