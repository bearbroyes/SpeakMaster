import { buildRecordingFilename } from "./filename";
import type { Monologue, StudentProfile } from "../types";

export function triggerDownload(
  blob: Blob,
  monologue: Monologue,
  profile?: StudentProfile | null
): string {
  const filename = buildRecordingFilename(monologue, blob.type, profile);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  return filename;
}

export async function shareRecording(
  blob: Blob,
  monologue: Monologue,
  title: string,
  profile?: StudentProfile | null
): Promise<boolean> {
  const filename = buildRecordingFilename(monologue, blob.type, profile);
  const file = new File([blob], filename, { type: blob.type });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title,
      text: monologue.theme,
      files: [file],
    });
    return true;
  }
  return false;
}
