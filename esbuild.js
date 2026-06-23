import esbuild from "esbuild";

const bundleBuild = process.argv.includes("--bundle-build");

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node18",
    external: ["vscode"],
    sourcemap: true,
    minify: false,
    outfile: "dist/extension.js",
    logLevel: "info",
  });

  if (bundleBuild) {
    console.log("Building...");
    await ctx.rebuild();
    await ctx.dispose();

    console.log("Build complete");
    return;
  }

  console.log("Watching");
  await ctx.watch();
  console.log("Watching for changes...");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
