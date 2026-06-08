import { motion } from "motion/react";
import { Play, Clock, Lightbulb } from "lucide-react";
import type { Monologue, PracticeMode } from "../types";
import type { ThemeStyles } from "../themes";
import type { TranslationKey } from "../i18n/translations";

interface Props {
  ST: ThemeStyles;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  monologue: Monologue;
  prepTimeLeft: number;
  practiceMode: PracticeMode;
  formatTime: (s: number) => string;
  onFinishEarly: () => void;
  onCancel: () => void;
}

export function PreparationPhase({
  ST,
  t,
  monologue,
  prepTimeLeft,
  practiceMode,
  formatTime,
  onFinishEarly,
  onCancel,
}: Props) {
  const intro = `I am going to give a talk about '${monologue.theme}'.`;
  const outro = "That is all I wanted to say. Thank you for listening.";

  return (
    <motion.div
      key="prep-panel-container"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className={`max-w-4xl mx-auto w-full border rounded-[32px] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${ST.workflowCard}`}
      id="prep_card_layout"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
        <div className={`md:col-span-7 p-6 sm:p-12 border-b md:border-b-0 md:border-r space-y-6 ${ST.cardDivider}`}>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg uppercase">
              {t("prepPhase")}
            </span>
            <h2 className={`text-xl font-bold uppercase ${ST.workflowHeading}`}>
              Card {monologue.id}
            </h2>
          </div>

          <div className="space-y-2">
            <h3 className={`text-2xl sm:text-3xl font-black capitalize ${ST.workflowHeading}`}>
              {monologue.theme}
            </h3>
            <p className={`text-sm ${ST.workflowSubtitle}`}>{t("prepDesc")}</p>
          </div>

          <div className="space-y-3">
            <span className={`text-[10px] uppercase font-extrabold ${ST.aspectLabel}`}>{t("includeAspects")}</span>
            <ul className="space-y-3">
              {monologue.points.map((pt, ptIdx) => (
                <li key={ptIdx} className={`flex items-start gap-4 p-4 rounded-2xl border capitalize ${ST.aspectItem}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${ST.aspectNum}`}>
                    {ptIdx + 1}
                  </span>
                  <span className="text-sm pt-0.5">{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`rounded-2xl p-5 border space-y-3 ${ST.recordTipsBox}`}>
            <h4 className={`font-bold flex items-center gap-2 text-sm ${ST.recordTipsHeader}`}>
              <Lightbulb className="h-4 w-4" />
              {t("cheatSheet")}
            </h4>
            <p className={`text-sm italic ${ST.recordTipsItalic}`}>{t("introPhrase")}</p>
            <p className={`text-sm italic ${ST.recordTipsItalic}`}>"{intro}"</p>
            <p className={`text-sm italic ${ST.recordTipsItalic}`}>{t("outroPhrase")}</p>
            <p className={`text-sm italic ${ST.recordTipsItalic}`}>"{outro}"</p>
            <p className={`text-xs ${ST.workflowSubtitle}`}>{t("grammarTip")}</p>
            <p className={`text-xs ${ST.workflowSubtitle}`}>{t("linkerTip")}</p>
          </div>
        </div>

        <div className={`md:col-span-5 flex flex-col items-center justify-center p-8 sm:p-12 ${ST.recordCol}`}>
          <div className="text-center space-y-2 mb-8">
            <span className={`text-[10px] uppercase font-bold ${ST.timerLabel}`}>{t("prepTimer")}</span>
            <p className={`text-xs max-w-xs ${ST.timerSub}`}>{t("prepTimerDesc")}</p>
          </div>

          <div className="relative flex items-center justify-center mb-8" role="timer" aria-live="polite" aria-label={t("prepTimer")}>
            <svg className="w-48 h-48 transform -rotate-90" aria-hidden="true">
              <circle cx="96" cy="96" r="88" className={`${ST.circularTrack} fill-none`} strokeWidth="6" />
              <circle
                cx="96"
                cy="96"
                r="88"
                className={`${ST.circularIndicator} fill-none transition-all duration-1000`}
                strokeWidth="6"
                strokeDasharray="552"
                strokeDashoffset={552 - (552 * prepTimeLeft) / 90}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <Clock className={`h-5 w-5 mb-1 ${ST.clockIcon}`} />
              <span className={`text-4xl font-mono font-black ${ST.clockTime}`}>{formatTime(prepTimeLeft)}</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            {practiceMode === "training" && (
              <button
                onClick={onFinishEarly}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>{t("startEarly")}</span>
              </button>
            )}
            {practiceMode === "training" && (
              <button onClick={onCancel} className={`w-full py-3.5 rounded-2xl font-semibold text-xs border cursor-pointer ${ST.cancelButton}`}>
                {t("cancelExit")}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
