import { describe, expect, it } from "vitest";
import {
  analyzeSpeechOffline,
  appendFinalChunk,
  buildFillerBuckets,
  collapseDuplicateTail,
  countWords,
  prepareTranscriptForAnalysis,
  splitSentencesHeuristic,
  trimTranscriptAtOutro,
} from "./speechAnalysis";
import { findFillerOccurrences, summarizeFillerCounts } from "./speech";

describe("speechAnalysis", () => {
  const sample =
    "I am going to give a talk about school um my school is big and we have many subjects and that is all I wanted to say thank you for listening";

  it("counts english words only", () => {
    expect(countWords(sample)).toBe(31);
    expect(countWords("hello 123 world")).toBe(2);
  });

  it("merges cumulative recognition chunks without duplication", () => {
    let acc = "";
    acc = appendFinalChunk(acc, "I am going to give a talk");
    acc = appendFinalChunk(acc, "I am going to give a talk about school");
    expect(countWords(acc)).toBe(9);
  });

  it("collapses duplicated recognition tail", () => {
    const dup =
      "I want to tell you about my school I want to tell you about my school and my friends";
    const collapsed = collapseDuplicateTail(dup);
    expect(collapsed).toBe("I want to tell you about my school and my friends");
  });

  it("trims garbage after outro phrase", () => {
    const raw =
      "my talk about holidays thank you for your attention you know offline Disney owns random noise";
    const trimmed = trimTranscriptAtOutro(raw);
    expect(trimmed).toBe("my talk about holidays thank you for your attention");
    expect(trimmed).not.toContain("Disney");
  });

  it("keeps the full exam outro instead of cutting at an early phrase", () => {
    const trimmed = trimTranscriptAtOutro(sample);
    expect(trimmed).toContain("that is all I wanted to say");
    expect(trimmed).toContain("thank you for listening");
  });

  it("does not trim mid-speech phrases that look like an outro", () => {
    const raw = "I like school that is all about sports and friends moreover we have clubs";
    expect(trimTranscriptAtOutro(raw)).toBe(raw);
  });

  it("splits long unpunctuated transcript into sentences", () => {
    const sentences = splitSentencesHeuristic(sample);
    expect(sentences.length).toBeGreaterThan(1);
  });

  it("builds filler buckets within duration", () => {
    const buckets = buildFillerBuckets(
      [
        { second: 5, word: "um" },
        { second: 15, word: "like" },
        { second: 95, word: "uh" },
      ],
      90
    );
    expect(buckets).toHaveLength(9);
    expect(buckets[9]).toBeUndefined();
  });

  it("lists specific filler words with counts", () => {
    const text = "um I think like school is um good you know";
    const occurrences = findFillerOccurrences(text);
    expect(occurrences).toEqual(["um", "like", "um", "you know"]);
    const breakdown = summarizeFillerCounts(occurrences);
    expect(breakdown).toContainEqual({ word: "um", count: 2 });
    expect(breakdown).toContainEqual({ word: "you know", count: 1 });
  });

  it("analyzes frozen session without post-recording noise", () => {
    const noisy =
      sample + " you know offline Disney owns just she died mama moving chap";
    const result = analyzeSpeechOffline(noisy, 92, {
      pauseEvents: [10, 20, 95],
      fillerTimeline: [
        { second: 8, word: "um" },
        { second: 100, word: "uh" },
      ],
    });
    expect(result).not.toBeNull();
    expect(result!.cleanedTranscript).toContain("thank you for listening");
    expect(result!.cleanedTranscript).not.toContain("Disney");
    expect(result!.wordCount).toBeGreaterThan(25);
    expect(result!.wordCount).toBeLessThan(50);
    expect(result!.longPauseCount).toBe(2);
    expect(result!.fillerTimeline.every((e) => e.second <= 92)).toBe(true);
    expect(result!.fillerCount).toBeGreaterThanOrEqual(1);
    expect(result!.sentenceCount).toBeGreaterThan(1);
    expect(result!.wpm).toBeGreaterThan(0);
  });

  it("returns null for empty or invalid sessions", () => {
    expect(analyzeSpeechOffline("", 60)).toBeNull();
    expect(analyzeSpeechOffline("hello world", 0)).toBeNull();
  });
});
