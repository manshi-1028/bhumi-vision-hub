// Post-build step for FREEBUFF_STATIC_BUILD=1 (bun run build:static).
//
// TanStack Start's client build emits the SPA shell as `_shell.html` and a
// server-environment bundle we don't need on static hosting. This normalizes
// dist/ for static hosts:
//   dist/_shell.html -> dist/index.html
//   dist/server/     -> removed (unused without a server runtime)
import { existsSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
const shell = join(dist, "_shell.html");
const indexHtml = join(dist, "index.html");

if (!existsSync(dist)) {
  console.error(`[make-static-dist] ${dist} not found — run the build first.`);
  process.exit(1);
}

if (existsSync(shell)) {
  rmSync(indexHtml, { force: true });
  renameSync(shell, indexHtml);
  console.log("[make-static-dist] _shell.html -> index.html");
}

if (existsSync(join(dist, "client"))) {
  console.warn("[make-static-dist] unexpected dist/client — client outDir override is not active.");
}

rmSync(join(dist, "server"), { recursive: true, force: true });

if (!existsSync(indexHtml)) {
  console.error("[make-static-dist] dist/index.html missing after build.");
  process.exit(1);
}
console.log("[make-static-dist] dist/ ready for static hosting.");
