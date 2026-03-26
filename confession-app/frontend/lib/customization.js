export const FONT_PRESETS = [
  { id: "default", label: "Default" },
  { id: "rounded", label: "Rounded" },
  { id: "classic", label: "Classic" },
  { id: "mono", label: "Mono" }
];

export const TEXT_TONE_PRESETS = [
  { id: "standard", label: "Standard" },
  { id: "soft", label: "Soft" },
  { id: "high", label: "High Contrast" },
  { id: "dim", label: "Dim" }
];

export const LAYOUT_MODES = [
  { id: "balanced", label: "Balanced" },
  { id: "twitter", label: "Twitter Flow" },
  { id: "instagram", label: "Instagram Cards" },
  { id: "compact", label: "Compact Feed" },
  { id: "magazine", label: "Magazine" },
  { id: "bubble", label: "Bubble" },
  { id: "glass", label: "Glass" },
  { id: "neo", label: "Neo Panel" },
  { id: "outline", label: "Outline" },
  { id: "softgrid", label: "Soft Grid" }
];

const ACCENTS = [
  { id: "blue", label: "Blue", primary: "#0b57d0", strong: "#1a73e8", softLight: "rgba(11, 87, 208, 0.10)", softDark: "rgba(138, 180, 248, 0.16)" },
  { id: "indigo", label: "Indigo", primary: "#4154d8", strong: "#5c6cf0", softLight: "rgba(65, 84, 216, 0.10)", softDark: "rgba(139, 150, 255, 0.16)" },
  { id: "teal", label: "Teal", primary: "#006b6b", strong: "#008b8b", softLight: "rgba(0, 107, 107, 0.10)", softDark: "rgba(90, 210, 210, 0.16)" },
  { id: "green", label: "Green", primary: "#137333", strong: "#1e8e3e", softLight: "rgba(19, 115, 51, 0.10)", softDark: "rgba(129, 201, 149, 0.16)" },
  { id: "amber", label: "Amber", primary: "#a15c00", strong: "#c58b00", softLight: "rgba(161, 92, 0, 0.12)", softDark: "rgba(255, 207, 102, 0.16)" },
  { id: "orange", label: "Orange", primary: "#c26401", strong: "#e37400", softLight: "rgba(194, 100, 1, 0.12)", softDark: "rgba(255, 183, 120, 0.16)" },
  { id: "rose", label: "Rose", primary: "#b3265d", strong: "#d43f7a", softLight: "rgba(179, 38, 93, 0.12)", softDark: "rgba(255, 145, 190, 0.16)" },
  { id: "violet", label: "Violet", primary: "#7b3ff2", strong: "#9860ff", softLight: "rgba(123, 63, 242, 0.12)", softDark: "rgba(193, 161, 255, 0.16)" },
  { id: "cyan", label: "Cyan", primary: "#007fa3", strong: "#129bc2", softLight: "rgba(0, 127, 163, 0.12)", softDark: "rgba(132, 221, 255, 0.16)" },
  { id: "graphite", label: "Graphite", primary: "#3c4043", strong: "#5f6368", softLight: "rgba(60, 64, 67, 0.10)", softDark: "rgba(189, 193, 198, 0.16)" }
];

const SURFACES = [
  {
    id: "mist",
    label: "Mist",
    light: { bg: "#f7f8fc", bgSecondary: "#eef3fd", card: "#ffffff", s1: "#ffffff", s2: "#f8faff", s3: "#edf2fd", line: "#d7dce5", ambientA: "rgba(26,115,232,0.18)", ambientB: "rgba(52,168,83,0.12)", ambientC: "rgba(251,188,4,0.12)" },
    dark: { bg: "#11131a", bgSecondary: "#19202b", card: "#1e222b", s1: "#1b1f27", s2: "#20242d", s3: "#252b36", line: "#313846", ambientA: "rgba(138,180,248,0.14)", ambientB: "rgba(129,201,149,0.10)", ambientC: "rgba(251,188,4,0.08)" }
  },
  {
    id: "paper",
    label: "Paper",
    light: { bg: "#faf7f2", bgSecondary: "#f3ede3", card: "#ffffff", s1: "#fffdfa", s2: "#faf3ea", s3: "#f4e9dd", line: "#ddcfc2", ambientA: "rgba(194,100,1,0.14)", ambientB: "rgba(11,87,208,0.10)", ambientC: "rgba(234,67,53,0.10)" },
    dark: { bg: "#171311", bgSecondary: "#211c18", card: "#241f1b", s1: "#241f1b", s2: "#2a241f", s3: "#302923", line: "#403730", ambientA: "rgba(255,183,120,0.12)", ambientB: "rgba(168,199,250,0.10)", ambientC: "rgba(255,145,120,0.10)" }
  },
  {
    id: "mint",
    label: "Mint",
    light: { bg: "#f3fbf8", bgSecondary: "#e3f4ed", card: "#ffffff", s1: "#ffffff", s2: "#f4fcf8", s3: "#e5f6ef", line: "#cde2d9", ambientA: "rgba(19,115,51,0.14)", ambientB: "rgba(0,127,163,0.10)", ambientC: "rgba(251,188,4,0.08)" },
    dark: { bg: "#101816", bgSecondary: "#16211d", card: "#1b2622", s1: "#1b2622", s2: "#20302b", s3: "#273933", line: "#32453f", ambientA: "rgba(129,201,149,0.12)", ambientB: "rgba(132,221,255,0.10)", ambientC: "rgba(255,207,102,0.08)" }
  },
  {
    id: "dusk",
    label: "Dusk",
    light: { bg: "#f6f5fd", bgSecondary: "#ece9fb", card: "#ffffff", s1: "#ffffff", s2: "#f6f3ff", s3: "#ece7ff", line: "#d6d1ef", ambientA: "rgba(123,63,242,0.14)", ambientB: "rgba(11,87,208,0.10)", ambientC: "rgba(179,38,93,0.08)" },
    dark: { bg: "#13111b", bgSecondary: "#1b1725", card: "#221d2d", s1: "#221d2d", s2: "#282136", s3: "#302843", line: "#3a3250", ambientA: "rgba(193,161,255,0.12)", ambientB: "rgba(168,199,250,0.10)", ambientC: "rgba(255,145,190,0.08)" }
  },
  {
    id: "slate",
    label: "Slate",
    light: { bg: "#f4f7fa", bgSecondary: "#e8eef4", card: "#ffffff", s1: "#ffffff", s2: "#f4f8fc", s3: "#e6edf5", line: "#d0d9e3", ambientA: "rgba(60,64,67,0.12)", ambientB: "rgba(0,127,163,0.10)", ambientC: "rgba(65,84,216,0.08)" },
    dark: { bg: "#101418", bgSecondary: "#161d24", card: "#1b232b", s1: "#1b232b", s2: "#212a33", s3: "#27313b", line: "#323d49", ambientA: "rgba(189,193,198,0.12)", ambientB: "rgba(132,221,255,0.08)", ambientC: "rgba(139,150,255,0.08)" }
  }
];

