import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CartPageContent from "@/components/cart/CartPageContent";

export const metadata = {
  title: "Shopping Cart",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartPageContent />
    </ProtectedRoute>
  );
}