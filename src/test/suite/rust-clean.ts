import * as assert from "assert";

suite("Resolver Tests", () => {
  test("Should extract correct module path for nested files", async () => {
    // Mock the logic used in performDeepFSSearch
    const relativePath = "src/ui/components/buttons.rs";
    let modulePath = relativePath.replace("src/", "").replace(".rs", "").replace(/\//g, "::");

    assert.strictEqual(modulePath, "ui::components::buttons");
  });

  test("Should extract correct module path for mod.rs", async () => {
    const relativePath = "src/ui/mod.rs";
    let modulePath = relativePath
      .replace("src/", "")
      .replace(".rs", "")
      .replace(/\/mod$/, "")
      .replace(/\//g, "::");

    assert.strictEqual(modulePath, "ui");
  });
});
