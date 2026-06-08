import { describe, expect, it } from "vitest";
import { GeminiError } from "./gemini";

describe("GeminiError hints", () => {
  it("is constructible with hint", () => {
    const err = new GeminiError("blocked", "PERMISSION_DENIED", "add referrer");
    expect(err.hint).toBe("add referrer");
    expect(err.message).toBe("blocked");
  });
});
