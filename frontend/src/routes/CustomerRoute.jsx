import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

export default function CustomerRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }
  if (user.role !== "CLIENT") {
    // An admin account should never fall back to the customer space.
    return <Navigate to="/" replace />;
  }
  return children;
}
