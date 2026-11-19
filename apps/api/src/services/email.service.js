import transporter from "../config/mailer.js";

const sendEmail = async ({ to, subject, html, text }) => {
  if (!to || !subject || !html) {
    throw new Error("Missing required email fields");
  }

  try {
    const info = await transporter.sendMail({
      from: {
        name: process.env.EMAIL_FROM_NAME,
        address: process.env.EMAIL_FROM_ADDRESS,
      },
      to,
      subject,
      html,
      text: text || "",
    });

    console.log("EMAIL SENT:", {
      to,
      subject,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("EMAIL FAILED:", {
      to,
      subject,
      error: error.message,
    });

    throw error;
  }
};

export default sendEmail;
