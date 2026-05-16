import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { ConsultationSetupZone } from "../components/ConsultationSetupZone";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useSession } from "../context/SessionContext";
import { branding } from "../config/branding";
import styles from "../App.module.css";

export function ConsultationPage() {
  const { isAuthenticated, isSigningOut } = useAuth();
  const { resetConsultationSetup } = useSession();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      resetConsultationSetup();
    }
  }, [isAuthenticated, location.pathname, resetConsultationSetup]);

  if (!isAuthenticated) {
    if (isSigningOut) {
      return null;
    }
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero} aria-label="Welcome">
          <p className={styles.eyebrow}>{branding.heroEyebrow}</p>
          <h1 className={styles.headline}>
            Speak with your <em>health assistant</em>
          </h1>
          <p className={styles.subhead}>{branding.consultationSubhead}</p>
        </section>

        <ConsultationSetupZone />
      </main>
      <ContactSection />
      <Footer />
    </div>
  );
}
