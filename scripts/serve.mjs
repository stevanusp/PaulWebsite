// Local preview of the exported site with the same security headers as production.
// Usage: npm run build && npm run preview  (then open http://localhost:4173)

import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = "out";
const PORT = Number(process.env.PORT || 4173);
const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const headers = Object.fromEntries(
  vercel.headers.find((h) => h.source === "/(.*)").headers.map((h) => [h.key, h.value]),
);
delete headers["Strict-Transport-Security"]; // not meaningful on plain http://localhost

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const candidates = [clean, `${clean}.html`, join(clean, "index.html")];
  for (const c of candidates) {
    const full = join(ROOT, c);
    if (full.startsWith(ROOT) && existsSync(full) && statSync(full).isFile()) return full;
  }
  return null;
}

const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".txt", ".svg", ".xml", ".webmanifest"]);

createServer((req, res) => {
  const file = resolve(req.url || "/");
  const status = file ? 200 : 404;
  const path = file || join(ROOT, "404.html");
  let body = readFileSync(path);
  const extra = {};
  // Compress like the production CDN does, so local Lighthouse runs are representative.
  if (COMPRESSIBLE.has(extname(path)) && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
    body = gzipSync(body, { level: 9 });
    extra["Content-Encoding"] = "gzip";
    extra["Vary"] = "Accept-Encoding";
  }
  res.writeHead(status, {
    ...headers,
    ...extra,
    "Content-Type": TYPES[extname(path)] || "application/octet-stream",
    "Cache-Control": path.includes("/_next/static/") ? "public, max-age=31536000, immutable" : "no-cache",
  });
  res.end(body);
}).listen(PORT, () => {
  console.log(`preview: http://localhost:${PORT}`);
});
