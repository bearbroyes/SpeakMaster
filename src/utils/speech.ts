export const FILLER_WORDS = ["um", "uh", "like", "you know", "well", "so", "actually", "basically"];

export function findFillersInChunk(chunk: string): string[] {
  const found: string[] = [];
  const lower = chunk.toLowerCase();
  for (const phrase of FILLER_WORDS) {
    const regex = new RegExp(`\\b${phrase.replace(/\s/g, "\\s+")}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches) found.push(...matches.map((m) => m.toLowerCase()));
  }
  return found;
}

export function findFillerOccurrences(transcript: string): string[] {
  const lower = transcript.toLowerCase();
  const hits: { index: number; word: string }[] = [];

  for (const phrase of FILLER_WORDS) {
    const regex = new RegExp(`\\b${phrase.replace(/\s/g, "\\s+")}\\b`, "gi");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(lower)) !== null) {
      hits.push({ index: match.index, word: match[0].toLowerCase() });
    }
  }

  return hits.sort((a, b) => a.index - b.index).map((h) => h.word);
}

export function summarizeFillerCounts(occurrences: string[]): { word: string; count: number }[] {
  const map = new Map<string, number>();
  for (const word of occurrences) {
    map.set(word, (map.get(word) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([word, count]) => ({ word, count }));
}

export function countFillerWords(transcript: string): number {
  return findFillerOccurrences(transcript).length;
}

export function getSpeechRecognition(): SpeechRecognition | null {
  const w = window as Window & {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export async function transcribeBlob(_blob: Blob): Promise<string | null> {
  const recognition = getSpeechRecognition();
  if (!recognition) return null;
  return null;
}
