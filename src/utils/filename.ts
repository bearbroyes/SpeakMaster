import type { Monologue } from "../types";

export function mimeToExtension(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "m4a";
  return "webm";
}

export function buildRecordingFilename(monologue: Monologue, mimeType: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const themePart = monologue.theme.replace(/\s+/g, "_").slice(0, 24);
  const ext = mimeToExtension(mimeType);
  return `Monologue_${monologue.id.toString().padStart(2, "0")}_${themePart}_${date}.${ext}`;
}
