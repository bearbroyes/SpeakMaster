import { countFillerWords, findFillerOccurrences, summarizeFillerCounts, FILLER_WORDS } from "./speech";

export interface FillerBreakdownItem {
  word: string;
  count: number;
}

export interface FillerEvent {
  second: number;
  word: string;
}

export type MetricStatus = "good" | "warn" | "bad";

export interface SpeechAnalysis {
  wordCount: number;
  wpm: number;
  speakingDurationSeconds: number;
  sentenceCount: number;
  avgSentenceLength: number;
  longPauseCount: number;
  estimatedGrammarIssues: number;
  fillerCount: number;
  fillerOccurrences: string[];
  fillerBreakdown: FillerBreakdownItem[];
  fillerTimeline: FillerEvent[];
  fillerBuckets: number[];
  wpmStatus: MetricStatus;
  wordCountStatus: MetricStatus;
  cleanedTranscript: string;
}

const WORD_TARGET_MIN = 100;
const WORD_TARGET_MAX = 180;
const WORD_IDEAL_MIN = 120;
const WORD_IDEAL_MAX = 130;
const MAX_PLAUSIBLE_WPM = 200;
const LONG_PAUSE_SEC = 3;
const BUCKET_SIZE_SEC = 10;

const OUTRO_TRIM_PATTERNS = [
  /\bthank\s+you\s+for\s+(listening|your\s+attention)\b/gi,
  /\bthat\s+is\s+all\s+i\s+wanted\s+to\s+say\b/gi,
  /\bthat\s+is\s+all\b/gi,
];

const GRAMMAR_ERROR_PATTERNS: RegExp[] = [
  /\b(he|she|it)\s+don't\b/gi,
  /\b(he|she|it)\s+are\b/gi,
  /\b(they|we|you)\s+was\b/gi,
  /\b(they|we|you)\s+is\b/gi,
  /\bmore\s+better\b/gi,
  /\bvery\s+unique\b/gi,
  /\ba\s+informations\b/gi,
  /\bmany\s+much\b/gi,
  /\bdon't\s+has\b/gi,
];

const SENTENCE_BREAK_WORDS = new Set([
  "and",
  "but",
  "so",
  "then",
  "also",
  "moreover",
  "furthermore",
  "however",
  "finally",
  "firstly",
  "secondly",
  "additionally",
]);

/** Merge speech-recognition chunks without duplicating cumulative text. */
export function appendFinalChunk(accumulated: string, chunk: string): string {
  const c = chunk.trim();
  if (!c) return accumulated.trim();
  const a = accumulated.trim();
  if (!a) return c;
  if (c === a) return a;
  if (c.startsWith(a)) return c;
  if (a.startsWith(c)) return a;
  if (a.includes(c)) return a;
  return `${a} ${c}`;
}

export function mergeWithInterim(final: string, interim: string): string {
  const f = final.trim();
  const i = interim.trim();
  if (!i) return f;
  if (!f) return i;
  if (i.startsWith(f)) return i;
  if (f.includes(i)) return f;
  return `${f} ${i}`;
}

/** Cut off recognition noise captured after the monologue outro. */
export function trimTranscriptAtOutro(transcript: string): string {
  let cutIndex = transcript.length;
  for (const pattern of OUTRO_TRIM_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(transcript)) !== null) {
      cutIndex = Math.min(cutIndex, match.index + match[0].length);
    }
  }
  return transcript.slice(0, cutIndex).trim();
}

