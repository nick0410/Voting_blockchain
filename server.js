/**
 * Simple HTTP server to serve the frontend
 * Run: node server.js
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Serve files
  let filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
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
  console.log(`╚════════════════════════════════════════════════════════╝\n`);
  console.log(`✓ Server running at http://localhost:${PORT}`);
  console.log(`✓ Open http://localhost:${PORT} in your browser`);
  console.log(`✓ Make sure Hardhat node is running: npm run node\n`);
});
