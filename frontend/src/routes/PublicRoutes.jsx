import "../styles/styles.css";
import { Routes, Route } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import Home from "../pages/public/Home.jsx";
import About from "../pages/public/About.jsx";
import Contact from "../pages/public/Contact.jsx";
import Privacy from "../pages/public/Privacy.jsx";
import Terms from "../pages/public/Terms.jsx";
import Login from "../pages/public/Login.jsx";
import Register from "../pages/public/Register.jsx";
import ForgotPassword from "../pages/public/ForgotPassword.jsx";
import VerifyOtp from "../pages/public/VerifyOtp.jsx";
import Dashboard from "../pages/public/Dashboard.jsx";
import NotFound from "../pages/public/NotFound.jsx";

export default function PublicRoutes() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route element={<MarketingLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
