import { motion } from "motion/react";
import { Palette, Sun, Moon, Languages } from "lucide-react";
import type { Theme, Lang } from "../types";
import type { ThemeStyles } from "../themes";

interface Props {
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  ST: ThemeStyles;
}

export function ThemeSwitcher({ theme, setTheme, lang, setLang, ST }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLang(lang === "ru" ? "en" : "ru")}
        title={lang === "ru" ? "English" : "Русский"}
        className={`btn-glow p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold cursor-pointer border ${ST.langBtn}`}
        aria-label="Switch language"
      >
        <Languages className="h-3.5 w-3.5" />
        {lang.toUpperCase()}
      </button>

      <div
        id="theme_switcher_group"
        className={`relative flex items-center gap-1 p-1 rounded-xl transition-all duration-300 border ${ST.themeSwitcherBg}`}
      >
        {(
          [
            { id: "violet" as Theme, icon: Palette, active: ST.themeActive },
            { id: "dark" as Theme, icon: Moon, active: ST.themeBtnDarkActive },
            { id: "light" as Theme, icon: Sun, active: ST.themeBtnLightActive },
          ] as const
        ).map(({ id, icon: Icon, active }) => (
          <button
            key={id}
            id={`theme_btn_${id}`}
            title={id === "violet" ? "Фиолетовая тема" : id === "dark" ? "Темная тема" : "Светлая тема"}
            onClick={() => setTheme(id)}
            className={`relative z-10 p-1.5 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              theme === id ? "" : ST.themeInactive
            }`}
            aria-pressed={theme === id}
          >
            {theme === id && (
              <motion.span
                layoutId="theme-pill"
                className={`absolute inset-0 rounded-lg ${active}`}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon
              className={`h-3.5 w-3.5 relative z-10 ${
                theme === id ? (id === "light" ? "text-indigo-600" : "text-white") : ""
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
