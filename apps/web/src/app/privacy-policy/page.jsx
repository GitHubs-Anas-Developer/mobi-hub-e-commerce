import PolicyPageShell from "@/components/policies/PolicyPageShell";
import { PRIVACY_POLICY_SECTIONS } from "@/components/policies/policyConfig";
import { BRAND_NAME } from "@/config/brand";

export const metadata = {
  title: "Privacy Policy",
  description: `Learn how ${BRAND_NAME} collects, uses, shares, and protects customer account, order, and payment information.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPageShell
      activeId="privacy"
      title="Privacy Policy"
      introduction={`At ${BRAND_NAME}, we respect your privacy and are committed to handling your personal information responsibly.`}
      sections={PRIVACY_POLICY_SECTIONS}
    />
  );
}

