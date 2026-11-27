import PolicyPageShell from "@/components/policies/PolicyPageShell";
import { SHIPPING_DELIVERY_SECTIONS } from "@/components/policies/policyConfig";
import { BRAND_NAME } from "@/config/brand";

export const metadata = {
  title: "Shipping & Delivery Policy",
  description: `Understand ${BRAND_NAME} delivery availability, logistics partners, order tracking, and shipment handling.`,
};

export default function ShippingPolicyPage() {
  return (
    <PolicyPageShell
      activeId="shipping"
      title="Shipping & Delivery Policy"
      introduction={`${BRAND_NAME} aims to provide a clear and convenient delivery experience for every order.`}
      sections={SHIPPING_DELIVERY_SECTIONS}
    />
  );
}

