import { useEffect, useState } from "react";
import type { Theme } from "../types";
import { THEME_STYLES } from "../themes";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem("speakmaster_theme");
      return saved === "light" || saved === "dark" || saved === "violet" ? (saved as Theme) : "violet";
    } catch {
      return "violet";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("speakmaster_theme", theme);
    } catch (e) {
      console.warn("Could not save theme:", e);
    }
  }, [theme]);

  return { theme, setTheme, ST: THEME_STYLES[theme] };
}
