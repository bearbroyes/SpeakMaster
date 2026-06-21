import { describe, it, expect } from "vitest";
import { formatProfileNameForFilename, hasProfileName } from "./profile";

describe("formatProfileNameForFilename", () => {
  it("returns empty when profile is null", () => {
    expect(formatProfileNameForFilename(null)).toBe("");
  });

  it("returns empty when both names are blank", () => {
    expect(formatProfileNameForFilename({ firstName: "  ", lastName: "" })).toBe("");
  });

  it("uses only first name when last name is missing", () => {
    expect(formatProfileNameForFilename({ firstName: "Ivan", lastName: "" })).toBe("Ivan");
  });

  it("uses only last name when first name is missing", () => {
    expect(formatProfileNameForFilename({ firstName: "", lastName: "Petrov" })).toBe("Petrov");
  });

  it("joins first and last name", () => {
    expect(formatProfileNameForFilename({ firstName: "Ivan", lastName: "Petrov" })).toBe("Ivan_Petrov");
  });

  it("sanitizes spaces in names", () => {
    expect(formatProfileNameForFilename({ firstName: "Anna Maria", lastName: "Smith" })).toBe(
      "Anna_Maria_Smith"
    );
  });
});

describe("hasProfileName", () => {
  it("detects when a profile has a usable name", () => {
    expect(hasProfileName({ firstName: "Ivan", lastName: "" })).toBe(true);
    expect(hasProfileName(null)).toBe(false);
  });
});
