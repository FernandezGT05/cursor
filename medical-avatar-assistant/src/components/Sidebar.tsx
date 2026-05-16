import styles from "./Sidebar.module.css";

const quickTopics = [
  {
    id: "symptoms",
    icon: "🩺",
    title: "Symptom guidance",
    description: "General wellness questions (not a diagnosis)",
  },
  {
    id: "appointments",
    icon: "📅",
    title: "Appointments",
    description: "Schedule or reschedule with your clinic",
  },
  {
    id: "medications",
    icon: "💊",
    title: "Medications",
    description: "Refill reminders and common drug info",
  },
  {
    id: "records",
    icon: "📋",
    title: "Health records",
    description: "How to access your patient portal",
  },
  {
    id: "emergency",
    icon: "🚨",
    title: "Urgent care",
    description: "When to seek emergency help",
  },
];

const sessionSteps = [
  { step: 1, label: "Verify identity", done: false },
  { step: 2, label: "Describe your concern", done: false },
  { step: 3, label: "Review guidance", done: false },
  { step: 4, label: "Next steps & follow-up", done: false },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Session tools">
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Quick topics</h2>
        <p className={styles.cardDesc}>
          Tap a topic when your session is live (UI preview only).
        </p>
        <ul className={styles.topicList}>
          {quickTopics.map((topic) => (
            <li key={topic.id}>
              <button type="button" className={styles.topicBtn} disabled>
                <span className={styles.topicIcon} aria-hidden>
                  {topic.icon}
                </span>
                <span className={styles.topicText}>
                  <span className={styles.topicTitle}>{topic.title}</span>
                  <span className={styles.topicSub}>{topic.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Session flow</h2>
        <ol className={styles.steps}>
          {sessionSteps.map((s) => (
            <li key={s.step} className={styles.step}>
              <span className={styles.stepNum}>{s.step}</span>
              <span className={styles.stepLabel}>{s.label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div id="resources" className={styles.cardAccent}>
        <h2 className={styles.cardTitle}>Patient resources</h2>
        <ul className={styles.linkList}>
          <li>
            <a href="#">Find a clinic near you</a>
          </li>
          <li>
            <a href="#">Insurance & billing FAQ</a>
          </li>
          <li>
            <a href="#">Download visit summary</a>
          </li>
        </ul>
      </div>

      <div className={styles.trust}>
        <ShieldIcon />
        <p>
          HIPAA-ready workflow design. Configure knowledge base and branding in
          your Beyond Presence dashboard.
        </p>
      </div>
    </aside>
  );
}

function ShieldIcon() {
  return (
    <svg
      className={styles.shieldIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
