import "../styles/admin-styles.css";
import { Route, Routes } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import Login from "../pages/admin/Login.jsx";
import Overview from "../pages/admin/Overview.jsx";
import Doctors from "../pages/admin/Doctors.jsx";
import Users from "../pages/admin/Users.jsx";
import Patients from "../pages/admin/Patients.jsx";
import MasterData from "../pages/admin/MasterData.jsx";
import AuditLogs from "../pages/admin/AuditLogs.jsx";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="users" element={<Users />} />
        <Route path="patients" element={<Patients />} />
        <Route path="master-data" element={<MasterData />} />
        <Route path="audit-logs" element={<AuditLogs />} />
      </Route>
    </Routes>
  );
}
