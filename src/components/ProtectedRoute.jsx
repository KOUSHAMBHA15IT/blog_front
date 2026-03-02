import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user } = useAuth();

  // If not logged in → redirect to /login
  // After login, React Router will return them to where they tried to go
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render the child route (WritePage, MyPostsPage, etc.)
  return <Outlet />;
}