/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// Static palette — not theme-dependent
export const Palette = {
  screenBg: "#FFFBF5", // blanc cassé légèrement orangé

  cardBg: "#FFFFFF",

  primary: "#FF9811",
  primaryPressed: "#E08710",
  primaryLight: "#FEF3C7",

  accent: "#DB2777", // pink-600 — actions secondaires
  accentLight: "#FCE7F3",
  accentPressed: "#BE185D",

  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  link: "#FF9811",

  border: "#E8E5F0",
  borderFocus: "#FF9811",

  error: "#EF4444",
  errorLight: "#FEF2F2",

  success: "#10B981",
  successLight: "#ECFDF5",

  warning: "#F59E0B",
  warningLight: "#FFFBEB",

  // Level badge palette (1–10, higher = warmer/more intense)
  levelBeginner: "#16A34A", // 1–2
  levelBeginnerLight: "#F0FDF4",
  levelIntermediate: "#0D9488", // 3–4
  levelIntermediateLight: "#F0FDFA",
  levelAdvanced: "#B45309", // 5–6
  levelAdvancedLight: "#FFFBEB",
  levelExpert: "#EA580C", // 7–8
  levelExpertLight: "#FFF7ED",
  levelElite: "#E11D48", // 9–10
  levelEliteLight: "#FFF1F2",

  surface: "#fdfdfe",
  surfaceMid: "#F8FAFC",
  surfaceSubtle: "#F1F5F9",
  avatarBg: "#E2E8F0",

  whiteSubtle: "rgba(255, 255, 255, 0.4)",
  logoOuterBg: "rgba(15, 23, 42, 0.06)",

  white: "#FFFFFF",
  black: "#000000",
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;