export const THEME_PRESETS = ACCENTS.flatMap((accent) =>
  SURFACES.map((surface, index) => ({
    id: `${accent.id}-${surface.id}`,
    label: `${accent.label} ${surface.label}`,
    accentId: accent.id,
    surfaceId: surface.id,
    order: index
  }))
);

export function getPresetById(id) {
  return THEME_PRESETS.find((preset) => preset.id === id) || THEME_PRESETS[0];
}

export function applyUiSettings(settings, resolvedTheme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const preset = getPresetById(settings.presetId);
  const accent = ACCENTS.find((item) => item.id === preset.accentId) || ACCENTS[0];
  const surfaceGroup = SURFACES.find((item) => item.id === preset.surfaceId) || SURFACES[0];
  const modePalette = resolvedTheme === "dark" ? surfaceGroup.dark : surfaceGroup.light;
  const toneMap = getTextToneMap(resolvedTheme)[settings.textTone] || getTextToneMap(resolvedTheme).standard;

  root.style.setProperty("--accent", accent.primary);
  root.style.setProperty("--accent-strong", accent.strong);
  root.style.setProperty("--accent-soft", resolvedTheme === "dark" ? accent.softDark : accent.softLight);
  root.style.setProperty("--bg", modePalette.bg);
  root.style.setProperty("--bg-secondary", modePalette.bgSecondary);
  root.style.setProperty("--card", resolvedTheme === "dark" ? "rgba(30, 34, 43, 0.95)" : "rgba(255, 255, 255, 0.94)");
  root.style.setProperty("--card-strong", modePalette.card);
  root.style.setProperty("--surface-1", modePalette.s1);
  root.style.setProperty("--surface-2", modePalette.s2);
  root.style.setProperty("--surface-3", modePalette.s3);
  root.style.setProperty("--line", modePalette.line);
  root.style.setProperty("--ambient-a", modePalette.ambientA);
  root.style.setProperty("--ambient-b", modePalette.ambientB);
  root.style.setProperty("--ambient-c", modePalette.ambientC);
  root.style.setProperty("--text", toneMap.text);
  root.style.setProperty("--muted", toneMap.muted);
  root.style.setProperty("--text-scale", String(settings.textScale));
  root.style.setProperty("--radius-scale", String(settings.radius));
  const navScale = settings.navScale ?? 0.9;
  root.style.setProperty("--nav-scale", String(navScale));
  root.style.setProperty("--nav-gap", `${(0.55 * navScale).toFixed(3)}rem`);
  root.style.setProperty("--nav-padding", `${(0.6 * navScale).toFixed(3)}rem`);
  root.style.setProperty("--nav-radius", `${(1.4 * navScale).toFixed(3)}rem`);
  root.style.setProperty("--nav-link-radius", `${(0.95 * navScale).toFixed(3)}rem`);
  root.style.setProperty("--nav-compose-radius", `${(1 * navScale).toFixed(3)}rem`);
  root.style.setProperty("--nav-link-y", `${(0.72 * navScale).toFixed(3)}rem`);
  root.style.setProperty("--nav-link-x", `${(0.6 * navScale).toFixed(3)}rem`);
  root.style.setProperty("--nav-min-height", `${(3.15 * navScale).toFixed(3)}rem`);
  root.style.setProperty("--nav-font-size-mobile", `${(0.72 * navScale).toFixed(3)}rem`);
  root.dataset.font = settings.font;
  root.dataset.layout = settings.layoutMode;
}

function getTextToneMap(theme) {
  if (theme === "dark") {
    return {
      standard: { text: "#e8eaed", muted: "#9aa0a6" },
      soft: { text: "#d8dce0", muted: "#8f98a1" },
      high: { text: "#ffffff", muted: "#c5cad0" },
      dim: { text: "#c7ccd1", muted: "#7f8790" }
    };
  }

  return {
    standard: { text: "#1f1f1f", muted: "#5f6368" },
    soft: { text: "#374151", muted: "#6b7280" },
    high: { text: "#111111", muted: "#3c4043" },
    dim: { text: "#4b5563", muted: "#7b8590" }
  };
}
