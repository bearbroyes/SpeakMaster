import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import type { ThemeStyles } from "../themes";
import type { TranslationKey } from "../i18n/translations";

const INTRO_KEY = "speakmaster_intro_done";
const AUTO_ADVANCE_MS = 5000;

interface Props {
  ST: ThemeStyles;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  onComplete: () => void;
}

export function shouldShowIntro(): boolean {
  try {
    return sessionStorage.getItem(INTRO_KEY) !== "ok";
  } catch {
    return true;
  }
}

export function markIntroComplete(): void {
  try {
    sessionStorage.setItem(INTRO_KEY, "ok");
  } catch {
    /* ignore */
  }
}

export function IntroSplash({ ST, t, onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    markIntroComplete();
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      setProgress(Math.min(100, (elapsed / AUTO_ADVANCE_MS) * 100));
      if (elapsed >= AUTO_ADVANCE_MS) {
        finish();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [finish]);

  return (
    <motion.div
      id="intro_splash"
      className="fixed inset-0 z-[120] flex items-center justify-center px-6 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" aria-hidden="true" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="intro-orb intro-orb-1" />
        <div className="intro-orb intro-orb-2" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <motion.div
          className={`intro-logo-wrap w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] flex items-center justify-center mb-8 ${ST.logoBox}`}
          initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
            aria-hidden="true"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </motion.svg>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          SpeakMaster
          <motion.span
            className={`${ST.brandAccent} font-normal`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            Pro
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-sm sm:text-base leading-relaxed text-slate-300 max-w-md mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          {t("introTagline")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-xs"
        >
          <button
            type="button"
            onClick={finish}
            className={`intro-continue-btn relative w-full overflow-hidden py-4 rounded-2xl font-black text-sm cursor-pointer ${ST.primaryButton}`}
          >
            <span
              className="intro-continue-fill absolute inset-y-0 left-0 bg-white/20 pointer-events-none"
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
            <span className="relative z-10">{t("introContinue")}</span>
          </button>
          <p className={`mt-3 text-[10px] uppercase tracking-widest ${ST.iconMuted}`}>
            {t("introAutoHint", { sec: Math.ceil((AUTO_ADVANCE_MS * (1 - progress / 100)) / 1000) })}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
