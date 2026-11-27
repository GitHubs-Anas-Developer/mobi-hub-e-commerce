import {
  initiatePayment,
  verifyPayment,
  handleRazorpayWebhook,
  refundPayment,
  syncOrderCancellationRefund,
  getAdminOrderPaymentDetails,
  getAdminPaymentsList,
  getAdminRefundsList,
  sanitizePaymentForCustomer,
} from "../services/payment.service.js";

export const createPayment = async (req, res, next) => {
  try {
    const payment = await initiatePayment(
      req.validatedData.body.orderId,
      req.user._id,
    );

    res.status(201).json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        paymentId: payment._id,
        razorpayOrderId: payment.razorpayOrderId,
        amount: payment.amount,
        currency: payment.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyCustomerPayment = async (req, res, next) => {
  try {
    const payment = await verifyPayment(req.user._id, req.validatedData.body);

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: sanitizePaymentForCustomer(payment),
    });
  } catch (error) {
    next(error);
  }
};

export const razorpayWebhook = async (req, res, next) => {
  try {
    const result = await handleRazorpayWebhook(
      req.body,
      req.headers["x-razorpay-signature"],
      req.headers["x-razorpay-event-id"],
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const processRefund = async (req, res, next) => {
  try {
    const {
      paymentId,
      orderId,
      reason,
      amount,
      provider,
      manualRefundConfirmed,
    } = req.validatedData.body;

    const result = await refundPayment(paymentId, reason, {
      orderId,
      adminId: req.user._id,
      amount,
      provider,
      manualRefundConfirmed,
    });

    res.status(200).json({
      success: true,
      message: result?.alreadyProcessed
        ? "Refund was already processed"
        : "Refund request processed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const syncOrderRefund = async (req, res, next) => {
  try {
    const { orderId } = req.validatedData.body;

    const result = await syncOrderCancellationRefund(orderId, {
      adminId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Refund status synchronized with payment gateway",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAdminOrderPaymentDetails = async (req, res, next) => {
  try {
    const { orderId } = req.validatedData.params;

    const details = await getAdminOrderPaymentDetails(orderId);

    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAdminPayments = async (req, res, next) => {
  try {
    const result = await getAdminPaymentsList(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAdminRefunds = async (req, res, next) => {
  try {
    const result = await getAdminRefundsList(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
