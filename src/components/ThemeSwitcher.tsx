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
        className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all cursor-pointer border ${
          theme === "light" ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-slate-300"
        }`}
        aria-label="Switch language"
      >
        <Languages className="h-3.5 w-3.5" />
        {lang.toUpperCase()}
      </button>

      <div
        id="theme_switcher_group"
        className={`flex items-center gap-1 p-1 rounded-xl transition-all duration-300 border ${
          theme === "light" ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/10"
        }`}
      >
        <button
          id="theme_btn_violet"
          title="Фиолетовая тема"
          onClick={() => setTheme("violet")}
          className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            theme === "violet" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-indigo-400"
          }`}
          aria-pressed={theme === "violet"}
        >
          <Palette className="h-3.5 w-3.5" />
        </button>
        <button
          id="theme_btn_dark"
          title="Темная тема"
          onClick={() => setTheme("dark")}
          className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            theme === "dark" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
          }`}
          aria-pressed={theme === "dark"}
        >
          <Moon className="h-3.5 w-3.5" />
        </button>
        <button
          id="theme_btn_light"
          title="Светлая тема"
          onClick={() => setTheme("light")}
          className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            theme === "light" ? "bg-white text-indigo-600 shadow-xs border border-slate-200" : "text-slate-400 hover:text-slate-800"
          }`}
          aria-pressed={theme === "light"}
        >
          <Sun className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
