import type { ReactNode } from "react";
import { BarChart3, Clock, MessageSquare, PauseCircle, Type } from "lucide-react";
import type { ThemeStyles } from "../themes";
import type { TranslationKey } from "../i18n/translations";
import type { MetricStatus, SpeechAnalysis } from "../utils/speechAnalysis";

interface Props {
  ST: ThemeStyles;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  analysis: SpeechAnalysis;
}

function statusClass(status: MetricStatus, ST: ThemeStyles): string {
  if (status === "good") return ST.successBadge;
  if (status === "warn") return ST.warningBadge;
  return "bg-red-500/15 text-red-300 border border-red-500/30";
}

function MetricCard({
  ST,
  icon,
  label,
  value,
  hint,
  status,
}: {
  ST: ThemeStyles;
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  status?: MetricStatus;
}) {
  return (
    <div className={`rounded-xl p-3 border space-y-1 ${status ? statusClass(status, ST) : ST.aspectItem}`}>
      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${ST.aspectLabel}`}>
        {icon}
        {label}
      </div>
      <p className={`text-lg font-black font-mono ${ST.workflowHeading}`}>{value}</p>
      {hint && <p className={`text-[10px] ${ST.workflowSubtitle}`}>{hint}</p>}
    </div>
  );
}

export function SpeechAnalysisPanel({ ST, t, analysis }: Props) {
  const maxBucket = Math.max(...analysis.fillerBuckets, 1);

  return (
    <div className={`rounded-2xl p-4 border space-y-4 ${ST.aspectItem}`} id="speech_analysis_panel">
      <h4 className={`font-bold flex items-center gap-2 ${ST.aspectLabel}`}>
        <BarChart3 className={`h-4 w-4 ${ST.iconAccent}`} />
        {t("speechAnalysisTitle")}
      </h4>
      <p className={`text-[11px] ${ST.workflowSubtitle}`}>{t("speechAnalysisDesc")}</p>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          ST={ST}
          icon={<Type className="h-3 w-3" />}
          label={t("metricWords")}
          value={String(analysis.wordCount)}
          hint={t("metricWordsHint")}
          status={analysis.wordCountStatus}
        />
        <MetricCard
          ST={ST}
          icon={<Clock className="h-3 w-3" />}
          label={t("metricWpm")}
          value={String(analysis.wpm)}
          hint={t("metricWpmHint")}
          status={analysis.wpmStatus}
        />
        <MetricCard
          ST={ST}
          icon={<MessageSquare className="h-3 w-3" />}
          label={t("metricSentenceLen")}
          value={`${analysis.avgSentenceLength}`}
          hint={t("metricSentenceHint", { count: analysis.sentenceCount })}
        />
        <MetricCard
          ST={ST}
          icon={<PauseCircle className="h-3 w-3" />}
          label={t("metricPauses")}
          value={String(analysis.longPauseCount)}
          hint={t("metricPausesHint")}
          status={analysis.longPauseCount <= 1 ? "good" : analysis.longPauseCount <= 3 ? "warn" : "bad"}
        />
      </div>

      <div className={`rounded-xl p-3 border space-y-2 ${ST.recordTipsBox}`}>
        <p className={`text-[10px] font-bold uppercase ${ST.aspectLabel}`}>{t("ogeBenchmark")}</p>
        <ul className={`text-[11px] space-y-1 ${ST.workflowSubtitle}`}>
          <li>
            {analysis.ogeWordBandOk ? "✓" : "○"} {t("ogeWordsTarget")}
          </li>
          <li>
            {analysis.ogeGrammarOk ? "✓" : "○"} {t("ogeGrammarTarget", { count: analysis.estimatedGrammarIssues })}
          </li>
          <li>
            {analysis.introDetected ? "✓" : "○"} {t("ogeIntroTarget")}
          </li>
          <li>
            {analysis.outroDetected ? "✓" : "○"} {t("ogeOutroTarget")}
          </li>
        </ul>
      </div>

      {analysis.fillerBuckets.length > 0 && (
        <div className="space-y-2">
          <p className={`text-[10px] font-bold uppercase ${ST.aspectLabel}`}>{t("fillerChartTitle")}</p>
          <div className="flex items-end gap-1 h-20" role="img" aria-label={t("fillerChartTitle")}>
            {analysis.fillerBuckets.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <div
                  className="w-full rounded-t-md transition-all bg-indigo-500/70"
                  style={{
                    height: `${Math.max(8, (count / maxBucket) * 100)}%`,
                    minHeight: count > 0 ? "12px" : "4px",
                    opacity: count > 0 ? 1 : 0.25,
                  }}
                  title={t("fillerBucketLabel", { start: i * 10, count })}
                />
                <span className={`text-[8px] font-mono ${ST.iconMuted}`}>{i * 10}s</span>
              </div>
            ))}
          </div>
          <p className={`text-[10px] ${ST.workflowSubtitle}`}>
            {t("fillerChartDesc", { total: analysis.fillerCount })}
          </p>
        </div>
      )}
    </div>
  );
}
