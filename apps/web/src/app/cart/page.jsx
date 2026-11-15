import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CartPageContent from "@/components/cart/CartPageContent";

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartPageContent />
    </ProtectedRoute>
  );
}