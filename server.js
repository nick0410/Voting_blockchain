/**
 * Simple HTTP server to serve the frontend
 * Run: node server.js
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5000;
const BASE_DIR = process.cwd();

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Parse URL without query parameters
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Handle directory listing for deployments
  if (pathname === "/deployments/") {
    const deploymentsDir = path.join(BASE_DIR, "deployments");
    fs.readdir(deploymentsDir, (err, files) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Deployments directory not found" }));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ files }));
    });
    return;
  }

  // Serve files
  let filePath = path.join(BASE_DIR, pathname === "/" ? "index.html" : pathname);

  // Prevent directory traversal attacks
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { "Content-Type": "text/html" });
    res.end("<h1>403 - Forbidden</h1>");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (pathname === "/" || pathname === "/index.html") {
        console.error(`Critical: index.html not found at ${filePath}`);
      }
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>404 - File Not Found</h1>");
      return;
    }

    // Determine content type
    const ext = path.extname(filePath);
    let contentType = "text/html";
    if (ext === ".js") contentType = "application/javascript";
    if (ext === ".json") contentType = "application/json";
    if (ext === ".css") contentType = "text/css";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════════════╗`);
  console.log(`║        Voting System Frontend Server                   ║`);
  console.log(`���════════════════════════════════════════════════════════╝\n`);
  console.log(`✓ Server running at http://localhost:${PORT}`);
  console.log(`✓ Open http://localhost:${PORT} in your browser`);
  console.log(`✓ Make sure Hardhat node is running: npm run node\n`);
});
