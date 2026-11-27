import { BRAND_NAME, BRAND_SUPPORT_EMAIL } from "@/config/brand";

/**
 * Centralized ELENZO policy configuration.
 * Optional legal fields set to null indicate details that have not yet been
 * finalized in backend/environment config; UI components render neutral
 * customer-safe messaging rather than unresolved template tokens.
 */
export const POLICY_BUSINESS_CONFIG = {
  brandName: BRAND_NAME,
  storefrontName: `${BRAND_NAME} – Gadgets & Electronics`,
  supportEmail: BRAND_SUPPORT_EMAIL,
  supportPhone: null, // Configure when customer support phone line is published
  legalEntityName: null, // Configure with registered legal business entity
  registeredAddress: null, // Configure with registered business office address
  governingJurisdiction: null, // Configure governing courts / state jurisdiction
  effectiveDate: null, // Configure published ISO/display effective date
  country: "India",
  returnWindowDays: 7, // Mirrors backend RETURN_WINDOW_DAYS = 7 in return.service.js
  refundTimeframeNotice: null, // Configure specific bank/payment gateway SLA if needed
  deliveryTimeframeNotice: null, // Configure standard transit SLA if needed
  shippingChargeNotice: null, // Configure flat/tiered shipping rate rule if needed
};

export const POLICY_LINKS = [
  {
    id: "privacy",
    title: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    href: "/terms",
  },
  {
    id: "returns",
    title: "Return & Refund Policy",
    href: "/return-policy",
  },
  {
    id: "shipping",
    title: "Shipping & Delivery Policy",
    href: "/shipping-policy",
  },
];

