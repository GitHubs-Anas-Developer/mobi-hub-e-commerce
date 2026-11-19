
import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { verifyMailer } from "./config/mailer.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("MOBI HUB BACKEND STARTING...");

    await connectDB();

    app.listen(PORT, () => {
      console.log(`MOBI HUB API running on port ${PORT}`);
    });

    // SMTP verification (non-blocking)
    verifyMailer()
      .then(() => {
        console.log("SMTP READY");
      })
      .catch((error) => {
        console.error("SMTP ERROR:", error.message);
      });
  } catch (error) {
    console.error("SERVER STARTUP FAILED:", error.message);
    process.exit(1);
  }
};

startServer();
