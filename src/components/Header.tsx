import { MicOff } from "lucide-react";
import type { ThemeStyles } from "../themes";
import { ThemeSwitcher } from "./ThemeSwitcher";
import type { Theme, Lang } from "../types";
import type { TranslationKey } from "../i18n/translations";

interface Props {
  ST: ThemeStyles;
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  micPermission: "granted" | "denied" | "prompt" | "unknown";
  onRequestMic: () => void;
  onBack: () => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

export function Header({
  ST,
  theme,
  setTheme,
  lang,
  setLang,
  micPermission,
  onRequestMic,
  onBack,
  t,
}: Props) {
  return (
    <header
      id="app_header"
      className={`h-20 flex items-center justify-between px-6 sm:px-10 border-b z-30 sticky top-0 transition-all duration-300 ${ST.headerBg}`}
    >
      <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center logo-glow hover:scale-105 active:scale-95 transition-transform ${ST.logoBox}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white" aria-hidden="true">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${ST.headerTitle}`}>
            SpeakMaster<span className={`${ST.brandAccent} font-normal`}>Pro</span>
          </h1>
          <p className={`hidden sm:block text-[9px] ${ST.headerSubtitle} font-bold uppercase tracking-wider`}>
            {t("appSubtitle")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <ThemeSwitcher theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} ST={ST} />

        {micPermission === "granted" ? (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${ST.micGranted}`}>
            <div className={`w-2 h-2 rounded-full ${ST.micDot}`} aria-hidden="true" />
            <span className="text-xs font-semibold">{t("micConnected")}</span>
          </div>
        ) : (
          <button
            id="header_mic_auth"
            onClick={onRequestMic}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold cursor-pointer ${ST.micPrompt}`}
          >
            <MicOff className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{t("allowMic")}</span>
          </button>
        )}
      </div>
    </header>
  );
}
