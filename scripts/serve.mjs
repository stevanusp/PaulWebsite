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
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".m4a": "audio/mp4",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function resolve(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    return null; // a malformed escape is simply not found, not a crash
  }
  const clean = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
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
  const extra = { "Accept-Ranges": "bytes" };

  // Media needs byte ranges: Safari will not play audio without them, and seeking relies on them.
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
  if (file && range && !COMPRESSIBLE.has(extname(path))) {
    const size = body.length;
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) {
      res.writeHead(416, { ...headers, "Content-Range": `bytes */${size}` });
      res.end();
      return;
    }
    res.writeHead(206, {
      ...headers,
      ...extra,
      "Content-Type": TYPES[extname(path)] || "application/octet-stream",
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": end - start + 1,
      "Cache-Control": "no-cache",
    });
    res.end(body.subarray(start, end + 1));
    return;
  }

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
