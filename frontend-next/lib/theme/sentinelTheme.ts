export const sentinelTheme = {
  brand: {
    name: "Safety InSite",
    engine: "HazLenz AI",
    navy: "#0f172a",
    headerNavy: "#102A43",
    blue: "#2563eb",
    blueDark: "#1d4ed8",
    sky: "#5DB7FF",
    slate: "#475569",
    lightSlate: "#64748b",
    border: "rgba(148, 163, 184, 0.28)",
  },

  page: {
    shell: "sentinel-page-shell",
    header: "sentinel-page-header",
    eyebrow: "sentinel-eyebrow",
    title: "sentinel-page-title",
    subtitle: "sentinel-page-subtitle",
  },

  card: {
    base: "sentinel-card",
    strong: "sentinel-card-strong",
    muted: "sentinel-card-muted",
    metric: "sentinel-metric-card",
  },

  text: {
    sectionTitle: "sentinel-section-title",
    sectionSubtitle: "sentinel-section-subtitle",
    metricLabel: "sentinel-metric-label",
    metricValue: "sentinel-metric-value",
  },

  button: {
    primary: "sentinel-primary-button",
    secondary: "sentinel-secondary-button",
  },

  form: {
    input: "sentinel-input",
  },

  badge: {
    status: "sentinel-status-pill",
  },
} as const;

export type SentinelTheme = typeof sentinelTheme;
