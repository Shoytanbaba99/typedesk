import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type ThemeId =
  | "fallout-green"
  | "wyse-amber"
  | "bletchley-cipher"
  | "monastic-ledger"
  | "cyberpunk-edo";

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  colorPreview: string;
}

export const THEME_LIST: ThemeMeta[] = [
  { id: "fallout-green", label: "FALLOUT", colorPreview: "#00FF66" },
  { id: "wyse-amber", label: "WYSE", colorPreview: "#E6C07B" },
  { id: "bletchley-cipher", label: "RADAR", colorPreview: "#00FFD5" },
  { id: "monastic-ledger", label: "CODEX", colorPreview: "#C82323" },
  { id: "cyberpunk-edo", label: "CYBER", colorPreview: "#FF007F" },
];

/**
 * useThemeSwitcher
 * Single source of truth for theme state, localStorage persistence,
 * and guarded DOM root attribute synchronization.
 */
export function useThemeSwitcher() {
  const [theme, setTheme] = useLocalStorage<ThemeId>("typedesk-theme", "fallout-green");

  useEffect(() => {
    if (document.documentElement.getAttribute("data-theme") !== theme) {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return {
    theme,
    setTheme,
    themes: THEME_LIST,
  };
}
