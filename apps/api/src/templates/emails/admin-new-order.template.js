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

const formatINR = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

const adminNewOrderTemplate = (order, customer) => {
  const items = order.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.productName)}</td>
          <td>${escapeHtml(item.sku)}</td>
          <td>${item.quantity}</td>
          <td>${formatINR(item.subtotal)}</td>
        </tr>
      `,
    )
    .join("");

  const address = order.shippingAddress;

  return `
    <div style="font-family:Arial,sans-serif;color:#101828;max-width:650px;margin:auto">
      <h2 style="color:#0755e9">New Order Received - ELEZIO</h2>

      <p>A new order has been successfully placed.</p>

      <h3>Order Details</h3>
      <p><strong>Order Number:</strong> ${escapeHtml(order.orderNumber)}</p>
      <p><strong>Total Amount:</strong> ${formatINR(order.totalAmount)}</p>
      <p><strong>Payment Method:</strong> ${escapeHtml(order.paymentMethod)}</p>
      <p><strong>Order Status:</strong> ${escapeHtml(order.orderStatus)}</p>

      <h3>Customer Details</h3>
      <p><strong>Name:</strong> ${escapeHtml(address.fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(customer.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(address.phone)}</p>

      <h3>Products</h3>
      <table width="100%" cellpadding="8" cellspacing="0" border="1"
        style="border-collapse:collapse">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Qty</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>${items}</tbody>
      </table>

      <h3>Shipping Address</h3>
      <p>
        ${escapeHtml(address.addressLine1)}<br/>
        ${escapeHtml(address.addressLine2 || "")}<br/>
        ${escapeHtml(address.city)}, ${escapeHtml(address.state)}
        - ${escapeHtml(address.pincode)}<br/>
        ${escapeHtml(address.country)}
      </p>

      <hr/>
      <p style="color:#64748b">ELEZIO Admin Notification</p>
    </div>
  `;
};

export default adminNewOrderTemplate;
