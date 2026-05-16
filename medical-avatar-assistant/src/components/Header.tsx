import { Link, useNavigate } from "react-router-dom";
import { branding } from "../config/branding";
import { useAuth } from "../context/AuthContext";
import { useSession } from "../context/SessionContext";
import styles from "./Header.module.css";

function LogoIcon() {
  return (
    <svg
      className={styles.logoIcon}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="currentColor" opacity="0.12" />
      <path
        d="M16 8v16M11 13h10M11 19h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const {
    loading,
    connected,
    consultationActive,
    startConsultation,
    endConsultation,
  } = useSession();
  const navigate = useNavigate();

  const handleSignOut = () => {
    if (consultationActive) {
      endConsultation();
    }
    signOut();
    navigate("/");
  };

  const handleSession = () => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: { pathname: "/" } } });
      return;
    }
    if (consultationActive) {
      endConsultation();
    } else {
      startConsultation();
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <LogoIcon />
          <span className={styles.brandText}>
            <span className={styles.brandName}>{branding.appName}</span>
            <span className={styles.brandTag}>{branding.tagline}</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <a href="#consultation" className={styles.navLinkActive}>
            Consultation
          </a>
          <a href="#resources" className={styles.navLink}>
            Resources
          </a>
          <a href="#contact" className={styles.navLink}>
            Contact
          </a>
        </nav>

        <div className={styles.actions}>
          <span className={styles.planBadge}>Growth</span>
          <span
            className={`${styles.statusPill} ${connected ? styles.statusPillOn : ""}`}
            title={connected ? "API connected" : "API offline"}
          >
            {loading ? "…" : connected ? "Live" : "Offline"}
          </span>

          {isAuthenticated && user ? (
            <>
              <span className={styles.userChip}>
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt=""
                    className={styles.userAvatar}
                    width={28}
                    height={28}
                  />
                ) : (
                  <span className={styles.userInitial} aria-hidden>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className={styles.userName}>{user.name}</span>
              </span>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/signin" className={styles.btnGhost}>
              Sign in
            </Link>
          )}

          <button
            type="button"
            className={styles.btnPrimary}
            disabled={isAuthenticated && (!connected || loading)}
            onClick={handleSession}
          >
            {consultationActive
              ? "End session"
              : isAuthenticated
                ? `Talk to ${branding.agentName}`
                : "Start session"}
          </button>
        </div>
      </div>
    </header>
  );
}
