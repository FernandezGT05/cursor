import { Navigate, Route, Routes } from "react-router-dom";
import { ConsultationPage } from "./pages/ConsultationPage";
import { HomePage } from "./pages/HomePage";
import { SignInPage } from "./pages/SignInPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/consultation" element={<ConsultationPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
