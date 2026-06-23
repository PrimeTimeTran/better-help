import { defineConfig } from "vitest/config";

// @vscode/test-cli: Use this for "Integration" tests (e.g., testing if an actual
// WorkspaceEdit correctly modifies a file, or if a command triggers correctly).
// These are slower because they boot up the VS Code editor.

// vitest: Use this for "Pure Logic" tests (like getCratePath or smartUpdateImport).
// These are fast, run entirely in Node.js, and do not need the VS Code API.

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["src/test/setup.ts"],
    exclude: ["src/test/extension.test.ts", "node_modules"],
  },
});
