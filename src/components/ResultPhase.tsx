import { useMemo, type Dispatch, type SetStateAction } from "react";
import { motion } from "motion/react";
import {
  Check,
  CheckCircle,
  Download,
  Volume2,
  Lightbulb,
  RotateCcw,
  ChevronRight,
  MicOff,
  FileAudio,
  Share2,
} from "lucide-react";
import type { Monologue, RubricAnswers, TopicProgress } from "../types";
import type { ThemeStyles } from "../themes";
import type { TranslationKey } from "../i18n/translations";
import { buildRecordingFilename } from "../utils/filename";
import { analyzeSpeechOffline } from "../utils/speechAnalysis";
import type { SpeechSessionSnapshot } from "../hooks/useSpeechRecognition";
import { SpeechAnalysisPanel } from "./SpeechAnalysisPanel";
import { MonologueTranscriptPanel } from "./MonologueTranscriptPanel";

interface Props {
  ST: ThemeStyles;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  monologue: Monologue;
  audioUrl: string | null;
  recordingBlob: Blob | null;
  rubricAnswers: RubricAnswers;
  setRubricAnswers: Dispatch<SetStateAction<RubricAnswers>>;
  topicProgress: TopicProgress | undefined;
  speechSnapshot: SpeechSessionSnapshot;
  recordingDurationSeconds: number;
  onDownload: () => void;
  onShare: () => void;
  onRetry: () => void;
  onBack: () => void;
}

