import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const PublicRoutes = lazy(() => import("./routes/PublicRoutes.jsx"));
const PatientRoutes = lazy(() => import("./routes/PatientRoutes.jsx"));
const DoctorRoutes = lazy(() => import("./routes/DoctorRoutes.jsx"));
const AdminRoutes = lazy(() => import("./routes/AdminRoutes.jsx"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/patient/*" element={<PatientRoutes />} />
          <Route path="/doctor/*" element={<DoctorRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/*" element={<PublicRoutes />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
