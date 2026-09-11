import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/admin/connexion" replace />;
  }
  return children;
}
