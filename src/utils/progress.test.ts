import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadAllProgress, recordAttempt, countCompleted, buildAttemptFromSession } from "./progress";

const store: Record<string, string> = {};

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    length: 0,
    key: () => null,
  });
});

describe("progress", () => {
  it("records attempt and updates status", () => {
    const attempt = buildAttemptFromSession(
      {
        coveredAllPoints: true,
        fluencyFillerWords: false,
        introOutroClear: true,
        underGrammarLimit: true,
        timeOk: true,
      },
      { 0: true, 1: true },
      95
    );
    const result = recordAttempt(4, attempt);
    expect(result.status).toBe("recorded");
    expect(result.attempts).toHaveLength(1);
  });

  it("counts completed topics", () => {
    recordAttempt(
      1,
      buildAttemptFromSession(
        {
          coveredAllPoints: false,
          fluencyFillerWords: false,
          introOutroClear: false,
          underGrammarLimit: false,
          timeOk: false,
        },
        {},
        60
      )
    );
    const all = loadAllProgress();
    expect(countCompleted(all, 30)).toBe(1);
  });
});
