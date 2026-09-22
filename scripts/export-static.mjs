#!/usr/bin/env node
/**
 * Copy the client static output into `dist/` so Cloudflare Pages can host it.
 * TanStack Start + Nitro (Vercel preset) writes the browser assets to
 * `.vercel/output/static`; SPA prerender may also write `dist/client`.
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEST = join(ROOT, "dist");

const candidates = [
  join(ROOT, ".vercel/output/static"),
  join(ROOT, "dist/client"),
  join(ROOT, ".output/public"),
];

function hasHtml(dir) {
  return existsSync(join(dir, "index.html")) || existsSync(join(dir, "_shell.html"));
}

function hasAssets(dir) {
  return existsSync(join(dir, "assets")) || hasHtml(dir);
}

const src = candidates.find((p) => existsSync(p) && hasAssets(p));
if (!src) {
  console.error("[export-static] no static output found (looked in .vercel/output/static, dist/client, .output/public)");
  process.exit(1);
}

const tmp = join(ROOT, ".grok", "dist-export");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
cpSync(src, tmp, { recursive: true });

if (!existsSync(join(tmp, "index.html")) && existsSync(join(tmp, "_shell.html"))) {
  cpSync(join(tmp, "_shell.html"), join(tmp, "index.html"));
}

if (!existsSync(join(tmp, "_redirects"))) {
  writeFileSync(join(tmp, "_redirects"), "/*    /index.html   200\n");
}

rmSync(DEST, { recursive: true, force: true });
mkdirSync(dirname(DEST), { recursive: true });
cpSync(tmp, DEST, { recursive: true });
rmSync(tmp, { recursive: true, force: true });

if (!existsSync(join(DEST, "index.html"))) {
  console.error("[export-static] dist/index.html missing after copy");
  process.exit(1);
}

console.log(`[export-static] ${src.replace(ROOT + "/", "")} → dist`);
