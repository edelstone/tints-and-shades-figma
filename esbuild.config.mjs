import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const options = {
  entryPoints: ["code.ts"],
  outfile: "code.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es6"],
  logLevel: "info"
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
} else {
  await esbuild.build(options);
}
