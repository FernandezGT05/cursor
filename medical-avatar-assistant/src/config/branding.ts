/**
 * App shell branding (site chrome). Active agent name/greeting come from /api/session.
 * Align iframe styling with Beyond Presence → Settings → Custom Branding.
 */
export const branding = {
  appName: "Health Assistant",
  /** Fallback when API session is not loaded yet */
  defaultAssistantLabel: "your virtual assistant",
  tagline: "AI medical virtual assistant",
  heroEyebrow: "Virtual care · 24/7",
  heroSubhead:
    "Get general wellness guidance, appointment help, and answers to common health questions — through a lifelike video consultation.",
  brandColor: "#0d7a6f",
  accentColor: "#5b9bd5",
  fontColor: "#1a2e35",
  fontFamily: "'DM Sans', system-ui, sans-serif",
  brandEmail: "support@example.com",
  brandWebsite: "https://example.com",
  ctaButtonText: "Learn about our services",
  ctaButtonUrl: "https://example.com/services",
} as const;
