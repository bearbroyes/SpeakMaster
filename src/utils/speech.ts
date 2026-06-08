const FILLER_WORDS = ["um", "uh", "like", "you know", "well", "so", "actually", "basically"];

export function countFillerWords(transcript: string): number {
  const lower = transcript.toLowerCase();
  let count = 0;
  for (const word of FILLER_WORDS) {
    const regex = new RegExp(`\\b${word.replace(/\s/g, "\\s+")}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  }
  return count;
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
