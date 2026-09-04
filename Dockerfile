# --- build stage ---
FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- production stage ---
FROM node:20-alpine

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY <<'server.js' /app/server.js
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const DIST = new URL("./dist", import.meta.url).pathname;

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "font/eot",
  ".otf": "font/otf",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".txt": "text/plain",
};

async function serve(req, res) {
  let url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = join(DIST, url.pathname);

  // try the file, then fall back to index.html for SPA routing
  let file;
  try {
    file = await readFile(filePath);
  } catch {
    file = await readFile(join(DIST, "index.html"));
    res.setHeader("Content-Type", "text/html");
  }

  if (!res.getHeader("Content-Type")) {
    res.setHeader("Content-Type", MIME[extname(filePath)] ?? "application/octet-stream");
  }

  res.setHeader("Cache-Control", extname(filePath) === ".html" ? "no-cache" : "public, max-age=31536000, immutable");
  res.end(file);
}

const HOST = process.env.HOST ?? "0.0.0.0";
const PORT = parseInt(process.env.PORT ?? "3000", 10);

createServer(serve).listen(PORT, HOST, () => {
  console.log(`http://${HOST}:${PORT}`);
});
server.js

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
