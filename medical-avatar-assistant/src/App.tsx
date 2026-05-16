import { Navigate, Route, Routes } from "react-router-dom";
import { ScrollToTopButton } from "./components/ScrollToTopButton";
import { ScrollToTopOnNavigate } from "./components/ScrollToTopOnNavigate";
import { ConsultationPage } from "./pages/ConsultationPage";
import { HomePage } from "./pages/HomePage";
import { SignInPage } from "./pages/SignInPage";

export default function App() {
  return (
    <>
      <ScrollToTopOnNavigate />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/consultation" element={<ConsultationPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ScrollToTopButton />
    </>
  );
}
