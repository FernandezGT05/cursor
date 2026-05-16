import { branding } from "../config/branding";
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
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href="/" className={styles.brand}>
          <LogoIcon />
          <span className={styles.brandText}>
            <span className={styles.brandName}>{branding.appName}</span>
            <span className={styles.brandTag}>{branding.tagline}</span>
          </span>
        </a>

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
          <button type="button" className={styles.btnGhost} disabled>
            Sign in
          </button>
          <button type="button" className={styles.btnPrimary} disabled>
            Start session
          </button>
        </div>
      </div>
    </header>
  );
}