export const PRIVACY_POLICY_SECTIONS = [
  {
    id: "introduction",
    number: "01",
    title: "Introduction",
    paragraphs: [
      `At ${BRAND_NAME}, we respect your privacy and are committed to handling your personal information responsibly.`,
      `This Privacy Policy explains what information is collected when you browse products, register an account, place orders, or contact support on our website, how that information is used to operate the store, and the choices available to you.`,
    ],
  },
  {
    id: "information-we-collect",
    number: "02",
    title: "Information We Collect",
    paragraphs: [
      "We collect information necessary to authenticate your account, fulfill gadget and electronics purchases, arrange shipping, process payments or refunds, and deliver order notifications.",
    ],
  },
  {
    id: "personal-information",
    number: "03",
    title: "Personal Information",
    paragraphs: [
      "Personal details you directly provide include your full name, email address, and optional phone number, along with recipient names, phone numbers (and optional alternate phone numbers), street addresses, landmarks, cities, states, pincodes, and country saved in your shipping Address Book.",
    ],
  },
  {
    id: "account-information",
    number: "04",
    title: "Account Information",
    paragraphs: [
      "When you register or sign in using local credentials or optional Google sign-in, we store your account profile, authentication provider identifier, email verification status, hashed password (for local accounts), role metadata, and last login timestamp.",
    ],
  },
  {
    id: "order-transaction-information",
    number: "05",
    title: "Order and Transaction Information",
    paragraphs: [
      "When you place an order, apply a coupon, cancel an order, or request a return, we record purchased product snapshots, variant SKUs, quantities, pricing totals, shipping fee, discount details, order status history, return requests, payment status, and gateway/refund references.",
    ],
  },
  {
    id: "device-usage-information",
    number: "06",
    title: "Device and Usage Information",
    paragraphs: [
      "As you browse products and submit requests from your browser, standard HTTP request metadata, session state, product reviews you author, wishlist items, cart contents, and recently viewed products may be processed so store features work properly across visits.",
    ],
  },
  {
    id: "how-we-use-information",
    number: "07",
    title: "How We Use Your Information",
    bullets: [
      "Authenticate users, maintain active login sessions, and protect account security.",
      "Process cart and direct checkout orders, verify online payments, and manage Cash on Delivery orders.",
      "Dispatch shipments, provide AWB/shipment tracking updates, and process order cancellations or return inspections.",
      "Send transactional emails (such as verification, password resets, and order status updates) and in-app notifications.",
      "Deliver promotional updates when you voluntarily subscribe to the store newsletter.",
    ],
  },
  {
    id: "payment-information",
    number: "08",
    title: "Payment Information",
    paragraphs: [
      "Online payments are handled via Razorpay checkout. ELENZO stores payment order IDs, transaction references, verification states, and refund statuses required for reconciliation and customer order records. Full credit/debit card details, UPI PINs, or net banking credentials are handled directly by Razorpay and are not stored in our database.",
    ],
  },
  {
    id: "cookies-similar-technologies",
    number: "09",
    title: "Cookies and Similar Technologies",
    paragraphs: [
      "Our storefront uses HTTP-only authentication/refresh and session cookies so you remain securely signed in across API requests and token refreshes. Browser local storage is also used strictly for convenience features such as saving your recent product search queries locally on your device.",
    ],
  },
  {
    id: "sharing-of-information",
    number: "10",
    title: "Sharing of Information",
    paragraphs: [
      "We share relevant order, recipient, and transaction details only with service providers involved in operating your purchase—such as payment processing, shipment fulfillment, and transactional communications—or where required by applicable law.",
    ],
  },
  {
    id: "third-party-services",
    number: "11",
    title: "Third-Party Services",
    paragraphs: [
      "Depending on the features you use, our platform integrates with external infrastructure and service partners including Razorpay (online payments and refunds), Google OAuth (optional sign-in), Shiprocket and courier partners (shipping and tracking), Cloudinary (product image/media hosting), and configured email delivery providers. Each third-party provider processes data under its own privacy practices.",
    ],
  },
  {
    id: "data-security",
    number: "12",
    title: "Data Security",
    paragraphs: [
      "We use technical safeguards including password hashing, HTTP-only credential cookies, role-based access control on administrative endpoints, and signature verification on online payment callbacks. While we work to protect customer data, no internet transmission or storage system can be guaranteed completely immune from risk.",
    ],
  },
  {
    id: "data-retention",
    number: "13",
    title: "Data Retention",
    paragraphs: [
      "Account, address, order, payment, and return records are retained as long as needed to support your account, fulfill active orders, handle returns or refunds, resolve disputes, and maintain business and transaction logs. You may clear local recent search history or remove saved addresses directly in your account.",
    ],
  },
  {
    id: "your-privacy-rights",
    number: "14",
    title: "Your Privacy Rights",
    paragraphs: [
      `You can review and update your profile details, change your password, manage saved shipping addresses, and manage wishlist items inside My Account. To request data assistance or account-related inquiries, contact ${BRAND_SUPPORT_EMAIL}.`,
    ],
  },
  {
    id: "childrens-privacy",
    number: "15",
    title: "Children's Privacy",
    paragraphs: [
      `${BRAND_NAME} is intended for individuals legally able to make online purchases or using the store under the supervision of a parent or legal guardian. We do not knowingly collect personal data from children without appropriate consent.`,
    ],
  },
  {
    id: "policy-updates",
    number: "16",
    title: "Policy Updates",
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect changes in store features, service providers, or applicable legal requirements. The updated version applies once published on this page.",
    ],
  },
  {
    id: "contact-information",
    number: "17",
    title: "Contact Information",
    paragraphs: [
      `For privacy questions or personal data requests, contact ${BRAND_NAME} Customer Support at ${BRAND_SUPPORT_EMAIL} or via our Contact Us page (/contact).`,
    ],
  },
];

