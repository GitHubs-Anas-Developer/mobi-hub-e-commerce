import { createError } from "./createError.js";

const DEFAULT_RAZORPAY_TIMEOUT_MS = 15000;

export const toPaise = (amount) => Math.round(Number(amount || 0) * 100);

export const fromPaise = (paise) =>
  Number((Number(paise || 0) / 100).toFixed(2));

export const getRazorpayTimeoutMs = () => {
  const configured = Number(process.env.RAZORPAY_REQUEST_TIMEOUT_MS);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_RAZORPAY_TIMEOUT_MS;
};

export const getRazorpayAuthHeader = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw createError("Payment gateway credentials are not configured", 500);
  }

  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
};

const createGatewayError = (message, statusCode, { isUncertain = false, code = null } = {}) => {
  const error = createError(message, statusCode);
  error.isUncertain = isUncertain;
  error.gatewayCode = code;
  return error;
};

export const razorpayFetchJson = async (
  url,
  { method = "GET", headers = {}, body = undefined, timeoutMs = getRazorpayTimeoutMs() } = {},
) => {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  let response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: getRazorpayAuthHeader(),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      ...(body !== undefined
        ? { body: typeof body === "string" ? body : JSON.stringify(body) }
        : {}),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createGatewayError(
        "Razorpay request timed out. Gateway state is uncertain — verify refund status before retrying.",
        504,
        { isUncertain: true, code: "GATEWAY_TIMEOUT" },
      );
    }

    throw createGatewayError(
      "Unable to reach Razorpay payment gateway. Verify refund status before retrying.",
      502,
      { isUncertain: true, code: "GATEWAY_NETWORK_ERROR" },
    );
  } finally {
    clearTimeout(timeoutHandle);
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw createGatewayError(
      "Invalid response received from Razorpay. Verify refund status before retrying.",
      502,
      { isUncertain: true, code: "GATEWAY_INVALID_JSON" },
    );
  }

  if (!response.ok) {
    const gatewayDescription =
      data?.error?.description ||
      data?.message ||
      "Razorpay gateway request failed";
    const isServerError = response.status >= 500 || response.status === 429;
    const mappedStatus = isServerError
      ? 502
      : response.status === 404
        ? 404
        : 400;

    throw createGatewayError(gatewayDescription, mappedStatus, {
      isUncertain: isServerError,
      code: data?.error?.code || null,
    });
  }

  return data;
};

export const fetchRazorpayRefund = async (refundId, { timeoutMs } = {}) => {
  if (!refundId || typeof refundId !== "string") {
    throw createError("Razorpay refund ID is required", 400);
  }

  const refundData = await razorpayFetchJson(
    `https://api.razorpay.com/v1/refunds/${encodeURIComponent(refundId)}`,
    { method: "GET", timeoutMs },
  );

  if (
    !refundData?.id ||
    !["pending", "processed", "failed"].includes(refundData.status)
  ) {
    throw createGatewayError("Invalid Razorpay refund response", 502, {
      isUncertain: true,
    });
  }

  return refundData;
};

export const fetchRazorpayPaymentRefunds = async (
  razorpayPaymentId,
  { timeoutMs } = {},
) => {
  if (!razorpayPaymentId || typeof razorpayPaymentId !== "string") {
    throw createError("Razorpay payment ID is required", 400);
  }

  const data = await razorpayFetchJson(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpayPaymentId)}/refunds?count=25`,
    { method: "GET", timeoutMs },
  );

  return Array.isArray(data?.items) ? data.items : [];
};

export const createRazorpayRefund = async ({
  razorpayPaymentId,
  amountPaise,
  receipt,
  notes = {},
  idempotencyKey,
  timeoutMs,
}) => {
  if (!razorpayPaymentId || !Number.isInteger(amountPaise) || amountPaise <= 0) {
    throw createError("Invalid refund request parameters", 400);
  }

  const payload = {
    amount: amountPaise,
    notes,
  };

  if (receipt) {
    payload.receipt = String(receipt).slice(0, 40);
  }

  const refundData = await razorpayFetchJson(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpayPaymentId)}/refund`,
    {
      method: "POST",
      headers: idempotencyKey
        ? { "X-Refund-Idempotency": idempotencyKey }
        : {},
      body: payload,
      timeoutMs,
    },
  );

  if (!refundData?.id || !refundData?.status) {
    throw createGatewayError("Invalid refund response from Razorpay", 502, {
      isUncertain: true,
    });
  }

  return refundData;
};

