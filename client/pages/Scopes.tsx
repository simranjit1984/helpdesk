import { Navigate } from "react-router-dom";

export default function Scopes() {
  return <Navigate to="/administrators/all?tab=scopes" replace />;
}
