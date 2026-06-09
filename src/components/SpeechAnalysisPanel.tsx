import type { ReactNode } from "react";
import { BarChart3, Clock, MessageSquare, PauseCircle, Timer, Type, AlertTriangle } from "lucide-react";
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
        <MetricCard
          ST={ST}
          icon={<Timer className="h-3 w-3" />}
          label={t("metricDuration")}
          value={t("metricDurationValue", { sec: analysis.speakingDurationSeconds })}
          hint={t("metricDurationHint")}
        />
        <MetricCard
          ST={ST}
          icon={<AlertTriangle className="h-3 w-3" />}
          label={t("metricGrammar")}
          value={String(analysis.estimatedGrammarIssues)}
          hint={t("metricGrammarHint")}
          status={
            analysis.estimatedGrammarIssues <= 3
              ? "good"
              : analysis.estimatedGrammarIssues <= 6
                ? "warn"
                : "bad"
          }
        />
      </div>

      {analysis.fillerCount > 0 ? (
        <div className="space-y-2">
          <p className={`text-[10px] font-bold uppercase ${ST.aspectLabel}`}>{t("fillerListTitle")}</p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.fillerBreakdown.map((item) => (
              <span
                key={item.word}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${ST.warningBadge}`}
              >
                <span className="font-mono">{item.word}</span>
                <span className={`opacity-70 ${ST.fillerText}`}>×{item.count}</span>
              </span>
            ))}
          </div>
          {analysis.fillerTimeline.length > 0 && (
            <ul className={`space-y-1 text-[11px] font-mono ${ST.workflowSubtitle}`}>
              {analysis.fillerTimeline.map((ev, i) => {
                const mins = Math.floor(ev.second / 60);
                const secs = ev.second % 60;
                const time = `${mins}:${secs.toString().padStart(2, "0")}`;
                return (
                  <li key={`${ev.second}-${ev.word}-${i}`} className="flex items-center gap-2">
                    <span className={`${ST.iconMuted} shrink-0`}>{time}</span>
                    <span className={ST.fillerText}>{ev.word}</span>
                  </li>
                );
              })}
            </ul>
          )}
          {analysis.fillerTimeline.length === 0 && (
            <p className={`text-[11px] font-mono ${ST.workflowSubtitle}`}>
              {analysis.fillerOccurrences.join(" · ")}
            </p>
          )}
        </div>
      ) : (
        <p className={`text-[11px] ${ST.workflowSubtitle}`}>{t("fillerListEmpty")}</p>
      )}

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
