import { BRAND_NAME, BRAND_SUPPORT_EMAIL } from "@/config/brand";

export const FAQ_CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "general", label: "General" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
  { id: "payments", label: "Payments" },
  { id: "shipping", label: "Shipping & Delivery" },
  { id: "returns", label: "Returns & Cancellations" },
  { id: "account", label: "Account" },
];

export const FAQ_ITEMS = [
  // General
  {
    id: "what-is-elenzo",
    category: "general",
    question: `What is ${BRAND_NAME}?`,
    answer: `${BRAND_NAME} is an online gadgets and electronics store focused on bringing useful technology, audio devices, charging essentials, and everyday tech accessories together in one streamlined shopping experience.`,
    featured: true,
  },
  {
    id: "how-to-contact",
    category: "general",
    question: `How can I contact ${BRAND_NAME}?`,
    answer: `You can reach ${BRAND_NAME} Customer Support via email at ${BRAND_SUPPORT_EMAIL} or visit our Contact Us page. Please include your Order Number if your question relates to an existing purchase.`,
    featured: true,
  },
  {
    id: "how-to-browse",
    category: "general",
    question: "How do I browse products?",
    answer:
      "Use the Shop Products catalog (/products), explore departments and subcategories via Categories (/categories), or search directly by product name or brand using the search bar in the header.",
  },

  // Products
  {
    id: "find-product-details",
    category: "products",
    question: "How can I find product details?",
    answer:
      "Click any product card to open its product details page, where you can review specifications, variant options (such as color or capacity), pricing, and customer reviews when available.",
  },
  {
    id: "check-product-availability",
    category: "products",
    question: "How can I check product availability?",
    answer:
      "Live stock status (In Stock or Out of Stock) is shown directly on product listing cards and updates per selected variant on the product details page.",
  },
  {
    id: "product-out-of-stock",
    category: "products",
    question: "What should I do if a product is out of stock?",
    answer:
      "If a variant is currently unavailable, check other variants on the product page, save the item to your Wishlist to revisit later, or explore similar devices in the same category.",
  },

  // Orders
  {
    id: "place-order",
    category: "orders",
    question: "How can I place an order?",
    answer:
      "Sign in to your account, add your chosen product variant to the Shopping Cart (or use direct Buy Now where available), select or enter your delivery address at Checkout, choose a payment method, and confirm your order.",
    featured: true,
  },
  {
    id: "view-my-orders",
    category: "orders",
    question: "Where can I view my orders?",
    answer:
      "After signing in, open My Account and select My Orders (/account/orders) to view all placed orders, filter by status, and open detailed summaries for each order.",
  },
  {
    id: "track-my-order",
    category: "orders",
    question: "How can I track my order?",
    answer:
      "Open My Orders, select your order, and click Track Shipment to view status milestones, AWB details, courier partner information, and chronological tracking scans once a shipment is assigned.",
  },
  {
    id: "cancel-my-order",
    category: "orders",
    question: "Can I cancel my order?",
    answer:
      "Yes, orders can be cancelled from My Orders or Order Details while their status is Pending or Confirmed. Once an order moves into Processing, Shipped, or Delivered stages, cancellation is no longer available online.",
    featured: true,
  },

  // Payments
  {
    id: "available-payment-methods",
    category: "payments",
    question: "Which payment methods are available?",
    answer: `${BRAND_NAME} supports Online Payment via Razorpay (including UPI, Credit/Debit Cards, and Net Banking) as well as Cash on Delivery (COD) at checkout.`,
  },
  {
    id: "cod-availability",
    category: "payments",
    question: "Is Cash on Delivery available?",
    answer:
      "Cash on Delivery (COD) is available as a payment option during checkout. Please note that eligibility on specific orders or pincodes is validated at checkout—contact support if you need assistance.",
  },
  {
    id: "online-payment-fails",
    category: "payments",
    question: "What happens if an online payment fails?",
    answer: `Online payments are only marked Paid after verified gateway confirmation. If a payment fails or remains unconfirmed, no completed payment is recorded—please check Order Details or contact ${BRAND_SUPPORT_EMAIL} if an amount was debited by your bank.`,
  },

  // Shipping & Delivery
  {
    id: "delivery-availability",
    category: "shipping",
    question: "How can I check delivery availability?",
    answer:
      "Enter your delivery address and pincode during checkout (or in your Address Book) to proceed with supported shipping locations. Reach out to support if you have questions about delivery to a specific location.",
  },
  {
    id: "track-shipment",
    category: "shipping",
    question: "How do I track my shipment?",
    answer:
      "Once your order is assigned to a courier partner, visit your Order Tracking page to view the courier name, Shipment ID, AWB number, courier tracking link (when provided), and live scan history.",
  },
  {
    id: "delivery-delayed",
    category: "shipping",
    question: "What happens if delivery is delayed?",
    answer: `Check the latest courier updates on your Order Tracking page first. If tracking has not updated or delivery appears delayed, please contact our support team at ${BRAND_SUPPORT_EMAIL} with your Order Number for assistance.`,
  },

  // Returns & Cancellations
  {
    id: "return-policy",
    category: "returns",
    question: "What is the return policy?",
    answer:
      "Return requests are supported for delivered orders within 7 days of the recorded delivery date for eligible reasons such as Damaged, Defective, Wrong Item, Not as Described, Missing Parts, or Other.",
  },
  {
    id: "request-return",
    category: "returns",
    question: "How can I request a return?",
    answer: `Open Order Details for a delivered order that is within the 7-day return window and click Request Return to select items, quantities, and your reason. If you need help or an exception, please contact ${BRAND_SUPPORT_EMAIL}.`,
  },
  {
    id: "receive-refund",
    category: "returns",
    question: "When will I receive a refund?",
    answer: `Refunds for approved returns are initiated after the returned product is received and passes inspection, and are processed to the original online payment method or manually where applicable. For updates on refund status, check Order Details or contact our support team for assistance.`,
  },

  // Account
  {
    id: "create-account",
    category: "account",
    question: "How can I create an account?",
    answer:
      "Click Register (/register), fill in your details, and complete verification. You can also sign in via supported authentication options on the Login page (/login).",
  },
  {
    id: "update-profile",
    category: "account",
    question: "How can I update my profile?",
    answer:
      "Sign in and go to My Account > My Profile (/account/profile), click Edit Profile to update your name or phone number, and manage saved shipping addresses under Address Book (/account/addresses).",
  },
  {
    id: "reset-password",
    category: "account",
    question: "How can I reset my password?",
    answer:
      "If you are signed in, open My Profile and use the Change Password section. If you cannot sign in, use the Forgot Password link (/forgot-password) on the Login page to request a password reset.",
  },
];

export const FEATURED_FAQS = FAQ_ITEMS.filter((item) => item.featured);

