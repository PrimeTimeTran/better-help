import { describe, expect, it, test } from "vitest";

import { sortLines } from "../features/sortLines.js";

describe("Sort Lines Logic", () => {
  test("should group directories before files", () => {
    const input = ["README.md", ".vscode/", "src/", ".gitignore"];
    const result = sortLines(input);

    expect(result[0]).toContain("/");
    expect(result[1]).toContain("/");
    expect(result[2]).not.toContain("/");
    expect(result[3]).not.toContain("/");
  });

  test("should remove duplicate entries", () => {
    const input = ["node_modules/", "node_modules/", "src/"];
    const result = sortLines(input);
    expect(result.length).toBe(2);
  });

  test("should remove empty lines", () => {
    const input = ["src/", "", "  ", "README.md"];
    const result = sortLines(input);
    expect(result).toEqual(["src/", "README.md"]);
  });

  test("should handle JSON-style key strings correctly", () => {
    const input = ['"node_modules": true,', '"src": true,', '"README.md": true,'];
    const result = sortLines(input);
    expect(result[0]).toContain("node_modules");
    expect(result[2]).toContain("README.md");
  });
  test("should sort numerically (natural sort)", () => {
    const input = ["file10.txt", "file2.txt", "file1.txt"];
    const result = sortLines(input);
    // Should be 1, 2, 10
    expect(result).toEqual(["file1.txt", "file2.txt", "file10.txt"]);
  });

  test("should be case-insensitive but maintain consistency", () => {
    const input = ["B.txt", "a.txt"];
    const result = sortLines(input);
    // Alphabetical order: a, b
    expect(result).toEqual(["a.txt", "B.txt"]);
  });

  test("should handle nested directory paths correctly", () => {
    const input = ["a/b/c/", "a/b/", "a/"];
    const result = sortLines(input);
    // Should sort by depth or alphabetical path
    expect(result).toEqual(["a/", "a/b/", "a/b/c/"]);
  });
});