export function countWords(transcript: string): number {
  const matches = transcript.match(/\b[a-zA-Z']+\b/g);
  return matches ? matches.length : 0;
}

export function splitSentences(transcript: string): string[] {
  return transcript
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function splitSentencesHeuristic(transcript: string): string[] {
  const byPunctuation = splitSentences(transcript);
  if (byPunctuation.length > 1) return byPunctuation;

  const words = transcript.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 14) return words.length ? [words.join(" ")] : [];

  const sentences: string[] = [];
  let current: string[] = [];

  for (const raw of words) {
    current.push(raw);
    const bare = raw.toLowerCase().replace(/[.,!?;:]/g, "");
    const shouldBreak =
      current.length >= 10 && (SENTENCE_BREAK_WORDS.has(bare) || current.length >= 18);

    if (shouldBreak) {
      sentences.push(current.join(" "));
      current = [];
    }
  }

  if (current.length) sentences.push(current.join(" "));
  return sentences.length ? sentences : [transcript.trim()];
}

export function prepareTranscriptForAnalysis(transcript: string, durationSeconds: number): string {
  let text = transcript.replace(/\s+/g, " ").trim();
  text = trimTranscriptAtOutro(text);

  const maxWords = Math.ceil((durationSeconds / 60) * MAX_PLAUSIBLE_WPM);
  const words = text.match(/\b[a-zA-Z']+\b/g) ?? [];
  if (words.length > maxWords) {
    text = words.slice(0, maxWords).join(" ");
  }

  return text.trim();
}

export function filterEventsByDuration<T extends { second: number }>(
  events: T[],
  durationSeconds: number
): T[] {
  return events.filter((e) => e.second >= 0 && e.second <= durationSeconds);
}

export function estimateFillerTimeline(
  transcript: string,
  durationSeconds: number,
  liveTimeline: FillerEvent[] = []
): FillerEvent[] {
  const filtered = filterEventsByDuration(liveTimeline, durationSeconds);
  if (filtered.length > 0) return filtered;

  const words = transcript.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0 || durationSeconds <= 0) return [];

  const lower = transcript.toLowerCase();
  const timeline: FillerEvent[] = [];

  for (const phrase of FILLER_WORDS) {
    const regex = new RegExp(`\\b${phrase.replace(/\s/g, "\\s+")}\\b`, "gi");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(lower)) !== null) {
      const prefix = lower.slice(0, match.index);
      const wordIndex = prefix.split(/\s+/).filter(Boolean).length;
      const second = Math.min(
        durationSeconds,
        Math.round((wordIndex / Math.max(words.length, 1)) * durationSeconds)
      );
      timeline.push({ second, word: match[0].toLowerCase() });
    }
  }

  return timeline.sort((a, b) => a.second - b.second);
}

export function buildFillerBuckets(
  timeline: FillerEvent[],
  durationSeconds: number,
  bucketSize = BUCKET_SIZE_SEC
): number[] {
  const bucketCount = Math.max(1, Math.ceil(durationSeconds / bucketSize));
  const buckets = Array.from({ length: bucketCount }, () => 0);
  for (const ev of timeline) {
    const idx = Math.min(bucketCount - 1, Math.floor(ev.second / bucketSize));
    buckets[idx] += 1;
  }
  return buckets;
}

export function estimateGrammarIssues(transcript: string): number {
  let issues = 0;
  const lower = transcript.toLowerCase();

  for (const pattern of GRAMMAR_ERROR_PATTERNS) {
    const matches = lower.match(pattern);
    if (matches) issues += matches.length;
  }

  const repeatedWord = lower.match(/\b(\w+)\s+\1\b/gi);
  if (repeatedWord) issues += repeatedWord.length;

  return issues;
}

function statusForWpm(wpm: number): MetricStatus {
  if (wpm >= 90 && wpm <= 160) return "good";
  if (wpm >= 70 && wpm <= 180) return "warn";
  return "bad";
}

function statusForWordCount(count: number): MetricStatus {
  if (count >= WORD_IDEAL_MIN && count <= WORD_IDEAL_MAX) return "good";
  if (count >= WORD_TARGET_MIN && count <= WORD_TARGET_MAX) return "warn";
  return "bad";
}

export function analyzeSpeechOffline(
  transcript: string,
  durationSeconds: number,
  options: {
    fillerTimeline?: FillerEvent[];
    pauseEvents?: number[];
  } = {}
): SpeechAnalysis | null {
  if (!transcript.trim() || durationSeconds <= 0) return null;

  const cleanedTranscript = prepareTranscriptForAnalysis(transcript, durationSeconds);
  if (!cleanedTranscript) return null;

  const wordCount = countWords(cleanedTranscript);
  const speakingMinutes = durationSeconds / 60;
  const wpm = speakingMinutes > 0 ? Math.round(wordCount / speakingMinutes) : 0;

  const sentences = splitSentencesHeuristic(cleanedTranscript);
  const sentenceCount = Math.max(sentences.length, 1);
  const avgSentenceLength = Math.round((wordCount / sentenceCount) * 10) / 10;

  const pauseEvents = filterEventsByDuration(
    (options.pauseEvents ?? []).map((s) => ({ second: s })),
    durationSeconds
  ).map((e) => e.second);

  const longPauseCount = pauseEvents.length;

  const estimatedGrammarIssues = estimateGrammarIssues(cleanedTranscript);
  const fillerOccurrences = findFillerOccurrences(cleanedTranscript);
  const fillerCount = fillerOccurrences.length;
  const fillerBreakdown = summarizeFillerCounts(fillerOccurrences);
  const fillerTimeline = estimateFillerTimeline(cleanedTranscript, durationSeconds, options.fillerTimeline);
  const fillerBuckets = buildFillerBuckets(fillerTimeline, durationSeconds);

  return {
    wordCount,
    wpm,
    speakingDurationSeconds: durationSeconds,
    sentenceCount,
    avgSentenceLength,
    longPauseCount,
    estimatedGrammarIssues,
    fillerCount,
    fillerOccurrences,
    fillerBreakdown,
    fillerTimeline,
    fillerBuckets,
    wpmStatus: statusForWpm(wpm),
    wordCountStatus: statusForWordCount(wordCount),
    cleanedTranscript,
  };
}
