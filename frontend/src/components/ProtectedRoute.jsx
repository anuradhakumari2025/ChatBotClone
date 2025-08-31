import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { ChatContext } from "../context/ChatContext";

function ProtectedRoute({ children }) {
  const { user } = useContext(ChatContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
