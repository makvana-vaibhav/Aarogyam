import "../styles/patient-styles.css";
import { Navigate, Route, Routes } from "react-router-dom";
import PatientLayout from "../components/PatientLayout.jsx";
import Overview from "../pages/patient/Overview.jsx";
import MedicalHistory from "../pages/patient/MedicalHistory.jsx";
import Reports from "../pages/patient/Reports.jsx";
import Profile from "../pages/patient/Profile.jsx";
import DoctorLayout from "../components/DoctorLayout.jsx";
import DoctorOverview from "../pages/doctor/Overview.jsx";
import MyPatients from "../pages/doctor/MyPatients.jsx";
import PatientDetail from "../pages/doctor/PatientDetail.jsx";
import CreateVisit from "../pages/doctor/CreateVisit.jsx";
import DoctorProfile from "../pages/doctor/Profile.jsx";

export default function PortalRoutes() {
  return (
    <Routes>
      <Route path="/patient" element={<PatientLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="medical-history" element={<MedicalHistory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="/doctor" element={<DoctorLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<DoctorOverview />} />
        <Route path="my-patients" element={<MyPatients />} />
        <Route path="patient" element={<PatientDetail />} />
        <Route path="create-visit" element={<CreateVisit />} />
        <Route path="profile" element={<DoctorProfile />} />
      </Route>
    </Routes>
  );
}
