import { useEffect, useState, useRef, type Dispatch, RefObject, SetStateAction } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { Monologue } from "../types";
import type { ThemeStyles } from "../themes";
import type { TranslationKey } from "../i18n/translations";

interface Props {
  ST: ThemeStyles;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  monologue: Monologue;
  liveTranscript?: string;
  speechSupported?: boolean;
  recordingSeconds: number;
  checkedPoints: Record<number, boolean>;
  setCheckedPoints: Dispatch<SetStateAction<Record<number, boolean>>>;
  formatTime: (s: number) => string;
  onStop: () => void;
  onCancel?: () => void;
}

function RecordingActions({
  ST,
  t,
  onStop,
  onCancel,
  stopRef,
}: {
  ST: ThemeStyles;
  t: Props["t"];
  onStop: () => void;
  onCancel?: () => void;
  stopRef?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <>
      <button
        ref={stopRef}
        type="button"
        onClick={onStop}
        className={`w-full min-h-14 py-5 rounded-2xl font-black flex items-center justify-center gap-3 cursor-pointer touch-manipulation ${ST.dangerButton}`}
        aria-label={t("stopRecord")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="pointer-events-none shrink-0"
        >
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
        <span className="pointer-events-none">{t("stopRecord")}</span>
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className={`w-full min-h-11 py-3 rounded-2xl font-semibold text-xs border cursor-pointer touch-manipulation ${ST.cancelButton}`}
        >
          {t("cancelAttempt")}
        </button>
      )}
    </>
  );
}

export function RecordingPhase({
  ST,
  t,
  monologue,
  liveTranscript,
  speechSupported = true,
  recordingSeconds,
  checkedPoints,
  setCheckedPoints,
  formatTime,
  onStop,
  onCancel,
}: Props) {
  const done = Object.values(checkedPoints).filter(Boolean).length;
  const stopButtonRef = useRef<HTMLButtonElement>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      stopButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  const mobileActionBar =
    portalReady &&
    createPortal(
      <div className="md:hidden fixed left-4 right-4 bottom-4 z-[100] space-y-3 pointer-events-auto">
        <RecordingActions
          ST={ST}
          t={t}
          onStop={onStop}
          onCancel={onCancel}
          stopRef={stopButtonRef}
        />
      </div>,
      document.body
    );

  return (
    <>
      {mobileActionBar}

      <motion.div
        key="recording-panel-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`gradient-border-wrap max-w-4xl mx-auto w-full border rounded-[32px] shadow-2xl overflow-hidden card-shine ${ST.workflowCard}`}
        id="active_recording_canvas"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          <div
            className={`relative z-0 md:col-span-7 order-2 md:order-1 p-6 sm:p-12 border-b md:border-b-0 md:border-r space-y-6 ${ST.cardDivider}`}
          >
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase live-badge ${ST.phaseRecord}`}>
                {t("liveRecording")}
              </span>
              <h2 className={`text-xl font-bold uppercase ${ST.workflowHeading}`}>Card {monologue.id}</h2>
            </div>

            <h3 className={`text-2xl font-black capitalize ${ST.workflowHeading}`}>{monologue.theme}</h3>
            <p className={`text-sm ${ST.workflowSubtitle}`}>{t("recordDesc")}</p>

            <div className="space-y-3">
              <div className={`flex justify-between text-[10px] font-extrabold uppercase ${ST.aspectLabel}`}>
                <span>{t("aspectsTracker")}</span>
                <span className={ST.aspectCounter}>
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
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          checked ? ST.aspectActiveBadge : ST.aspectInactiveBadge
                        }`}
                      >
                        {checked ? <Check className="h-3.5 w-3.5" /> : ptIdx + 1}
                      </div>
                      <span className={`text-sm ${checked ? "line-through opacity-50" : ""}`}>{pt}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div
            className={`relative z-20 md:col-span-5 order-1 md:order-2 flex flex-col items-center justify-center p-6 sm:p-12 pb-8 ${ST.recordCol}`}
          >
            <div
              className="pointer-events-none relative flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 mb-6 shrink-0 overflow-hidden"
              role="timer"
              aria-live="polite"
              aria-label={t("limitRemaining")}
            >
              <div
                className={`recording-ring-pulse relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center border ${ST.circularTrack}`}
              >
                <span className={`text-[9px] font-bold uppercase ${ST.clockLabel}`}>{t("limitRemaining")}</span>
                <span className={`text-3xl font-mono font-bold mt-1 ${ST.clockTime}`}>
                  {formatTime(recordingSeconds)}
                </span>
              </div>
            </div>

            <div className="hidden md:block w-full space-y-3">
              <RecordingActions ST={ST} t={t} onStop={onStop} onCancel={onCancel} />
            </div>

            <div className="md:hidden h-32 w-full shrink-0" aria-hidden="true" />

            <div className={`mt-6 border rounded-2xl p-4 w-full max-w-sm text-center text-[10px] ${ST.aspectItem}`}>
                <span className={`font-extrabold uppercase block ${ST.aspectLabel}`}>{t("outlineTips")}</span>
                <p className="opacity-80 italic mt-2">"I am going to give a talk..."</p>
                <p className="opacity-80 italic">"That is all I wanted to say. Thank you."</p>
            </div>

            <p className={`mt-4 text-[10px] text-center ${ST.clockLabel}`}>{t("storageNote")}</p>

            {!speechSupported ? (
              <p className={`mt-3 text-[10px] text-center max-w-xs ${ST.fillerText}`}>{t("speechUnsupported")}</p>
            ) : (
              <div className={`mt-3 w-full max-w-sm rounded-xl border p-3 text-left ${ST.aspectItem}`}>
                <p className={`text-[9px] font-bold uppercase ${ST.aspectLabel}`}>{t("liveTranscript")}</p>
                <p className={`text-[11px] mt-1 leading-relaxed min-h-[2.5rem] ${ST.workflowSubtitle}`}>
                  {liveTranscript?.trim() || t("liveTranscriptWaiting")}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
