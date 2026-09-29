// Minimal local server: serves the static site and mounts every Netlify
// Function at its configured path, so the page can be tested without the
// Netlify CLI. Needs ANTHROPIC_API_KEY (or ANTHROPIC_BASE_URL for a stub).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 8888);

globalThis.Netlify = { env: { get: (k) => process.env[k] } };

const routes = new Map();
const fnDir = path.join(root, "netlify/functions");
for (const file of fs.readdirSync(fnDir).filter((f) => f.endsWith(".mts"))) {
  const mod = await import(pathToFileURL(path.join(fnDir, file)).href);
  if (mod.config?.path) routes.set(mod.config.path, mod.default);
}

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".md": "text/markdown" };

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const handler = routes.get(url.pathname);
    if (handler) {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const request = new Request(url, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks) });
      const response = await handler(request);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    let file = path.join(root, url.pathname === "/" ? "index.html" : url.pathname);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`Local: http://localhost:${port}  (${routes.size} functions mounted)`));
