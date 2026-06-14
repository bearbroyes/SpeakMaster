import { useMemo } from "react";
import { motion } from "motion/react";
import { MessageSquareQuote, MicOff } from "lucide-react";
import type { ThemeStyles } from "../themes";
import type { TranslationKey } from "../i18n/translations";
import { FILLER_WORDS } from "../utils/speech";
import { countWords, splitSentencesHeuristic } from "../utils/speechAnalysis";

interface Props {
  ST: ThemeStyles;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  transcript: string;
  fillerCount: number;
  fillerBreakdown: { word: string; count: number }[];
  durationSeconds: number;
}

type Segment = { text: string; isFiller: boolean };

const fillerRegex = new RegExp(
  `\\b(${[...FILLER_WORDS]
    .sort((a, b) => b.length - a.length)
    .map((p) => p.replace(/\s/g, "\\s+"))
    .join("|")})\\b`,
  "gi"
);

function segmentWithFillers(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  fillerRegex.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fillerRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), isFiller: false });
    }
    segments.push({ text: match[0], isFiller: true });
    lastIndex = fillerRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isFiller: false });
  }

  return segments.length ? segments : [{ text, isFiller: false }];
}

function HighlightedText({ text, ST }: { text: string; ST: ThemeStyles }) {
  const segments = useMemo(() => segmentWithFillers(text), [text]);

  return (
    <>
      {segments.map((seg, i) =>
        seg.isFiller ? (
          <mark
            key={i}
            className={`rounded px-1 py-0.5 font-semibold not-italic ${ST.warningBadge}`}
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

export function MonologueTranscriptPanel({
  ST,
  t,
  transcript,
  fillerCount,
  fillerBreakdown,
  durationSeconds,
}: Props) {
  const trimmed = transcript.trim();
  const sentences = useMemo(
    () => (trimmed ? splitSentencesHeuristic(trimmed) : []),
    [trimmed]
  );
  const wordCount = useMemo(() => countWords(trimmed), [trimmed]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className={`gradient-border-wrap card-shine rounded-3xl border shadow-2xl overflow-hidden ${ST.workflowCard}`}
      aria-labelledby="spoken-words-heading"
    >
      <div className={`border-b px-6 sm:px-8 py-5 sm:py-6 ${ST.cardDivider}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`shrink-0 p-2.5 rounded-xl border ${ST.aspectItem}`}>
              <MessageSquareQuote className={`h-5 w-5 ${ST.iconAccent}`} aria-hidden="true" />
            </div>
            <div>
              <h3 id="spoken-words-heading" className={`text-lg sm:text-xl font-bold ${ST.workflowHeading}`}>
                {t("spokenWordsTitle")}
              </h3>
              <p className={`text-xs sm:text-sm mt-1 ${ST.workflowSubtitle}`}>{t("spokenWordsDesc")}</p>
            </div>
          </div>

          {trimmed && (
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${ST.aspectItem}`}>
                {t("spokenWordsStats", { words: wordCount, sec: durationSeconds })}
              </span>
              {fillerCount > 0 && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${ST.warningBadge}`}>
                  {t("fillerWords", { count: fillerCount })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6 sm:py-8">
        {!trimmed ? (
          <div className={`transcript-empty flex flex-col items-center justify-center text-center py-12 px-4 rounded-2xl border border-dashed ${ST.emptyBanner}`}>
            <MicOff className={`h-10 w-10 mb-3 ${ST.iconMuted}`} aria-hidden="true" />
            <p className={`text-sm max-w-md ${ST.workflowSubtitle}`}>{t("transcriptEmpty")}</p>
          </div>
        ) : (
          <ol className="transcript-sentences space-y-3 sm:space-y-4 list-none m-0 p-0">
            {sentences.map((sentence, idx) => (
              <motion.li
                key={`${idx}-${sentence.slice(0, 24)}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.08 + idx * 0.06 }}
                className={`transcript-sentence group relative pl-5 sm:pl-6 pr-4 py-3.5 sm:py-4 rounded-2xl border ${ST.aspectItem}`}
              >
                <span
                  className={`absolute left-3 sm:left-3.5 top-4 w-1.5 h-1.5 rounded-full ${ST.iconAccent} bg-current opacity-70`}
                  aria-hidden="true"
                />
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${ST.aspectLabel}`}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <p className={`mt-1.5 text-sm sm:text-base leading-relaxed ${ST.workflowHeading}`}>
                  <HighlightedText text={sentence} ST={ST} />
                  {!/[.!?]$/.test(sentence.trim()) && (
                    <span className={`${ST.workflowSubtitle} opacity-60`}>.</span>
                  )}
                </p>
              </motion.li>
            ))}
          </ol>
        )}

        {fillerBreakdown.length > 0 && (
          <div className={`mt-6 pt-5 border-t flex flex-wrap items-center gap-2 ${ST.cardDivider}`}>
            <span className={`text-[10px] font-bold uppercase ${ST.aspectLabel}`}>{t("fillerListTitle")}</span>
            {fillerBreakdown.map((item) => (
              <span
                key={item.word}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${ST.warningBadge}`}
              >
                {item.word} ×{item.count}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
