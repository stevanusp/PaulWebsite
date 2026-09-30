// Post-build: give every exported page a strict, hash-based Content Security Policy.
// Each inline <script> or <style> block gets a SHA-256 hash; nothing inline runs without one.
// The build fails if a page contains an inline style attribute or an inline event handler,
// because a strict policy would silently break them.

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";

function htmlFiles(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files.push(...htmlFiles(full));
    else if (name.endsWith(".html")) files.push(full);
  }
  return files;
}

const sha = (text) => `'sha256-${createHash("sha256").update(text, "utf8").digest("base64")}'`;

let pages = 0;
for (const file of htmlFiles(OUT)) {
  let html = readFileSync(file, "utf8");
  if (html.includes('http-equiv="Content-Security-Policy"')) continue;

  if (/<[a-z][^>]*\sstyle="/i.test(html)) throw new Error(`${file}: inline style attribute found`);
  if (/<[a-z][^>]*\son[a-z]+=/i.test(html)) throw new Error(`${file}: inline event handler found`);

  const scripts = new Set();
  for (const m of html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (m[1]) scripts.add(sha(m[1]));
  }
  const styles = new Set();
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    if (m[1]) styles.add(sha(m[1]));
  }

  const policy = [
    "default-src 'self'",
    `script-src 'self' ${[...scripts].join(" ")}`.trim(),
    `style-src 'self' ${[...styles].join(" ")}`.trim(),
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self'",
    "manifest-src 'self'",
    "worker-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");

  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}"/>`;
  const next = html.replace(/<meta charSet="utf-8"\/>/i, (m) => m + meta);
  if (next === html) throw new Error(`${file}: could not find <meta charset> to anchor the policy`);
  writeFileSync(file, next);
  pages++;
  console.log(`csp: ${file} (${scripts.size} inline scripts, ${styles.size} inline styles)`);
}
console.log(`csp: ${pages} page(s) protected`);
