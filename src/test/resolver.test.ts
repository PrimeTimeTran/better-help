import { vi, describe, it, expect, suite } from "vitest";
import { getCratePath, needsModuleDeclaration } from "../logger.js";
import { getUpdatedFileContent } from "../features/rust-cleaner.js";

// Mock vscode as a complete object chain
vi.mock("vscode", () => ({
  window: {
    createOutputChannel: vi.fn().mockReturnValue({
      appendLine: vi.fn(),
      info: vi.fn(),
    }),
    showInformationMessage: vi.fn(),
  },
  workspace: {
    asRelativePath: vi.fn((uri) => uri.path.replace("/project/", "")),
    findFiles: vi.fn().mockResolvedValue([]),
    fs: {
      readFile: vi.fn(),
    },
    openTextDocument: vi.fn(),
    applyEdit: vi.fn(),
  },
  Uri: {
    file: (path: string) => ({ path }),
  },
  Position: class {
    constructor(
      public line: number,
      public character: number,
    ) {}
  },
  WorkspaceEdit: class {
    insert = vi.fn();
    delete = vi.fn();
  },
}));

suite("Resolver Unit Test Suite", () => {
  // --- getCratePath Tests ---
  describe("getCratePath()", () => {
    it("resolves basic path", () => {
      // We pass the relative file path as a string
      expect(getCratePath("src/ui/buttons.rs")).toBe("ui::buttons");
    });

    it("resolves main entry point", () => {
      expect(getCratePath("src/main.rs")).toBe("main");
    });

    it("handles mod file handling (stripping /mod)", () => {
      expect(getCratePath("src/ui/mod.rs")).toBe("ui");
    });

    it("resolves deep nesting", () => {
      expect(getCratePath("src/components/auth/login.rs")).toBe("components::auth::login");
    });

    it("resolves root level lib file", () => {
      expect(getCratePath("src/lib.rs")).toBe("lib");
    });
  });

  // --- needsModuleDeclaration Tests ---
  describe("ensureModuleDeclaration logic", () => {
    it("identifies missing mod declaration", () => {
      const content = "use crate::logger;";
      expect(needsModuleDeclaration(content, "ui")).toBe(true);
    });

    it("detects existing mod declaration", () => {
      const content = "pub mod ui;\nuse crate::other;";
      expect(needsModuleDeclaration(content, "ui")).toBe(false);
    });

    it("handles whitespace variations", () => {
      const content = "pub    mod    ui    ;";
      expect(needsModuleDeclaration(content, "ui")).toBe(false);
    });

    it("does not false-positive on similarly named modules", () => {
      const content = "pub mod ui_components;";
      // 'ui' should be missing, even if 'ui_components' exists
      expect(needsModuleDeclaration(content, "ui")).toBe(true);
    });
  });

  // --- smartUpdateImport Tests ---
  describe("smartUpdateImport logic", () => {
    const newImport = "use crate::ui::buttons::run_agent_loop;";
    const symbol = "run_agent_loop";

    it("adds a fresh import at the top", () => {
      const content = "fn main() {}";
      const result = getUpdatedFileContent(content, newImport, symbol);
      expect(result).toBe(`${newImport}\nfn main() {}`);
    });

    it("replaces an incorrect import path", () => {
      const content = "use crate::old::path::run_agent_loop;\nfn main() {}";
      const result = getUpdatedFileContent(content, newImport, symbol);
      expect(result).toBe(`${newImport}\nfn main() {}`);
    });

    it("preserves other imports", () => {
      const content = "use crate::other::Symbol;\nfn main() {}";
      const result = getUpdatedFileContent(content, newImport, symbol);
      // Should contain both
      expect(result).toContain("use crate::other::Symbol;");
      expect(result).toContain(newImport);
    });
  });

  describe("smartUpdateImport logic", () => {
    const symbol = "run_agent_loop";
    const newImport = "use crate::ui::buttons::run_agent_loop;";

    it("1. inserts a fresh import when none exists", () => {
      const content = "fn main() {\n  println!('hi');\n}";
      const result = getUpdatedFileContent(content, newImport, symbol);

      expect(result).toBe(`${newImport}\n${content}`);
    });

    it("2. replaces an incorrect path with the correct one", () => {
      const content = "use crate::old::path::run_agent_loop;\nfn main() {}";
      const result = getUpdatedFileContent(content, newImport, symbol);

      expect(result).toBe(`${newImport}\nfn main() {}`);
    });

    it("3. preserves other unrelated imports", () => {
      const content = "use crate::other::Logger;\nfn main() {}";
      const result = getUpdatedFileContent(content, newImport, symbol);

      expect(result).toContain("use crate::other::Logger;");
      expect(result).toContain(newImport);
    });

    it("4. does nothing if the correct import already exists", () => {
      const content = "use crate::ui::buttons::run_agent_loop;\nfn main() {}";
      const result = getUpdatedFileContent(content, newImport, symbol);

      // The content should remain identical if the import is already correct
      expect(result).toBe(content);
    });
  });
});