export const TERMS_CONDITIONS_SECTIONS = [
  {
    id: "acceptance-of-terms",
    number: "01",
    title: "Acceptance of Terms",
    paragraphs: [
      `Welcome to ${BRAND_NAME}. By accessing or using our website, you agree to the terms described below.`,
      "If you do not agree with these Terms & Conditions, please refrain from browsing or placing orders on the storefront.",
    ],
  },
  {
    id: "eligibility",
    number: "02",
    title: "Eligibility",
    paragraphs: [
      "Purchases on ELENZO must be made by users legally capable of entering into binding agreements under applicable law, or with valid parental/guardian authorization where applicable.",
    ],
  },
  {
    id: "user-accounts",
    number: "03",
    title: "User Accounts",
    paragraphs: [
      "Creating an account enables checkout, saved shipping addresses, wishlists, order history, shipment tracking, and notifications. You agree to provide accurate contact and delivery information when registering and placing orders.",
    ],
  },
  {
    id: "account-security",
    number: "04",
    title: "Account Security",
    paragraphs: [
      "You are responsible for maintaining the confidentiality of your password and account session. Please notify support promptly if you suspect unauthorized access to your account.",
    ],
  },
  {
    id: "product-information",
    number: "05",
    title: "Product Information",
    paragraphs: [
      "We display product titles, variant attributes, descriptions, images, specifications, and customer reviews as provided in our catalog. Minor visual differences can occur depending on screen settings or manufacturer packaging updates.",
    ],
  },
  {
    id: "product-availability",
    number: "06",
    title: "Product Availability",
    paragraphs: [
      "Availability is tracked per product variant in real time during checkout. Placing an item in your cart or wishlist does not reserve stock until an order is successfully submitted and inventory is allocated.",
    ],
  },
  {
    id: "pricing-and-taxes",
    number: "07",
    title: "Pricing and Taxes",
    paragraphs: [
      "All listed prices are displayed in Indian Rupees (INR). Final payable totals are calculated server-side at order creation from current variant selling prices, applicable coupon discounts, and any recorded shipping charges.",
    ],
  },
  {
    id: "orders-and-acceptance",
    number: "08",
    title: "Orders and Order Acceptance",
    paragraphs: [
      "Placing an order submits an order request subject to stock verification, coupon validation, and payment verification (for online payments). Orders progress through verified stages including Pending, Confirmed, Processing, Shipped, and Delivered (or Cancelled).",
    ],
  },
  {
    id: "payment-methods",
    number: "09",
    title: "Payment Methods",
    paragraphs: [
      "ELENZO currently supports Online Payment via Razorpay (including UPI, Credit/Debit Cards, and Net Banking) and Cash on Delivery (COD). Online orders are marked Paid only after cryptographic payment signature or gateway webhook confirmation.",
    ],
  },
  {
    id: "cash-on-delivery",
    number: "10",
    title: "Cash on Delivery",
    paragraphs: [
      "Where Cash on Delivery (COD) is selected at checkout, payment is collected upon delivery of the order. COD orders are marked Paid only after delivery confirmation.",
    ],
  },
  {
    id: "shipping-and-delivery",
    number: "11",
    title: "Shipping and Delivery",
    paragraphs: [
      "Delivery availability, courier assignment, tracking milestones, and undelivered shipment handling are governed by our Shipping & Delivery Policy (/shipping-policy).",
    ],
  },
  {
    id: "order-cancellation",
    number: "12",
    title: "Order Cancellation",
    paragraphs: [
      "Customers may cancel an order online from My Orders or Order Details while the order remains in Pending or Confirmed status. Once an order enters Processing, Shipped, or Delivered stages, cancellation is no longer available online.",
    ],
  },
  {
    id: "returns-and-refunds",
    number: "13",
    title: "Returns and Refunds",
    paragraphs: [
      "Eligible returns on delivered orders and subsequent refund processing are governed by our Return & Refund Policy (/return-policy).",
    ],
  },
  {
    id: "promotions-and-discounts",
    number: "14",
    title: "Promotions and Discounts",
    paragraphs: [
      "Promotional coupons are subject to active start/expiry dates, minimum order value requirements, maximum discount caps, global usage limits, and per-user usage limits verified automatically at checkout.",
    ],
  },
  {
    id: "intellectual-property",
    number: "15",
    title: "Intellectual Property",
    paragraphs: [
      `The ${BRAND_NAME} brand name, logo assets, storefront layout, and custom copy belong to ${BRAND_NAME}. Third-party brand names, trademarks, and product images remain the property of their respective manufacturers or owners.`,
    ],
  },
  {
    id: "prohibited-activities",
    number: "16",
    title: "Prohibited Activities",
    paragraphs: [
      "Users may not attempt unauthorized access to admin or customer accounts, bypass payment verification, submit fraudulent orders or abuse coupon/return workflows, scrape automated private APIs, or interfere with platform operation.",
    ],
  },
  {
    id: "limitation-of-liability",
    number: "17",
    title: "Limitation of Liability",
    paragraphs: [
      `To the fullest extent permitted by applicable law, ${BRAND_NAME} shall not be liable for indirect, incidental, or consequential damages arising from courier delays, third-party payment gateway outages, or misuse of purchased hardware beyond manufacturer specifications.`,
    ],
  },
  {
    id: "third-party-services",
    number: "18",
    title: "Third-Party Services",
    paragraphs: [
      "Checkout payments, authentication, and shipment tracking rely in part on external providers such as Razorpay, Google, Shiprocket, and courier partners, whose services remain subject to their respective terms.",
    ],
  },
  {
    id: "changes-to-terms",
    number: "19",
    title: "Changes to Terms",
    paragraphs: [
      `${BRAND_NAME} reserves the right to revise these Terms & Conditions at any time by updating this page. Continued use of the storefront after updates constitutes acceptance of the revised terms.`,
    ],
  },
  {
    id: "governing-law",
    number: "20",
    title: "Governing Law and Jurisdiction",
    paragraphs: [
      `These Terms & Conditions are intended to be governed in accordance with applicable laws in ${POLICY_BUSINESS_CONFIG.country}. Specific corporate registration details and exclusive court jurisdiction terms are pending final legal confirmation before publication.`,
    ],
  },
  {
    id: "contact-information",
    number: "21",
    title: "Contact Information",
    paragraphs: [
      `Questions about these Terms & Conditions may be sent to ${BRAND_SUPPORT_EMAIL} or submitted through our Contact Us page (/contact).`,
    ],
  },
];

