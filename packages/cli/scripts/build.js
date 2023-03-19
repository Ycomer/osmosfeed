require("esbuild")
  .build({
    platform: "node",
    entryPoints: ["src/main.ts"],
    sourcemap: true,
    bundle: true,
    target: "node16",
    outfile: "bin/main.js",
  })
  .catch(() => process.exit(1));