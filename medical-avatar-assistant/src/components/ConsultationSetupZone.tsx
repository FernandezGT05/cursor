import { AgentSelector } from "./AgentSelector";
import { AgentTypeSelector } from "./AgentTypeSelector";
import { AvatarPanel } from "./AvatarPanel";
import { Sidebar } from "./Sidebar";
import { useSession } from "../context/SessionContext";
import styles from "./ConsultationSetupZone.module.css";

type SetupPhase = "specialty" | "agent" | "conversation";

function getPhase(specialty: boolean, agent: boolean): SetupPhase {
  if (!specialty) return "specialty";
  if (!agent) return "agent";
  return "conversation";
}

export function ConsultationSetupZone() {
  const { selectedSpecialty, selectedAgentId, isSetupComplete } = useSession();

  const phase = getPhase(Boolean(selectedSpecialty), Boolean(selectedAgentId));

  return (
    <div className={styles.zone}>
      {phase === "specialty" && <AgentTypeSelector />}

      {phase === "agent" && <AgentSelector />}

      {phase === "conversation" && (
        <div className={styles.conversation}>
          <AvatarPanel />
          {isSetupComplete && (
            <aside className={styles.tools}>
              <Sidebar />
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