export const RETURN_REFUND_SECTIONS = [
  {
    id: "return-eligibility",
    number: "01",
    title: "Return Eligibility",
    paragraphs: [
      `At ${BRAND_NAME}, we want customers to have a clear and transparent shopping experience. Please review the applicable return and refund conditions before placing an order.`,
      "In the current storefront system, return requests are supported only for orders marked Delivered and submitted within 7 days of the recorded delivery date (deliveredAt), subject to item-level eligibility review.",
    ],
    bullets: [
      "Damaged product delivered",
      "Defective or non-working device",
      "Wrong item or incorrect variant delivered",
      "Product not as described",
      "Missing accessories or parts",
      "Other valid return reasons submitted with supporting details",
    ],
  },
  {
    id: "non-returnable-products",
    number: "02",
    title: "Non-Returnable Products",
    paragraphs: [
      "Orders that have not yet been delivered, requests submitted after the active 7-day return window from recorded delivery, or items failing return inspection are not eligible for return approval. Specific category-level exclusions or sealed-accessory conditions remain subject to final store policy configuration.",
    ],
  },
  {
    id: "damaged-or-defective-products",
    number: "03",
    title: "Damaged or Defective Products",
    paragraphs: [
      `If your gadget arrives physically damaged or fails to function properly, select the Damaged or Defective reason when submitting a return request in Order Details and describe the issue clearly. You may also contact ${BRAND_SUPPORT_EMAIL} with your Order Number.`,
    ],
  },
  {
    id: "incorrect-products-received",
    number: "04",
    title: "Incorrect Products Received",
    paragraphs: [
      "If you received a wrong model, color/capacity variant, or an item with missing components, submit a return request under Wrong Item or Missing Parts within the eligible window so our team can review the claim.",
    ],
  },
  {
    id: "how-to-request-return",
    number: "05",
    title: "How to Request a Return",
    paragraphs: [
      "Sign in to My Account, open My Orders (/account/orders), and view Order Details for your Delivered order. When within the eligible window, click Request Return, choose the specific items and quantities, select a reason, add brief details, and submit your request.",
      "Please note that return shipping cost responsibility (such as whether pickup is complimentary or chargeable) is not published as a store-wide guarantee and is confirmed during return review.",
    ],
  },
  {
    id: "return-approval-process",
    number: "06",
    title: "Return Approval Process",
    paragraphs: [
      "Submitted return requests enter Requested status and are reviewed by our team before moving to Approved or Rejected status. Approved items are coordinated for return receipt.",
    ],
  },
  {
    id: "product-inspection",
    number: "07",
    title: "Product Inspection",
    paragraphs: [
      "Once a returned package is marked Product Received, it undergoes inspection to verify condition, completeness, and alignment with the reported issue (Inspection Passed or Inspection Failed). Stock restoration is recorded only after inspection passes.",
    ],
  },
  {
    id: "refund-processing",
    number: "08",
    title: "Refund Processing",
    paragraphs: [
      "Refunds are processed only after return inspection passes and returned inventory has been reconciled. Because payment gateway and banking settlement times vary, exact refund credit timelines (number of business days) are not fixed as a guaranteed SLA here—please contact support if you need a status update.",
    ],
  },
  {
    id: "refund-method",
    number: "09",
    title: "Refund Method",
    paragraphs: [
      "For eligible prepaid Online orders paid via Razorpay, approved refunds are initiated back through the Razorpay payment record. Refund amounts reflect proportional coupon/discount adjustments recorded on the original order.",
    ],
  },
  {
    id: "cod-refund-process",
    number: "10",
    title: "COD Refund Process",
    paragraphs: [
      `For orders paid via Cash on Delivery (COD), approved refunds are recorded under Manual refund settlement. ${BRAND_NAME} support will coordinate applicable payout verification with you via email (${BRAND_SUPPORT_EMAIL}).`,
    ],
  },
  {
    id: "cancellation-and-refund",
    number: "11",
    title: "Cancellation and Refund",
    paragraphs: [
      "Customers can cancel an order directly from My Orders or Order Details while its status is Pending or Confirmed, which immediately restores inventory and any applied coupon usage. If an online payment was already captured prior to a valid cancellation, refund settlement is handled according to payment reconciliation procedures.",
    ],
  },
  {
    id: "exchanges",
    number: "12",
    title: "Exchanges",
    paragraphs: [
      "Automated direct product or variant exchanges are currently not supported in our storefront return workflow. Approved returns are handled for refund only; you may place a new order for a different variant or product.",
    ],
  },
  {
    id: "order-disputes",
    number: "13",
    title: "Order Disputes",
    paragraphs: [
      `If you disagree with a rejected return, failed inspection outcome, or payment reconciliation issue, email ${BRAND_SUPPORT_EMAIL} with your Order Number and Return Number so our team can review the case.`,
    ],
  },
  {
    id: "contact-support",
    number: "14",
    title: "Contact Support",
    paragraphs: [
      `Need help with a return, cancellation, or refund status? Contact ELENZO Customer Support at ${BRAND_SUPPORT_EMAIL} or via our Contact Us page (/contact).`,
    ],
  },
];

