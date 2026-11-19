const shiprocketConfig = {
  baseURL:
    process.env.SHIPROCKET_BASE_URL ||
    "https://apiv2.shiprocket.in/v1/external",

  email: process.env.SHIPROCKET_EMAIL,
  password: process.env.SHIPROCKET_PASSWORD,

  testMode: process.env.SHIPROCKET_TEST_MODE === "true",
};

export default shiprocketConfig;