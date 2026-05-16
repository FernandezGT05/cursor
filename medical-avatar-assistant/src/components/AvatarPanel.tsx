import styles from "./AvatarPanel.module.css";

const agentId = import.meta.env.VITE_BEY_AGENT_ID;
const showIframe = Boolean(agentId);

export function AvatarPanel() {
  return (
    <section
      id="consultation"
      className={styles.panel}
      aria-label="Video consultation"
    >
      <div className={styles.panelHeader}>
        <div className={styles.statusRow}>
          <span className={styles.liveDot} aria-hidden />
          <span className={styles.statusLabel}>Ready to connect</span>
        </div>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlBtn}
            disabled
            aria-label="Toggle microphone"
            title="Microphone"
          >
            <MicIcon />
          </button>
          <button
            type="button"
            className={styles.controlBtn}
            disabled
            aria-label="Toggle camera"
            title="Camera"
          >
            <CameraIcon />
          </button>
          <button
            type="button"
            className={`${styles.controlBtn} ${styles.controlBtnEnd}`}
            disabled
            aria-label="End call"
            title="End session"
          >
            <PhoneIcon />
          </button>
        </div>
      </div>

      <div className={styles.viewport}>
        {showIframe ? (
          <iframe
            className={styles.iframe}
            src={`https://bey.chat/${agentId}`}
            title="MediCare AI virtual assistant"
            allow="camera; microphone; fullscreen"
            allowFullScreen
          />
        ) : (
          <AvatarPlaceholder />
        )}
      </div>

      <div className={styles.panelFooter}>
        <button type="button" className={styles.startBtn} disabled>
          <span className={styles.startBtnIcon} aria-hidden>
            ▶
          </span>
          Begin consultation
        </button>
        <p className={styles.hint}>
          {showIframe
            ? "Beyond Presence avatar embedded. UI-only controls above are placeholders."
            : "Set VITE_BEY_AGENT_ID in .env to embed your bey.chat agent."}
        </p>
      </div>
    </section>
  );
}

function AvatarPlaceholder() {
  return (
    <div className={styles.placeholder}>
      <div className={styles.avatarRing}>
        <div className={styles.avatarSilhouette}>
          <svg viewBox="0 0 120 140" fill="none" aria-hidden>
            <ellipse cx="60" cy="42" rx="28" ry="32" fill="currentColor" />
            <path
              d="M20 140c4-36 28-52 40-52s36 16 40 52"
              fill="currentColor"
            />
          </svg>
        </div>
        <span className={styles.pulse} aria-hidden />
      </div>
      <p className={styles.placeholderTitle}>Dr. Ava — Virtual Assistant</p>
      <p className={styles.placeholderSub}>
        Your Beyond Presence avatar will appear here
      </p>
      <div className={styles.waveform} aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className={styles.waveBar}
            style={{ animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 2.5V8l-4 2.5z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .55-.45 1-1 1H4v3h2.5c.55 0 1 .45 1 1v2.18A9.96 9.96 0 0 0 12 21c5.52 0 10-4.48 10-10S17.52 1 12 1 2 5.48 2 11h2c0-4.42 3.58-8 8-8z" />
    </svg>
  );
}
