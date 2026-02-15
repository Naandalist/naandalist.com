import { describe, expect, test } from "bun:test";

import { detectLanguage, getAlternateLanguagePath } from "../src/utils/language";

describe("language utilities", () => {
  test("detects Indonesian only when /id is a path segment", () => {
    expect(detectLanguage("/")).toBe("en");
    expect(detectLanguage("/id")).toBe("id");
    expect(detectLanguage("/id/posts")).toBe("id");
    expect(detectLanguage("/ideas")).toBe("en");
    expect(detectLanguage("/idaho")).toBe("en");
  });

  test("builds alternate path from Indonesian to English", () => {
    expect(getAlternateLanguagePath("/id/posts", "id")).toBe("/posts");
    expect(getAlternateLanguagePath("/id", "id")).toBe("/");
  });

  test("builds alternate path from English to Indonesian", () => {
    expect(getAlternateLanguagePath("/", "en")).toBe("/id/");
    expect(getAlternateLanguagePath("/projects", "en")).toBe("/id/projects");
  });
});
