const emailVerificationTemplate = ({ name, verificationUrl }) => {
  const brandSiteUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/+$/, "");
  const brandLogoUrl = `${brandSiteUrl}/brand/elenzo-logo.png`;

  return {
    subject: "Verify Your ELENZO Account",

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verify Your Email</title>
        </head>

        <body style="margin:0; padding:0; background:#f4f7fb; font-family:Arial,sans-serif;">
          <div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:12px; overflow:hidden;">

            <div style="background:#0755e9; padding:25px; text-align:center;">
              <div style="display:inline-block; background:#ffffff; border-radius:10px; padding:10px 18px;">
                <img src="${brandLogoUrl}" alt="ELENZO" width="170" style="display:block; max-width:170px; width:100%; height:auto; border:0;" />
              </div>
            </div>

            <div style="padding:35px 25px; color:#101828;">
              <h2>Hello ${name || "Customer"},</h2>

              <p style="font-size:15px; line-height:1.7; color:#475467;">
                Thank you for creating your ELENZO account.
                Please verify your email address to activate your account.
              </p>

              <div style="text-align:center; margin:30px 0;">
                <a
                  href="${verificationUrl}"
                  style="display:inline-block; background:#0755e9; color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:bold;"
                >
                  Verify Email Address
                </a>
              </div>

              <p style="font-size:14px; color:#667085; line-height:1.6;">
                This verification link expires in 24 hours.
              </p>

              <p style="font-size:14px; color:#667085; line-height:1.6;">
                If you did not create this account, you can ignore this email.
              </p>
            </div>

            <div style="padding:20px; text-align:center; background:#f8fafc;">
              <p style="font-size:12px; color:#98a2b3; margin:0;">
                © ${new Date().getFullYear()} ELENZO. All rights reserved.
              </p>
            </div>

          </div>
        </body>
      </html>
    `,

    text: `
Hello ${name || "Customer"},

Thank you for creating your ELENZO account.

Verify your email address using this link:
${verificationUrl}

This link expires in 24 hours.

If you did not create this account, ignore this email.

ELENZO
    `,
  };
};

export default emailVerificationTemplate;
