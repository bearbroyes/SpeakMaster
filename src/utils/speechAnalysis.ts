import { countFillerWords, FILLER_WORDS } from "./speech";

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
  introDetected: boolean;
  outroDetected: boolean;
  fillerCount: number;
  fillerTimeline: FillerEvent[];
  fillerBuckets: number[];
  ogeWordBandOk: boolean;
  ogeGrammarOk: boolean;
  wpmStatus: MetricStatus;
  wordCountStatus: MetricStatus;
}

const OGE_WORD_MIN = 100;
const OGE_WORD_MAX = 180;
const OGE_IDEAL_MIN = 120;
const OGE_IDEAL_MAX = 130;
const OGE_GRAMMAR_MAX = 2;
const LONG_PAUSE_SEC = 3;
const BUCKET_SIZE_SEC = 10;

const INTRO_PATTERNS = [
  /\bi\s+am\s+going\s+to\s+give\s+a\s+talk\b/i,
  /\bi\s+would\s+like\s+to\s+talk\s+about\b/i,
  /\btoday\s+i\s+want\s+to\s+talk\b/i,
  /\blet\s+me\s+tell\s+you\s+about\b/i,
];

const OUTRO_PATTERNS = [
  /\bthat\s+is\s+all\s+i\s+wanted\s+to\s+say\b/i,
  /\bthank\s+you\s+for\s+listening\b/i,
  /\bthat\s+is\s+all\b/i,
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
  /\bdoesn't\s+have\s+went\b/gi,
];

export function countWords(transcript: string): number {
  const cleaned = transcript.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function splitSentences(transcript: string): string[] {
  return transcript
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function findFillersInText(text: string): FillerEvent[] {
  const lower = text.toLowerCase();
  const events: FillerEvent[] = [];
  for (const phrase of FILLER_WORDS) {
    const regex = new RegExp(`\\b${phrase.replace(/\s/g, "\\s+")}\\b`, "gi");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(lower)) !== null) {
      events.push({ second: 0, word: match[0].toLowerCase() });
    }
  }
  return events;
}

/** Map filler positions in transcript to approximate seconds by word index. */
export function estimateFillerTimeline(
  transcript: string,
  durationSeconds: number,
  liveTimeline: FillerEvent[] = []
): FillerEvent[] {
  if (liveTimeline.length > 0) return liveTimeline;

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

  const sentences = splitSentences(transcript);
  const fragments = sentences.filter((s) => s.split(/\s+/).length < 3);
  issues += Math.floor(fragments.length / 2);

  return issues;
}

export function detectIntro(transcript: string): boolean {
  return INTRO_PATTERNS.some((p) => p.test(transcript));
}

export function detectOutro(transcript: string): boolean {
  return OUTRO_PATTERNS.some((p) => p.test(transcript));
}

function statusForWpm(wpm: number): MetricStatus {
  if (wpm >= 90 && wpm <= 160) return "good";
  if (wpm >= 70 && wpm <= 180) return "warn";
  return "bad";
}

function statusForWordCount(count: number): MetricStatus {
  if (count >= OGE_IDEAL_MIN && count <= OGE_IDEAL_MAX) return "good";
  if (count >= OGE_WORD_MIN && count <= OGE_WORD_MAX) return "warn";
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
  const trimmed = transcript.trim();
  if (!trimmed || durationSeconds <= 0) return null;

  const wordCount = countWords(trimmed);
  const speakingMinutes = durationSeconds / 60;
  const wpm = speakingMinutes > 0 ? Math.round(wordCount / speakingMinutes) : 0;

  const sentences = splitSentences(trimmed);
  const sentenceCount = Math.max(sentences.length, 1);
  const avgSentenceLength = Math.round((wordCount / sentenceCount) * 10) / 10;

  const pauseEvents = options.pauseEvents ?? [];
  const longPauseCount = pauseEvents.length;

  const estimatedGrammarIssues = estimateGrammarIssues(trimmed);
  const fillerCount = countFillerWords(trimmed);
  const fillerTimeline = estimateFillerTimeline(trimmed, durationSeconds, options.fillerTimeline);
  const fillerBuckets = buildFillerBuckets(fillerTimeline, durationSeconds);

  return {
    wordCount,
    wpm,
    speakingDurationSeconds: durationSeconds,
    sentenceCount,
    avgSentenceLength,
    longPauseCount: pauseEvents.length > 0 ? pauseEvents.length : longPauseCount,
    estimatedGrammarIssues,
    introDetected: detectIntro(trimmed),
    outroDetected: detectOutro(trimmed),
    fillerCount,
    fillerTimeline,
    fillerBuckets,
    ogeWordBandOk: wordCount >= OGE_WORD_MIN && wordCount <= OGE_WORD_MAX,
    ogeGrammarOk: estimatedGrammarIssues <= OGE_GRAMMAR_MAX,
    wpmStatus: statusForWpm(wpm),
    wordCountStatus: statusForWordCount(wordCount),
  };
}
