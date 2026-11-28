
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CheckoutContent from "@/components/checkout/CheckoutContent";

export const metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
