import { useEffect, useState } from "react";
import type { Lang } from "../types";
import { t, type TranslationKey } from "../i18n/translations";

const KEY = "speakmaster_lang";

export function useI18n() {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      return saved === "en" || saved === "ru" ? saved : "ru";
    } catch {
      return "ru";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {
      console.warn("Could not save language:", e);
    }
  }, [lang]);

  const translate = (key: TranslationKey, vars?: Record<string, string | number>) => t(lang, key, vars);

  return { lang, setLang, t: translate };
}
