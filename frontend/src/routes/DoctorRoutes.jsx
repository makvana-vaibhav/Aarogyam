import "../styles/patient-styles.css";
import { Navigate, Route, Routes } from "react-router-dom";
import DoctorLayout from "../components/DoctorLayout.jsx";
import Overview from "../pages/doctor/Overview.jsx";
import MyPatients from "../pages/doctor/MyPatients.jsx";
import PatientDetail from "../pages/doctor/PatientDetail.jsx";
import CreateVisit from "../pages/doctor/CreateVisit.jsx";
import Profile from "../pages/doctor/Profile.jsx";

// Mounted at "/doctor/*" — paths here are relative to that prefix (React Router
// resolves a nested <Routes> against the remaining, already-stripped path).
export default function DoctorRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DoctorLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="overview.html" element={<Overview />} />
        <Route path="my-patients" element={<MyPatients />} />
        <Route path="my-patients.html" element={<MyPatients />} />
        <Route path="patient" element={<PatientDetail />} />
        <Route path="patient.html" element={<PatientDetail />} />
        <Route path="create-visit" element={<CreateVisit />} />
        <Route path="create-visit.html" element={<CreateVisit />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile.html" element={<Profile />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Route>
    </Routes>
  );
}
