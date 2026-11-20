/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Brand = {
  colors: {
    primary: "#A27440",
    primaryHover: "#8C6236",
    primaryLight: "#A87D4C",
    ink: "#000000",
    inkSoft: "#1A1A1A",
    background: "#FFFFFF",
    surface: "#E8DCCF",
    muted: "#B99770",
    border: "#D6C2AB",
    success: "#4C6B4F",
    error: "#8B3A3A",
  },
  radius: {
    small: 2,
    medium: 4,
    large: 8,
  },
} as const;

export const Colors = {
  light: {
    text: Brand.colors.ink,
    background: Brand.colors.background,
    backgroundElement: Brand.colors.surface,
    backgroundSelected: "#F4EEE8",
    textSecondary: Brand.colors.muted,
  },
  dark: {
    text: "#FFFFFF",
    background: Brand.colors.ink,
    backgroundElement: "#211B16",
    backgroundSelected: "#33271D",
    textSecondary: "#D6C2AB",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "Inter",
    serif: "Playfair Display",
    rounded: "Inter",
    mono: "ui-monospace",
  },
  default: {
    sans: "sans-serif",
    serif: "serif",
    rounded: "sans-serif",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-sans)",
    serif: "var(--font-serif)",
    rounded: "var(--font-sans)",
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
