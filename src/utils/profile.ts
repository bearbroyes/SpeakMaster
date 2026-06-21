import type { StudentProfile } from "../types";

const PROFILE_KEY = "speakmaster_profile";

export function loadStudentProfile(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudentProfile;
    const firstName = (parsed.firstName ?? "").trim();
    const lastName = (parsed.lastName ?? "").trim();
    if (!firstName && !lastName) return null;
    return { firstName, lastName };
  } catch {
    return null;
  }
}

export function saveStudentProfile(profile: StudentProfile | null): void {
  try {
    if (!profile || (!profile.firstName.trim() && !profile.lastName.trim())) {
      localStorage.removeItem(PROFILE_KEY);
      return;
    }
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
      })
    );
  } catch (e) {
    console.warn("Could not save profile:", e);
  }
}

function sanitizeNamePart(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w\u0400-\u04FF-]/g, "")
    .slice(0, 24);
}

/** Returns empty string when profile is missing or both names are empty. */
export function formatProfileNameForFilename(profile: StudentProfile | null | undefined): string {
  if (!profile) return "";
  const first = profile.firstName.trim();
  const last = profile.lastName.trim();
  if (!first && !last) return "";
  if (first && last) return `${sanitizeNamePart(first)}_${sanitizeNamePart(last)}`;
  return sanitizeNamePart(first || last);
}

export function hasProfileName(profile: StudentProfile | null | undefined): boolean {
  return formatProfileNameForFilename(profile).length > 0;
}
