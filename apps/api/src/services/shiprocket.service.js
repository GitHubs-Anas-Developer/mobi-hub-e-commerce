import shiprocketConfig from "../config/shiprocket.config.js";

let cachedToken = null;
let tokenExpiresAt = null;

export const getShiprocketToken = async () => {
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const { email, password, baseURL } = shiprocketConfig;

  if (!email || !password) {
    throw new Error("Shiprocket credentials are missing");
  }

  const response = await fetch(`${baseURL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.token) {
    throw new Error(data.message || "Shiprocket authentication failed");
  }

  cachedToken = data.token;

  // Refresh token before its 10-day expiry
  tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;

  console.log("SHIPROCKET AUTHENTICATION SUCCESS");

  return cachedToken;
};

export const shiprocketRequest = async (endpoint, options = {}) => {
  const token = await getShiprocketToken();

  const response = await fetch(`${shiprocketConfig.baseURL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Shiprocket API request failed");
  }

  return data;
};

export const checkCourierServiceability = async ({
  pickupPostcode,
  deliveryPostcode,
  weight,
  cod = 0,
  length = 15,
  breadth = 10,
  height = 5,
}) => {
  if (!pickupPostcode || !deliveryPostcode || !weight) {
    throw new Error("Pickup pincode, delivery pincode and weight are required");
  }

  const params = new URLSearchParams({
    pickup_postcode: String(pickupPostcode),
    delivery_postcode: String(deliveryPostcode),
    weight: String(weight),
    cod: String(cod),
    length: String(length),
    breadth: String(breadth),
    height: String(height),
  });

  return shiprocketRequest(`/courier/serviceability/?${params.toString()}`);
};


// Create Shiprocket order
export const createShiprocketOrder = async (orderPayload) => {
  if (!orderPayload || typeof orderPayload !== "object") {
    throw new Error("Valid Shiprocket order payload is required");
  }

  // MOCK MODE: No real Shiprocket API request
  if (shiprocketConfig.testMode) {
    console.log("SHIPROCKET MOCK MODE: Shipment not created in Shiprocket");

    return {
      mock: true,
      order_id: `MOCK_ORDER_${Date.now()}`,
      shipment_id: `MOCK_SHIPMENT_${Date.now()}`,
      status: "NEW",
      status_code: 1,
      message: "Mock shipment created successfully",
    };
  }

  // LIVE MODE: Real Shiprocket API request
  return shiprocketRequest("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(orderPayload),
  });
};
