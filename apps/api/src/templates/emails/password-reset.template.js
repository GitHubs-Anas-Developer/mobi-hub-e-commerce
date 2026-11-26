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

  return {
    subject: "Reset Your ELEZIO Password",

    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:30px;background:#f1f5f9;font-family:Arial,sans-serif;">
          <div style="max-width:520px;margin:auto;background:#ffffff;padding:32px;border-radius:12px;">
            <h1 style="color:#0755e9;text-align:center;">ELEZIO</h1>

            <h2>Hello ${safeName},</h2>

            <p>We received a request to reset your ELEZIO account password.</p>

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
              © ${new Date().getFullYear()} ELEZIO. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `,

    text: `Hello ${name || "Customer"},

We received a request to reset your ELEZIO password.

Reset your password using this link:
${resetUrl}

This link expires in 15 minutes.

If you didn't request this, ignore this email.`,
  };
};

export default passwordResetTemplate;
