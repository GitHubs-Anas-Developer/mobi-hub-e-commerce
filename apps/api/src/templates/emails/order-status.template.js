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

const statusMessages = {
  Confirmed: {
    title: "Your order is confirmed!",
    message: "We have confirmed your order and will prepare it soon.",
  },
  Processing: {
    title: "Your order is being processed!",
    message: "We are preparing your products for shipment.",
  },
  Shipped: {
    title: "Your order has been shipped!",
    message: "Your order is on its way to you.",
  },
  Delivered: {
    title: "Your order has been delivered!",
    message:
      "Your order has been successfully delivered. Thank you for shopping with Mobi Hub!",
  },
};

const orderStatusTemplate = (order) => {
  const status = statusMessages[order.orderStatus];

  if (!status) {
    throw new Error("Unsupported order status email");
  }

  return `
    <div style="font-family:Arial,sans-serif;color:#101828;max-width:600px;margin:auto;padding:20px">
      <h2 style="color:#0755e9">Mobi Hub</h2>

      <h3>${escapeHtml(status.title)}</h3>

      <p>Hello ${escapeHtml(order.shippingAddress.fullName)},</p>

      <p>${escapeHtml(status.message)}</p>

      <div style="background:#f8fafc;padding:16px;border-radius:8px">
        <p><strong>Order Number:</strong> ${escapeHtml(order.orderNumber)}</p>
        <p><strong>Order Status:</strong> ${escapeHtml(order.orderStatus)}</p>
        <p><strong>Total Amount:</strong> ₹${Number(order.totalAmount).toFixed(2)}</p>
      </div>

      <p>Thank you for choosing Mobi Hub!</p>
    </div>
  `;
};

export default orderStatusTemplate;
