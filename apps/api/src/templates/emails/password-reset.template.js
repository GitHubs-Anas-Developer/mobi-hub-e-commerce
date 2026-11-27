const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

const passwordResetTemplate = ({ name, resetUrl }) => {
  const safeName = escapeHtml(name || "Customer");
  const safeUrl = escapeHtml(resetUrl);
  const brandSiteUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/+$/, "");
  const brandLogoUrl = `${brandSiteUrl}/brand/elenzo-logo.png`;

  return {
    subject: "Reset Your ELENZO Password",

    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:30px;background:#f1f5f9;font-family:Arial,sans-serif;">
          <div style="max-width:520px;margin:auto;background:#ffffff;padding:32px;border-radius:12px;">
            <div style="text-align:center;margin-bottom:20px;">
              <img src="${brandLogoUrl}" alt="ELENZO" width="165" style="display:inline-block;max-width:165px;width:100%;height:auto;border:0;" />
            </div>

            <h2>Hello ${safeName},</h2>

            <p>We received a request to reset your ELENZO account password.</p>

            <p>Click below to create a new password:</p>

            <div style="text-align:center;margin:30px 0;">
              <a href="${safeUrl}"
                style="background:#0755e9;color:#ffffff;padding:14px 28px;
                text-decoration:none;border-radius:8px;display:inline-block;">
                Reset Password
              </a>
            </div>

            <p>This link expires in 15 minutes.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>

            <hr style="border:0;border-top:1px solid #e2e8f0;margin:25px 0;" />

            <p style="color:#64748b;font-size:12px;text-align:center;">
              © ${new Date().getFullYear()} ELENZO. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `,

    text: `Hello ${name || "Customer"},

We received a request to reset your ELENZO password.

Reset your password using this link:
${resetUrl}

This link expires in 15 minutes.

If you didn't request this, ignore this email.`,
  };
};

export default passwordResetTemplate;
