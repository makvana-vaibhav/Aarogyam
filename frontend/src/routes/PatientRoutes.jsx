import "../styles/patient-styles.css";
import { Navigate, Route, Routes } from "react-router-dom";
import PatientLayout from "../components/PatientLayout.jsx";
import Overview from "../pages/patient/Overview.jsx";
import MedicalHistory from "../pages/patient/MedicalHistory.jsx";
import Reports from "../pages/patient/Reports.jsx";
import Profile from "../pages/patient/Profile.jsx";

// Mounted at "/patient/*" — paths here are relative to that prefix (React Router
// resolves a nested <Routes> against the remaining, already-stripped path).
export default function PatientRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PatientLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="medical-history" element={<MedicalHistory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Route>
    </Routes>
  );
}
