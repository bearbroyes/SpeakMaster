import { describe, it, expect } from "vitest";
import { buildRecordingFilename, mimeToExtension } from "./filename";

describe("mimeToExtension", () => {
  it("maps webm", () => {
    expect(mimeToExtension("audio/webm")).toBe("webm");
  });

  it("maps ogg", () => {
    expect(mimeToExtension("audio/ogg")).toBe("ogg");
  });
});

describe("buildRecordingFilename", () => {
  it("includes monologue id and theme", () => {
    const name = buildRecordingFilename(
      { id: 4, title: "MONOLOGUE 04", theme: "travelling", points: [] },
      "audio/webm"
    );
    expect(name).toContain("Monologue_04");
    expect(name).toContain("travelling");
    expect(name).toMatch(/\.webm$/);
  });
});
