import type { AttemptRecord, RubricAnswers, TopicProgress, TopicStatus } from "../types";

const PROGRESS_KEY = "speakmaster_progress";

export function loadAllProgress(): Record<number, TopicProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAllProgress(data: Record<number, TopicProgress>): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save progress:", e);
  }
}

export function getTopicProgress(monologueId: number): TopicProgress {
  const all = loadAllProgress();
  return all[monologueId] ?? { monologueId, status: "not_started", attempts: [] };
}

export function recordAttempt(
  monologueId: number,
  attempt: Omit<AttemptRecord, "id">
): TopicProgress {
  const all = loadAllProgress();
  const existing = all[monologueId] ?? { monologueId, status: "not_started" as TopicStatus, attempts: [] };
  const updated: TopicProgress = {
    ...existing,
    status: "recorded",
    attempts: [
      ...existing.attempts,
      { ...attempt, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
    ],
  };
  all[monologueId] = updated;
  saveAllProgress(all);
  return updated;
}

export function markSubmitted(monologueId: number): void {
  const all = loadAllProgress();
  const existing = all[monologueId];
  if (existing) {
    all[monologueId] = { ...existing, status: "submitted" };
    saveAllProgress(all);
  }
}

export function countCompleted(progress: Record<number, TopicProgress>, total: number): number {
  return Object.values(progress).filter((p) => p.status !== "not_started").length;
}

export function countSubmitted(progress: Record<number, TopicProgress>): number {
  return Object.values(progress).filter((p) => p.status === "submitted").length;
}

export function buildAttemptFromSession(
  rubric: RubricAnswers,
  checkedPoints: Record<number, boolean>,
  durationSeconds: number,
  transcript?: string,
  fillerCount?: number
): Omit<AttemptRecord, "id"> {
  return {
    date: new Date().toISOString(),
    durationSeconds,
    rubric,
    checkedPoints,
    transcript,
    fillerCount,
  };
}