export const SHIPPING_DELIVERY_SECTIONS = [
  {
    id: "delivery-locations",
    number: "01",
    title: "Delivery Locations",
    paragraphs: [
      `ELENZO aims to provide a clear and convenient delivery experience for every order.`,
      `Orders are currently configured for delivery within ${POLICY_BUSINESS_CONFIG.country} to customer addresses saved with valid city, state, and pincode details, subject to courier partner serviceability.`,
    ],
  },
  {
    id: "order-processing",
    number: "02",
    title: "Order Processing",
    paragraphs: [
      "After an order is placed, it progresses through Confirmed and Processing stages while items are verified, packed, and prepared for courier handoff. Exact same-day dispatch cutoffs or guaranteed dispatch hours are not configured as a store SLA.",
    ],
  },
  {
    id: "shipping-partners",
    number: "03",
    title: "Shipping Partners",
    paragraphs: [
      "ELENZO integrates with Shiprocket as our primary logistics provider (along with supported courier partners or direct delivery options configured on an order). Assigned courier partner details become visible on Order Details and Order Tracking once the shipment is created.",
    ],
  },
  {
    id: "delivery-availability",
    number: "04",
    title: "Delivery Availability",
    paragraphs: [
      "Courier availability depends on delivery pincode serviceability supported by integrated shipping carriers. If a location cannot be serviced at dispatch, support will reach out with next steps.",
    ],
  },
  {
    id: "delivery-charges",
    number: "05",
    title: "Delivery Charges",
    paragraphs: [
      "Any applicable shipping fee for your order is displayed clearly during checkout and recorded in your Order Summary and Price Breakdown before payment. Flat store-wide shipping rates or free-shipping thresholds are not hard-promised outside what is shown at checkout.",
    ],
  },
  {
    id: "estimated-delivery-time",
    number: "06",
    title: "Estimated Delivery Time",
    paragraphs: [
      "Standard transit estimates are not fixed into universal delivery promises across all regions. When the assigned courier or shipment update provides an Estimated Delivery Date, it is displayed directly on your Order Tracking page.",
    ],
  },
  {
    id: "shipment-tracking",
    number: "07",
    title: "Shipment Tracking",
    paragraphs: [
      "Once a shipment ID or AWB number is generated for your order, open My Account > My Orders (/account/orders), select your order, and click Track Shipment to open the live ELENZO Order Tracking view.",
    ],
  },
  {
    id: "tracking-information",
    number: "08",
    title: "Tracking Information",
    paragraphs: [
      "The Order Tracking page shows milestone stages (Order Placed, Order Confirmed, Processing, Pickup Scheduled, Shipped, In Transit, Out for Delivery, Delivered), Shipment ID, AWB / Tracking Number, courier partner name, chronological scan updates with locations/timestamps when available, and an external courier tracking link when provided.",
    ],
  },
  {
    id: "delayed-shipments",
    number: "09",
    title: "Delayed Shipments",
    paragraphs: [
      `Courier transit can occasionally be delayed due to weather, regional restrictions, peak logistics volume, or hub exceptions. Please check your Order Tracking page first and contact ${BRAND_SUPPORT_EMAIL} if tracking scans stop updating.`,
    ],
  },
  {
    id: "failed-delivery-attempts",
    number: "10",
    title: "Failed Delivery Attempts",
    paragraphs: [
      "If a courier attempts delivery and cannot complete handoff (for example due to recipient unavailability), follow any courier re-attempt instructions or check tracking status updates. Repeated failed attempts may cause the package to be marked Undelivered or returned to origin (RTO).",
    ],
  },
  {
    id: "incorrect-delivery-address",
    number: "11",
    title: "Incorrect Delivery Address",
    paragraphs: [
      `Please review your Address Book selection and phone number carefully before confirming checkout. Address modifications after shipment pickup cannot be guaranteed; if you discover an error early while the order is Pending or Confirmed, cancel and re-order with the corrected address or contact ${BRAND_SUPPORT_EMAIL} promptly.`,
    ],
  },
  {
    id: "damaged-shipments",
    number: "12",
    title: "Damaged Shipments",
    paragraphs: [
      `If a package appears visibly tampered with or damaged upon delivery, document the package condition and submit a Damaged return request through Order Details (or contact ${BRAND_SUPPORT_EMAIL}) so our team can assist promptly.`,
    ],
  },
  {
    id: "undelivered-orders",
    number: "13",
    title: "Undelivered Orders",
    paragraphs: [
      `If your tracking status shows Returned to Origin (RTO), Lost, or Undelivered, please reach out to ${BRAND_SUPPORT_EMAIL} with your Order Number for resolution or refund coordination on prepaid orders.`,
    ],
  },
  {
    id: "contact-support",
    number: "14",
    title: "Contact Support",
    paragraphs: [
      `For shipping questions or tracking assistance, email ELENZO Customer Support at ${BRAND_SUPPORT_EMAIL} or use our Contact Us page (/contact).`,
    ],
  },
];

