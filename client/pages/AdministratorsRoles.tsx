import { Navigate } from "react-router-dom";

export default function AdministratorsRoles() {
  return <Navigate to="/administrators/all?tab=roles" replace />;
}
