const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

const orderConfirmationTemplate = (order) => {
  const brandSiteUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/+$/, "");
  const brandLogoUrl = `${brandSiteUrl}/brand/elenzo-logo.png`;
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eee;">
        <strong>${escapeHtml(item.productName)}</strong>
        <br/>
        <small>SKU: ${escapeHtml(item.sku)}</small>
      </td>
      <td style="padding:12px;border-bottom:1px solid #eee;">
        ${item.quantity}
      </td>
      <td style="padding:12px;border-bottom:1px solid #eee;">
        ${formatPrice(item.sellingPrice)}
      </td>
      <td style="padding:12px;border-bottom:1px solid #eee;">
        ${formatPrice(item.subtotal)}
      </td>
    </tr>
  `,
    )
    .join("");

  const address = order.shippingAddress;

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:20px;background:#f4f7fb;
                 font-family:Arial,sans-serif;color:#101828;">

      <div style="max-width:650px;margin:auto;background:#fff;
                  border-radius:12px;overflow:hidden;">

        <div style="background:#0755e9;padding:25px;text-align:center;">
          <div style="display:inline-block;background:#ffffff;border-radius:10px;padding:10px 18px;">
            <img src="${brandLogoUrl}" alt="ELENZO — Gadgets &amp; Electronics" width="175" style="display:block;max-width:175px;width:100%;height:auto;border:0;" />
          </div>
          <p style="color:#eaf1ff;margin-top:10px;margin-bottom:0;font-size:13px;">
            Online Gadget &amp; Electronics Store
          </p>
        </div>

        <div style="padding:30px;">

          <h2 style="color:#16a34a;">Order Confirmed!</h2>

          <p>Hello ${escapeHtml(address.fullName)},</p>

          <p>
            Thank you for shopping with ELENZO.
            Your order has been successfully placed.
          </p>

          <div style="background:#eff6ff;padding:15px;
                      border-radius:8px;margin:20px 0;">
            <strong>Order Number:</strong>
            ${escapeHtml(order.orderNumber)}
            <br/><br/>
            <strong>Order Date:</strong>
            ${new Date(order.createdAt).toLocaleDateString("en-IN")}
          </div>

          <h3>Order Details</h3>

          <table width="100%" cellspacing="0"
                 style="border-collapse:collapse;text-align:left;
                        font-size:13px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:12px;">Product</th>
                <th style="padding:12px;">Qty</th>
                <th style="padding:12px;">Price</th>
                <th style="padding:12px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top:20px;text-align:right;">
            <p>Subtotal: ${formatPrice(order.subtotal)}</p>
            <p>Shipping: ${formatPrice(order.shippingFee)}</p>
            <p>Discount: -${formatPrice(order.discount)}</p>
            <h2 style="color:#0755e9;">
              Total: ${formatPrice(order.totalAmount)}
            </h2>
          </div>

          <h3>Payment Information</h3>
          <p>
            Payment Method: ${escapeHtml(order.paymentMethod)}
            <br/>
            Payment Status: ${escapeHtml(order.paymentStatus)}
          </p>

          <h3>Shipping Address</h3>
          <p>
            ${escapeHtml(address.fullName)}<br/>
            ${escapeHtml(address.addressLine1)}<br/>
            ${address.addressLine2
      ? escapeHtml(address.addressLine2) + "<br/>"
      : ""
    }
            ${escapeHtml(address.city)},
            ${escapeHtml(address.state)} -
            ${escapeHtml(address.pincode)}<br/>
            ${escapeHtml(address.country)}<br/>
            Phone: ${escapeHtml(address.phone)}
          </p>

          <p style="margin-top:30px;">
            We will notify you when your order is shipped.
          </p>

          <p>
            Thank you for choosing ELENZO!<br/>
            <strong>ELENZO Team</strong>
          </p>
        </div>

        <div style="background:#f8fafc;padding:20px;
                    text-align:center;color:#64748b;font-size:12px;">
          © ${new Date().getFullYear()} ELENZO.
          All rights reserved.
        </div>

      </div>
    </body>
    </html>
  `;
};

export default orderConfirmationTemplate;
