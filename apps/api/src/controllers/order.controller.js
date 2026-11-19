import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getAdminOrderById,
} from "../services/order.service.js";

import sendEmail from "../services/email.service.js";
import orderConfirmationTemplate from "../templates/emails/order-confirmation.template.js";

export const placeOrder = async (req, res, next) => {
  try {
    const order = await createOrder(req.user._id, req.validatedData.body);

    // Send order confirmation email
    try {
      await sendEmail({
        to: order.email,
        subject: `Order Confirmed - ${order.orderNumber}`,
        html: orderConfirmationTemplate({
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          items: order.items,
          totalAmount: order.totalAmount,
        }),
        text: `Your Mobi Hub order ${order.orderNumber} has been confirmed.`,
      });
    } catch (emailError) {
      console.error("Order confirmation email failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchUserOrders = async (req, res, next) => {
  try {
    const result = await getUserOrders(req.user._id, req.validatedData.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchOrderById = async (req, res, next) => {
  try {
    const order = await getOrderById(
      req.validatedData.params.orderId,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelUserOrder = async (req, res, next) => {
  try {
    const order = await cancelOrder(
      req.validatedData.params.orderId,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAllOrders = async (req, res, next) => {
  try {
    const result = await getAllOrders(req.validatedData.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const changeOrderStatus = async (req, res, next) => {
  try {
    console.log("CHANGE ORDER STATUS CONTROLLER CALLED");

    const order = await updateOrderStatus(
      req.validatedData.params.orderId,
      req.validatedData.body.orderStatus,
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("CHANGE ORDER STATUS ERROR:", error.message);
    next(error);
  }
};

export const changePaymentStatus = async (req, res, next) => {
  try {
    const order = await updatePaymentStatus(
      req.validatedData.params.orderId,
      req.validatedData.body.paymentStatus,
    );

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAdminOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.validatedData.params;

    const order = await getAdminOrderById(orderId);

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
