import type { Dispatch, SetStateAction } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { Monologue, PracticeMode } from "../types";
import type { ThemeStyles } from "../themes";
import type { TranslationKey } from "../i18n/translations";

interface Props {
  ST: ThemeStyles;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  monologue: Monologue;
  recordingSeconds: number;
  checkedPoints: Record<number, boolean>;
  setCheckedPoints: Dispatch<SetStateAction<Record<number, boolean>>>;
  practiceMode: PracticeMode;
  formatTime: (s: number) => string;
  onStop: () => void;
  onCancel?: () => void;
}

export function RecordingPhase({
  ST,
  t,
  monologue,
  recordingSeconds,
  checkedPoints,
  setCheckedPoints,
  practiceMode,
  formatTime,
  onStop,
  onCancel,
}: Props) {
  const done = Object.values(checkedPoints).filter(Boolean).length;

  return (
    <motion.div
      key="recording-panel-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className={`max-w-4xl mx-auto w-full border rounded-[32px] shadow-2xl overflow-hidden ${ST.workflowCard}`}
      id="active_recording_canvas"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
        <div className={`md:col-span-7 p-6 sm:p-12 border-b md:border-b-0 md:border-r space-y-6 ${ST.cardDivider}`}>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg uppercase animate-pulse">
              {t("liveRecording")}
            </span>
            <h2 className={`text-xl font-bold uppercase ${ST.workflowHeading}`}>Card {monologue.id}</h2>
          </div>

          <h3 className={`text-2xl font-black capitalize ${ST.workflowHeading}`}>{monologue.theme}</h3>
          <p className={`text-sm ${ST.workflowSubtitle}`}>{t("recordDesc")}</p>

          <div className="space-y-3">
            <div className={`flex justify-between text-[10px] font-extrabold uppercase ${ST.aspectLabel}`}>
              <span>{t("aspectsTracker")}</span>
              <span className="text-amber-500 font-mono">
                {t("aspectsVerified", { done, total: monologue.points.length })}
              </span>
            </div>
            <ul className="space-y-3">
              {monologue.points.map((pt, ptIdx) => {
                const checked = !!checkedPoints[ptIdx];
                return (
                  <li
                    key={ptIdx}
                    onClick={() => setCheckedPoints((prev) => ({ ...prev, [ptIdx]: !prev[ptIdx] }))}
                    className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer capitalize ${
                      checked ? ST.aspectActive : ST.aspectInactive
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      checked ? ST.aspectActiveBadge : ST.aspectInactiveBadge
                    }`}>
                      {checked ? <Check className="h-3.5 w-3.5" /> : ptIdx + 1}
                    </div>
                    <span className={`text-sm ${checked ? "line-through opacity-50" : ""}`}>{pt}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className={`md:col-span-5 flex flex-col items-center justify-center p-8 sm:p-12 ${ST.recordCol}`}>
          <div
            className="relative flex items-center justify-center mb-8"
            role="timer"
            aria-live="polite"
            aria-label={t("limitRemaining")}
          >
            <div className="absolute w-48 h-48 rounded-full border-4 border-red-500/10 animate-ping" />
            <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border ${ST.circularTrack}`}>
              <span className={`text-[9px] font-bold uppercase ${ST.clockLabel}`}>{t("limitRemaining")}</span>
              <span className={`text-3xl font-mono font-bold mt-1 ${ST.clockTime}`}>{formatTime(recordingSeconds)}</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={onStop}
              className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all cursor-pointer"
              aria-label={t("stopRecord")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              <span>{t("stopRecord")}</span>
            </button>
            {practiceMode === "training" && onCancel && (
              <button onClick={onCancel} className={`w-full py-3 rounded-2xl font-semibold text-xs border cursor-pointer ${ST.cancelButton}`}>
                {t("cancelAttempt")}
              </button>
            )}
          </div>

          {practiceMode === "training" && (
            <div className={`mt-8 border rounded-2xl p-4 w-full text-center text-[10px] ${ST.aspectItem}`}>
              <span className={`font-extrabold uppercase block ${ST.aspectLabel}`}>{t("outlineTips")}</span>
              <p className="opacity-80 italic mt-2">"I am going to give a talk..."</p>
              <p className="opacity-80 italic">"That is all I wanted to say. Thank you."</p>
            </div>
          )}

          <p className={`mt-4 text-[10px] text-center ${ST.clockLabel}`}>{t("storageNote")}</p>
        </div>
      </div>
    </motion.div>
  );
}
