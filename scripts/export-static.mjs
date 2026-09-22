#!/usr/bin/env node
/**
 * Copy the client static output into `dist/` so Cloudflare Pages can host it.
 * TanStack Start + Nitro (Vercel preset) writes the browser assets to
 * `.vercel/output/static`; SPA prerender may also write `dist/client`.
 *
 * Strips grok.com scripts so the hosted site loads no third-party Grok chrome.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
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

function walkFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const next = join(dir, name);
    if (statSync(next).isDirectory()) walkFiles(next, acc);
    else acc.push(next);
  }
  return acc;
}

/** Remove any script whose src is grok.com so the static host never loads it. */
export function stripGrokScripts(html) {
  return String(html).replace(
    /<script\b[^>]*\bsrc\s*=\s*["']https:\/\/grok\.com[^"']*["'][^>]*>\s*<\/script>/gi,
    "",
  );
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

for (const file of walkFiles(tmp)) {
  if (!file.endsWith(".html")) continue;
  const before = readFileSync(file, "utf8");
  const after = stripGrokScripts(before);
  if (after !== before) writeFileSync(file, after);
}

rmSync(DEST, { recursive: true, force: true });
mkdirSync(dirname(DEST), { recursive: true });
cpSync(tmp, DEST, { recursive: true });
rmSync(tmp, { recursive: true, force: true });

if (!existsSync(join(DEST, "index.html"))) {
  console.error("[export-static] dist/index.html missing after copy");
  process.exit(1);
}

const leftover = walkFiles(DEST).filter((file) => {
  if (!/\.(html|js|mjs|css)$/.test(file)) return false;
  const text = readFileSync(file, "utf8");
  return /<script\b[^>]*src=["']https:\/\/grok\.com/i.test(text);
});
if (leftover.length > 0) {
  console.error("[export-static] grok.com scripts remain in", leftover);
  process.exit(1);
}

console.log(`[export-static] ${src.replace(ROOT + "/", "")} → dist`);
