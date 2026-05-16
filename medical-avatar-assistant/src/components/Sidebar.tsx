import { useAssistantLabel } from "../hooks/useAssistantLabel";
import { useSession } from "../context/SessionContext";
import styles from "./Sidebar.module.css";

const quickTopics = [
  {
    id: "symptoms",
    icon: "🩺",
    title: "Symptom guidance",
    description: "General wellness questions (not a diagnosis)",
    prompt: "I'd like to discuss some symptoms I'm experiencing.",
  },
  {
    id: "appointments",
    icon: "📅",
    title: "Appointments",
    description: "Schedule or reschedule with your clinic",
    prompt: "I need help scheduling or rescheduling an appointment.",
  },
  {
    id: "medications",
    icon: "💊",
    title: "Medications",
    description: "Refill reminders and common drug info",
    prompt: "I have a question about my medications.",
  },
  {
    id: "records",
    icon: "📋",
    title: "Health records",
    description: "How to access your patient portal",
    prompt: "How can I access my health records or patient portal?",
  },
  {
    id: "emergency",
    icon: "🚨",
    title: "Urgent care",
    description: "When to seek emergency help",
    prompt: "When should I seek urgent or emergency care?",
  },
];

const sessionSteps = [
  { step: 1, label: "Verify identity", key: "verify" },
  { step: 2, label: "Describe your concern", key: "describe" },
  { step: 3, label: "Review guidance", key: "review" },
  { step: 4, label: "Next steps & follow-up", key: "followup" },
];

export function Sidebar() {
  const {
    consultationActive,
    startConsultation,
    connected,
    selectedSpecialty,
    isSetupComplete,
  } = useSession();
  const assistantLabel = useAssistantLabel();

  const handleTopic = () => {
    if (!consultationActive && connected && selectedSpecialty) {
      startConsultation();
    }
  };

  return (
    <aside className={styles.sidebar} aria-label="Session tools">
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Quick topics</h2>
        <p className={styles.cardDesc}>
          {consultationActive
            ? `Mention these topics when speaking with ${assistantLabel}.`
            : "Start a session, then use these conversation starters."}
        </p>
        <ul className={styles.topicList}>
          {quickTopics.map((topic) => (
            <li key={topic.id}>
              <button
                type="button"
                className={styles.topicBtn}
                disabled={!connected || !isSetupComplete}
                onClick={handleTopic}
                title={topic.prompt}
              >
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
          {sessionSteps.map((s, index) => (
            <li
              key={s.step}
              className={`${styles.step} ${consultationActive && index === 1 ? styles.stepActive : ""}`}
            >
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
          Switch agents by updating <code>BEY_AGENT_ID</code> in{" "}
          <code>.env</code>, then click Refresh on the banner.
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
