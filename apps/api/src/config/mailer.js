import nodemailer from "nodemailer";

const requiredEnv = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_FROM_NAME",
  "EMAIL_FROM_ADDRESS",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing email configuration: ${key}`);
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  pool: true,
  maxConnections: 5,
  maxMessages: 100,

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
});

export const verifyMailer = async () => {
  try {
    await transporter.verify();
    console.log("Email SMTP connection established.");
    return true;
  } catch (error) {
    console.error("Email SMTP connection failed:", error.message);
    throw error;
  }
};

export default transporter;
