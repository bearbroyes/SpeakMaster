import { motion, AnimatePresence } from "motion/react";
import type { ThemeStyles } from "../themes";
import type { TranslationKey } from "../i18n/translations";

interface Props {
  ST: ThemeStyles;
  t: (key: TranslationKey) => string;
  bufferTimeLeft: number;
}

export function BufferPhase({ ST, t, bufferTimeLeft }: Props) {
  return (
    <motion.div
      key="buffer-clock-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className={`gradient-border-wrap max-w-md mx-auto w-full p-10 text-center space-y-8 shadow-2xl border rounded-[36px] card-shine ${ST.workflowCard}`}
      id="get_ready_modal"
      role="status"
      aria-live="polite"
    >
      <div className="space-y-2">
        <span className={`text-[10px] font-extrabold uppercase ${ST.bufferLabel}`}>{t("bufferState")}</span>
        <h3 className={`text-2xl font-black ${ST.bufferHeading}`}>{t("getReady")}</h3>
        <p className={`text-xs max-w-xs mx-auto ${ST.bufferDesc}`}>{t("bufferDesc")}</p>
      </div>

      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        className={`h-32 w-32 mx-auto rounded-full flex items-center justify-center border ${ST.bufferCircle}`}
        aria-label={`${bufferTimeLeft} seconds`}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={bufferTimeLeft}
            initial={{ y: 25, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -25, opacity: 0, scale: 0.7 }}
            className="font-mono text-5xl font-black text-white"
          >
            {bufferTimeLeft}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      <span className={`text-[10px] italic block ${ST.bufferFooter}`}>{t("bufferNote")}</span>
    </motion.div>
  );
}
