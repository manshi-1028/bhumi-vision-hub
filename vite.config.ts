// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Serve the SPA shell for every path: client-only rendering with the
    // shell prerendered at build time (no server runtime needed to deploy).
    spa: { enabled: true },
  },
  // Static-hosting build (bun run build:static): skip Nitro entirely and emit
  // the client bundle straight into dist/ (Freebuff static hosting copies
  // dist/*). Default builds keep Nitro SSR output in .output/.
  ...(process.env["FREEBUFF_STATIC_BUILD"]
    ? {
        nitro: false as const,
        vite: {
          build: {
            outDir: "dist",
            emptyOutDir: true,
          },
          environments: {
            client: { build: { outDir: "dist" } },
          },
        },
      }
    : {}),
});
