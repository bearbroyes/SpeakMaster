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
  const monologue = { id: 4, title: "MONOLOGUE 04", theme: "travelling", points: [] as string[] };

  it("includes monologue id and theme", () => {
    const name = buildRecordingFilename(monologue, "audio/webm");
    expect(name).toContain("Monologue_04");
    expect(name).toContain("travelling");
    expect(name).toMatch(/\.webm$/);
  });

  it("includes profile name when provided", () => {
    const name = buildRecordingFilename(monologue, "audio/webm", {
      firstName: "Ivan",
      lastName: "Petrov",
    });
    expect(name).toContain("Ivan_Petrov");
  });

  it("includes only first name when last name is empty", () => {
    const name = buildRecordingFilename(monologue, "audio/webm", {
      firstName: "Ivan",
      lastName: "",
    });
    expect(name).toContain("_Ivan_");
    expect(name).not.toContain("Petrov");
  });

  it("omits profile segment when profile is empty", () => {
    const withProfile = buildRecordingFilename(monologue, "audio/webm", {
      firstName: "Ivan",
      lastName: "Petrov",
    });
    const withoutProfile = buildRecordingFilename(monologue, "audio/webm", null);
    expect(withProfile.split("_").length).toBeGreaterThan(withoutProfile.split("_").length);
  });
});