export function ResultPhase({
  ST,
  t,
  monologue,
  audioUrl,
  recordingBlob,
  rubricAnswers,
  setRubricAnswers,
  topicProgress,
  speechSnapshot,
  recordingDurationSeconds,
  onDownload,
  onShare,
  onRetry,
  onBack,
}: Props) {
  const filename = recordingBlob
    ? buildRecordingFilename(monologue, recordingBlob.type)
    : `Monologue_${monologue.id.toString().padStart(2, "0")}`;

  const speechAnalysis = useMemo(
    () =>
      analyzeSpeechOffline(speechSnapshot.transcript, recordingDurationSeconds, {
        fillerTimeline: speechSnapshot.fillerTimeline,
        pauseEvents: speechSnapshot.pauseEvents,
      }),
    [speechSnapshot, recordingDurationSeconds]
  );

  const displayTranscript = speechAnalysis?.cleanedTranscript ?? speechSnapshot.transcript;
  const displayFillerCount = speechAnalysis?.fillerCount ?? speechSnapshot.fillerCount;

  const rubricItems: { key: keyof RubricAnswers; title: TranslationKey; desc: TranslationKey }[] = [
    { key: "coveredAllPoints", title: "rubric1Title", desc: "rubric1Desc" },
    { key: "fluencyFillerWords", title: "rubric2Title", desc: "rubric2Desc" },
    { key: "introOutroClear", title: "rubric3Title", desc: "rubric3Desc" },
    { key: "underGrammarLimit", title: "rubric4Title", desc: "rubric4Desc" },
    { key: "timeOk", title: "rubric5Title", desc: "rubric5Desc" },
  ];

  return (
    <motion.div
      key="results-panel-container"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="max-w-4xl mx-auto w-full space-y-8"
      id="speech_results_workspace"
    >
      <div
        className={`gradient-border-wrap card-shine rounded-3xl p-6 sm:p-10 shadow-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${ST.banner}`}
      >
        <div className="space-y-3 max-w-xl">
          <div className={`inline-flex items-center gap-1.5 text-xs font-bold py-1 px-3 rounded-full border ${ST.successBadge}`}>
            <CheckCircle className="h-3.5 w-3.5" />
            <span>{t("completed")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold capitalize">
            <span className="gradient-text">{t("completed")}</span>
          </h2>
          <p className={`text-sm ${ST.bannerDesc}`}>{t("completedDesc", { theme: monologue.theme })}</p>
        </div>

        <div className={`flex flex-col p-5 rounded-2xl min-w-48 border ${ST.bannerStep}`}>
          <span className={`text-[9px] uppercase font-bold ${ST.resultFileLabel}`}>{t("generatedFile")}</span>
          <div className="flex items-center gap-2 mt-1">
            <FileAudio className={`h-4 w-4 ${ST.iconAccent}`} />
            <span className="font-mono text-xs font-bold break-all">{filename}</span>
          </div>
          {recordingBlob && (
            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={onDownload}
                className={`py-1.5 px-3 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer ${ST.primaryButtonSm}`}
              >
                <Download className="h-3.5 w-3.5" />
                {t("downloadAgain")}
              </button>
              <button
                onClick={onShare}
                className={`py-1.5 px-3 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer opacity-90 hover:opacity-100 ${ST.primaryButtonSm}`}
              >
                <Share2 className="h-3.5 w-3.5" />
                {t("shareViaPhone")}
              </button>
            </div>
          )}
        </div>
      </div>

      <MonologueTranscriptPanel
        ST={ST}
        t={t}
        transcript={displayTranscript}
        fillerCount={displayFillerCount}
        fillerBreakdown={speechAnalysis?.fillerBreakdown ?? []}
        durationSeconds={recordingDurationSeconds}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className={`gradient-border-wrap md:col-span-5 rounded-3xl p-6 sm:p-8 shadow-xl border space-y-6 card-shine ${ST.workflowCard}`}>
          <div className={`flex items-center gap-2 border-b pb-4 ${ST.cardDivider}`}>
            <Volume2 className={`h-5 w-5 ${ST.iconAccent}`} />
            <h3 className={`font-bold ${ST.workflowHeading}`}>{t("listenEvaluate")}</h3>
          </div>

          {audioUrl ? (
            <div className="space-y-4">
              <p className={`text-xs ${ST.workflowSubtitle}`}>{t("playbackDesc")}</p>
              <audio src={audioUrl} controls className="w-full h-10 accent-indigo-600" aria-label={t("listenEvaluate")} />
            </div>
          ) : (
            <div className={`p-6 text-center border border-dashed rounded-2xl text-xs ${ST.emptyBanner}`}>
              <MicOff className={`h-8 w-8 mx-auto mb-2 ${ST.iconMuted}`} />
              <p>{t("playbackOffline")}</p>
            </div>
          )}

          {speechAnalysis && <SpeechAnalysisPanel ST={ST} t={t} analysis={speechAnalysis} />}

          <div className={`rounded-2xl p-4 border text-xs space-y-2 ${ST.aspectItem}`}>
            <h4 className={`font-bold flex items-center gap-1.5 ${ST.iconAccent}`}>
              <Lightbulb className="h-4 w-4" />
              {t("examGuidelines")}
            </h4>
            <ul className="space-y-1">
              <li>• {t("guideline1")}</li>
              <li>• {t("guideline2")}</li>
              <li>• {t("guideline3")}</li>
            </ul>
          </div>
        </div>

        <div className={`gradient-border-wrap md:col-span-7 rounded-3xl p-6 sm:p-8 shadow-xl border space-y-6 card-shine ${ST.workflowCard}`}>
          <h3 className={`font-bold border-b pb-4 ${ST.cardDivider} ${ST.workflowHeading}`}>{t("rubricTitle")}</h3>
          <p className={`text-sm ${ST.workflowSubtitle}`}>{t("rubricDesc")}</p>

          <div className="space-y-3">
            {rubricItems.map((item) => (
              <div
                key={item.key}
                onClick={() => setRubricAnswers((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 ${
                  rubricAnswers[item.key] ? ST.aspectActive : ST.aspectInactive
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 ${
                  rubricAnswers[item.key] ? ST.checkOn : ST.checkOff
                }`}>
                  {rubricAnswers[item.key] && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <span className={`text-sm font-bold block ${ST.workflowHeading}`}>{t(item.title)}</span>
                  <span className={`text-[11px] block ${ST.workflowSubtitle}`}>{t(item.desc)}</span>
                </div>
              </div>
            ))}
          </div>

          {topicProgress && topicProgress.attempts.length > 0 && (
            <div className={`rounded-xl p-4 border text-xs space-y-2 ${ST.aspectItem}`}>
              <h4 className={`font-bold ${ST.aspectLabel}`}>{t("attemptHistory")}</h4>
              {topicProgress.attempts.slice(-3).map((a) => (
                <p key={a.id} className={ST.workflowSubtitle}>
                  {new Date(a.date).toLocaleString()} — {a.durationSeconds}s —{" "}
                  {Object.values(a.rubric).filter(Boolean).length}/5 rubric
                </p>
              ))}
            </div>
          )}

          <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t ${ST.cardDivider}`}>
            <button
              onClick={onRetry}
              className={`flex-1 px-6 py-4 border rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer ${ST.retryButton}`}
            >
              <RotateCcw className="h-4 w-4" />
              {t("retryPractice")}
            </button>
            <button
              onClick={onBack}
              className={`flex-1 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 cursor-pointer ${ST.primaryButton}`}
            >
              {t("chooseDifferent")}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
