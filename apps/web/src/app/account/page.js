import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <div className="p-10">
        <h1 className="text-3xl font-bold">My Account</h1>
        <p>Welcome to MOBI HUB!</p>
      </div>
    </ProtectedRoute>
  );
}
