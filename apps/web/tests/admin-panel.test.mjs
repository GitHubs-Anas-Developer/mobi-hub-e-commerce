import test from "node:test";
import assert from "node:assert/strict";

import {
  ADMIN_NAV_GROUPS,
  ALL_ADMIN_NAV_ITEMS,
  resolveAdminPageMeta,
} from "../src/components/admin/layout/adminNavigation.js";
import dashboardService from "../src/services/dashboardService.js";
import adminOrderService from "../src/services/adminOrderService.js";
import { store } from "../src/store/store.js";
import {
  clearAdminErrors,
  clearQuickOrder,
  selectAdminDashboard,
  selectAdminDashboardError,
  selectAdminDashboardLoading,
  selectAdminQuickOrder,
  selectAdminQuickOrderLoading,
} from "../src/store/slices/adminSlice.js";
import {
  fetchAdminDashboardData,
  fetchAdminQuickOrder,
} from "../src/store/thunks/adminThunks.js";

test("ADMIN_NAV_GROUPS and resolveAdminPageMeta resolve routes and breadcrumbs", () => {
  assert.ok(Array.isArray(ADMIN_NAV_GROUPS));
  assert.ok(ADMIN_NAV_GROUPS.length >= 4);
  assert.ok(ALL_ADMIN_NAV_ITEMS.length >= 16);

  for (const item of ALL_ADMIN_NAV_ITEMS) {
    assert.ok(item.href.startsWith("/admin"), `Expected /admin href for ${item.label}`);
    assert.ok(item.label && item.description);
  }

  const rootMeta = resolveAdminPageMeta("/admin");
  assert.equal(rootMeta.title, "Dashboard Overview");
  assert.equal(rootMeta.activeKey, "/admin");
  assert.equal(rootMeta.breadcrumbs.length, 1);

  const refundsMeta = resolveAdminPageMeta("/admin/refunds");
  assert.equal(refundsMeta.title, "Refunds");
  assert.equal(refundsMeta.activeKey, "/admin/refunds");
  assert.deepEqual(
    refundsMeta.breadcrumbs.map((b) => b.label),
    ["Dashboard", "Refunds"],
  );

  const orderDetailMeta = resolveAdminPageMeta(
    "/admin/orders/675abc123456789012345678",
  );
  assert.equal(orderDetailMeta.title, "Orders");
  assert.equal(orderDetailMeta.activeKey, "/admin/orders");
  assert.deepEqual(
    orderDetailMeta.breadcrumbs.map((b) => b.label),
    ["Dashboard", "Orders", "Details"],
  );

  const createCouponMeta = resolveAdminPageMeta("/admin/coupons/create");
  assert.deepEqual(
    createCouponMeta.breadcrumbs.map((b) => b.label),
    ["Dashboard", "Coupons", "Create New"],
  );

  const editProductMeta = resolveAdminPageMeta("/admin/products/p1/edit");
  assert.deepEqual(
    editProductMeta.breadcrumbs.map((b) => b.label),
    ["Dashboard", "Products", "Edit Details"],
  );
});

test("Redux admin slice and thunks aggregate dashboard data, handle quick orders, and propagate errors", async () => {
  const originals = {
    getOverview: dashboardService.getOverview,
    getSalesAnalytics: dashboardService.getSalesAnalytics,
    getRecentOrders: dashboardService.getRecentOrders,
    getTopProducts: dashboardService.getTopProducts,
    getLowStockProducts: dashboardService.getLowStockProducts,
    getOrderStats: dashboardService.getOrderStats,
    getPaymentStats: dashboardService.getPaymentStats,
    getRecentActivity: dashboardService.getRecentActivity,
    getOrderById: adminOrderService.getOrderById,
  };

  store.dispatch(clearQuickOrder());
  store.dispatch(clearAdminErrors());

  try {
    dashboardService.getOverview = async () => ({
      data: { totalRevenue: 125000, pendingRefunds: 2, totalOrders: 40 },
    });
    dashboardService.getSalesAnalytics = async (period) => ({
      data: {
        sales:
          period === "12m"
            ? [{ label: "Nov", revenue: 125000, orders: 40 }]
            : [{ label: "Mon", revenue: 18000, orders: 5 }],
      },
    });
    dashboardService.getRecentOrders = async () => ({
      data: [{ _id: "ord-1", orderNumber: "ELZ-1001", finalAmount: 4999 }],
    });
    dashboardService.getTopProducts = async () => ({
      data: [{ _id: "prod-1", name: "ELENZO Earbuds", totalSold: 25 }],
    });
    dashboardService.getLowStockProducts = async () => ({
      data: [{ productId: "prod-2", name: "Smart Watch", stock: 2 }],
    });
    dashboardService.getOrderStats = async () => ({
      data: { Delivered: 30, Cancelled: 2 },
    });
    dashboardService.getPaymentStats = async () => ({
      data: [{ method: "Razorpay", totalAmount: 100000 }],
    });
    dashboardService.getRecentActivity = async () => ({
      data: {
        recentCustomers: [{ _id: "u1", name: "Aarav" }],
        recentReviews: [{ _id: "r1", rating: 5 }],
      },
    });
    adminOrderService.getOrderById = async (orderId) => ({
      data: { order: { _id: orderId, orderNumber: "ELZ-1001" } },
    });

    await store.dispatch(fetchAdminDashboardData("7d"));
    const state = store.getState();

    assert.equal(selectAdminDashboardLoading(state), false);
    assert.equal(selectAdminDashboardError(state), null);
    const dashboard = selectAdminDashboard(state);
    assert.equal(dashboard.overview.totalRevenue, 125000);
    assert.equal(dashboard.overview.pendingRefunds, 2);
    assert.equal(dashboard.sales.length, 1);
    assert.equal(dashboard.monthlySales.length, 1);
    assert.equal(dashboard.recentOrders[0].orderNumber, "ELZ-1001");
    assert.equal(dashboard.recentCustomers[0].name, "Aarav");

    await store.dispatch(fetchAdminQuickOrder("ord-1"));
    assert.equal(selectAdminQuickOrderLoading(store.getState()), false);
    assert.equal(selectAdminQuickOrder(store.getState())?._id, "ord-1");

    store.dispatch(clearQuickOrder());
    assert.equal(selectAdminQuickOrder(store.getState()), null);

    dashboardService.getOverview = async () => {
      throw new Error("Dashboard backend unavailable");
    };
    await store.dispatch(fetchAdminDashboardData("7d"));
    assert.equal(
      selectAdminDashboardError(store.getState()),
      "Dashboard backend unavailable",
    );
  } finally {
    dashboardService.getOverview = originals.getOverview;
    dashboardService.getSalesAnalytics = originals.getSalesAnalytics;
    dashboardService.getRecentOrders = originals.getRecentOrders;
    dashboardService.getTopProducts = originals.getTopProducts;
    dashboardService.getLowStockProducts = originals.getLowStockProducts;
    dashboardService.getOrderStats = originals.getOrderStats;
    dashboardService.getPaymentStats = originals.getPaymentStats;
    dashboardService.getRecentActivity = originals.getRecentActivity;
    adminOrderService.getOrderById = originals.getOrderById;
  }
});

