import { describe, expect, it } from "vitest";
import { OpenAIError } from "./openai";

describe("OpenAIError hints", () => {
  it("stores hint for UI", () => {
    const err = new OpenAIError("blocked", "NETWORK", "use proxy");
    expect(err.hint).toBe("use proxy");
    expect(err.name).toBe("OpenAIError");
  });
});
