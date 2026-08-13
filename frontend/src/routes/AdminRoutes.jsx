import "../styles/admin-styles.css";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import Login from "../pages/admin/Login.jsx";
import Overview from "../pages/admin/Overview.jsx";
import Doctors from "../pages/admin/Doctors.jsx";
import Users from "../pages/admin/Users.jsx";
import Patients from "../pages/admin/Patients.jsx";
import MasterData from "../pages/admin/MasterData.jsx";
import AuditLogs from "../pages/admin/AuditLogs.jsx";

// Mounted at "/admin/*" — paths here are relative to that prefix (React Router
// resolves a nested <Routes> against the remaining, already-stripped path).
export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="users" element={<Users />} />
        <Route path="patients" element={<Patients />} />
        <Route path="master-data" element={<MasterData />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Route>
    </Routes>
  );
}
