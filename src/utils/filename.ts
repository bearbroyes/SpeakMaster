import type { Monologue, StudentProfile } from "../types";
import { formatProfileNameForFilename } from "./profile";

export function mimeToExtension(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "m4a";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  return "webm";
}

export function buildRecordingFilename(
  monologue: Monologue,
  mimeType: string,
  profile?: StudentProfile | null
): string {
  const date = new Date().toISOString().slice(0, 10);
  const themePart = monologue.theme.replace(/\s+/g, "_").slice(0, 24);
  const ext = mimeToExtension(mimeType);
  const idPart = monologue.id.toString().padStart(2, "0");
  const namePart = formatProfileNameForFilename(profile);
  const base = namePart
    ? `Monologue_${idPart}_${themePart}_${namePart}_${date}`
    : `Monologue_${idPart}_${themePart}_${date}`;
  return `${base}.${ext}`;
}
