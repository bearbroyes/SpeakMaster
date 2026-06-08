import { describe, expect, it } from "vitest";
import {
  analyzeSpeechOffline,
  appendFinalChunk,
  buildFillerBuckets,
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

  it("trims garbage after outro phrase", () => {
    const raw =
      "my talk about holidays thank you for your attention you know offline Disney owns random noise";
    const trimmed = trimTranscriptAtOutro(raw);
    expect(trimmed).toBe("my talk about holidays thank you for your attention");
    expect(trimmed).not.toContain("Disney");
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
    const prepared = prepareTranscriptForAnalysis(noisy, 92);
    const result = analyzeSpeechOffline(prepared, 92, {
      pauseEvents: [10, 20, 95],
      fillerTimeline: [
        { second: 8, word: "um" },
        { second: 100, word: "uh" },
      ],
    });
    expect(result).not.toBeNull();
    expect(result!.wordCount).toBeLessThan(50);
    expect(result!.longPauseCount).toBe(2);
    expect(result!.fillerTimeline.every((e) => e.second <= 92)).toBe(true);
    expect(result!.sentenceCount).toBeGreaterThan(1);
  });
});
