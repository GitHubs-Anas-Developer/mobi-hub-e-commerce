import PolicyPageShell from "@/components/policies/PolicyPageShell";
import { TERMS_CONDITIONS_SECTIONS } from "@/components/policies/policyConfig";
import { BRAND_NAME } from "@/config/brand";

export const metadata = {
  title: "Terms & Conditions",
  description: `Read the Terms & Conditions governing browsing, accounts, pricing, orders, payments, and cancellations on ${BRAND_NAME}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PolicyPageShell
      activeId="terms"
      title="Terms & Conditions"
      introduction={`Welcome to ${BRAND_NAME}. By accessing or using our website, you agree to the terms described below.`}
      sections={TERMS_CONDITIONS_SECTIONS}
    />
  );
}

