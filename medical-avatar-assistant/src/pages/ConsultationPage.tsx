import { Navigate, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { AvatarPanel } from "../components/AvatarPanel";
import { Sidebar } from "../components/Sidebar";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import styles from "../App.module.css";

export function ConsultationPage() {
  const { isAuthenticated, isSigningOut } = useAuth();
  const location = useLocation();

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
          <p className={styles.eyebrow}>Virtual care ┬╖ 24/7</p>
          <h1 className={styles.headline}>
            Speak with your <em>health assistant</em>
          </h1>
          <p className={styles.subhead}>
            Get general wellness guidance, appointment help, and answers to
            common health questions ΓÇö powered by a lifelike AI avatar.
          </p>
        </section>

        <div className={styles.workspace}>
          <AvatarPanel />
          <Sidebar />
        </div>
      </main>
      <ContactSection />
      <Footer />
    </div>
  );
}
