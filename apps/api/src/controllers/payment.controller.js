import {
  initiatePayment,
  verifyPayment,
  handleRazorpayWebhook,
  refundPayment,
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
      data: payment,
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
    const { paymentId, reason } = req.validatedData.body;

    const payment = await refundPayment(paymentId, reason);

    res.status(200).json({
      success: true,
      message: "Refund request processed",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};
