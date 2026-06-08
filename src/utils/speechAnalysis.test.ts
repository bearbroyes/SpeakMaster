import { describe, expect, it } from "vitest";
import {
  analyzeSpeechOffline,
  buildFillerBuckets,
  countWords,
  detectIntro,
  detectOutro,
  estimateGrammarIssues,
  estimateFillerTimeline,
} from "./speechAnalysis";

describe("speechAnalysis", () => {
  const sample =
    "I am going to give a talk about school. Um, my school is big. We have many subjects. That is all I wanted to say. Thank you for listening.";

  it("counts words", () => {
    expect(countWords(sample)).toBe(29);
  });

  it("detects intro and outro", () => {
    expect(detectIntro(sample)).toBe(true);
    expect(detectOutro(sample)).toBe(true);
  });

  it("estimates grammar issues for repeated words", () => {
    expect(estimateGrammarIssues("He don't like it and he he went")).toBeGreaterThan(0);
  });

  it("builds filler buckets", () => {
    const buckets = buildFillerBuckets(
      [
        { second: 5, word: "um" },
        { second: 15, word: "like" },
        { second: 55, word: "uh" },
      ],
      60
    );
    expect(buckets[0]).toBe(1);
    expect(buckets[1]).toBe(1);
    expect(buckets[5]).toBe(1);
  });

  it("analyzes speech offline with WPM", () => {
    const result = analyzeSpeechOffline(sample, 90);
    expect(result).not.toBeNull();
    expect(result!.wpm).toBeGreaterThan(0);
    expect(result!.introDetected).toBe(true);
    expect(result!.outroDetected).toBe(true);
    expect(result!.fillerCount).toBeGreaterThanOrEqual(1);
  });

  it("estimates filler timeline from transcript", () => {
    const timeline = estimateFillerTimeline("um hello like world", 40);
    expect(timeline.length).toBe(2);
  });
});
