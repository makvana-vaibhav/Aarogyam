import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const PublicRoutes = lazy(() => import("./routes/PublicRoutes.jsx"));
const PortalRoutes = lazy(() => import("./routes/PortalRoutes.jsx"));
const AdminRoutes = lazy(() => import("./routes/AdminRoutes.jsx"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/patient/*" element={<PortalRoutes />} />
          <Route path="/doctor/*" element={<PortalRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/*" element={<PublicRoutes />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
