
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CheckoutContent from "@/components/checkout/CheckoutContent";

export const metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
