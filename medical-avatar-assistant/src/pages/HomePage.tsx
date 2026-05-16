import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import layout from "../App.module.css";
import styles from "./HomePage.module.css";

const consultationReturn = { from: { pathname: "/consultation" } };

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={layout.layout}>
      <Header />
      <main className={`${layout.main} ${styles.main}`}>
        <section className={styles.hero} aria-label="Welcome">
          <p className={layout.eyebrow}>Virtual care · 24/7</p>
          <h1 className={layout.headline}>
            Speak with your <em>health assistant</em>
          </h1>
          <p className={layout.subhead}>
            Get general wellness guidance, appointment help, and answers to
            common health questions — whenever you need them.
          </p>
          <div className={styles.actions}>
            <Link
              to={isAuthenticated ? "/consultation" : "/signin"}
              state={isAuthenticated ? undefined : consultationReturn}
              className={styles.ctaPrimary}
            >
              Start conversation
            </Link>
            {!isAuthenticated && (
              <Link
                to="/signin"
                state={consultationReturn}
                className={styles.ctaSecondary}
              >
                Sign in
              </Link>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
