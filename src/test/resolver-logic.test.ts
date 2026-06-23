// test/resolver-logic.test.ts
import { describe, it, expect } from "vitest";
import { isDefinition, resolveSymbolLocation, FileSystemReader, FileSystem } from "../resolver";
import { getUpdatedFileContent } from "../features/rust-cleaner";

// Create a helper that implements the interface
class MockFileSystem implements FileSystemReader {
  constructor(private files: Record<string, string>) {}

  async read(path: string): Promise<string> {
    return this.files[path] || "";
  }

  async listAllFiles(): Promise<string[]> {
    return Object.keys(this.files);
  }
}

const mockFs = new MockFileSystem({
  "/src/main.rs": "fn main() {}",
  "/src/utils/agent.rs": "pub fn run_agent_loop() {}",
  "/src/lib.rs": "pub mod utils;",
});

describe("Symbol Scoring and Resolution", () => {
  const symbol = "run_agent_loop";

  describe("isDefinition (The Detector)", () => {
    it("identifies real definitions", () => {
      expect(isDefinition("pub async fn run_agent_loop() {}", symbol)).toBe(true);
      expect(isDefinition("fn run_agent_loop() {}", symbol)).toBe(true);
    });

    it("ignores comments", () => {
      expect(isDefinition("// fn run_agent_loop() {}", symbol)).toBe(false);
      expect(isDefinition("/// fn run_agent_loop() {}", symbol)).toBe(false);
    });
  });

  describe("resolveSymbolLocation (The Scanner)", () => {
    it("picks the real definition over commented-out ones", async () => {
      const mockFiles: Record<string, string> = {
        "/src/main.rs": `
        // fn run_agent_loop() {} 
        fn main() {}
        pub fn run_agent_loop() {} // The real one
      `,
      };

      // Create a mock provider
      const mockFs: FileSystem = {
        readFile: async (path: string) => mockFiles[path] || "",
      };

      const result = await resolveSymbolLocation(["/src/main.rs"], "run_agent_loop", mockFs);
      expect(result).toBe("/src/main.rs");
    });
  });

  describe("Import Reconciliation", () => {
    it("cleans up multiple conflicting imports", () => {
      const content = `use crate::a::run_agent_loop;
use crate::b::{Logger, run_agent_loop};
fn main() {}`;

      const newImport = "use crate::correct::path::run_agent_loop;";
      const result = getUpdatedFileContent(content, newImport, symbol);

      const matches = result.match(/use crate::.*run_agent_loop;/g);
      expect(matches?.length).toBe(1);
      expect(result).toContain(newImport);
      expect(result).not.toContain("crate::a::");
    });
  });
});
