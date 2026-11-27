import PolicyPageShell from "@/components/policies/PolicyPageShell";
import { RETURN_REFUND_SECTIONS } from "@/components/policies/policyConfig";
import { BRAND_NAME } from "@/config/brand";

export const metadata = {
  title: "Return & Refund Policy",
  description: `Review ${BRAND_NAME} eligibility criteria, inspection steps, cancellation rules, and refund methods for orders.`,
};

export default function ReturnPolicyPage() {
  return (
    <PolicyPageShell
      activeId="returns"
      title="Return & Refund Policy"
      introduction={`At ${BRAND_NAME}, we want customers to have a clear and transparent shopping experience. Please review the applicable return and refund conditions before placing an order.`}
      sections={RETURN_REFUND_SECTIONS}
    />
  );
}

